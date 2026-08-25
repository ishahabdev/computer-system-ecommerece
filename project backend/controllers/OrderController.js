import { Op } from "sequelize";

import { database } from "../config/database.js";
import Order from "../model/orderModel.js";
import Product from "../model/productModel.js";
import User from "../model/userModel.js";

// Orders in these states never change again, so the scheduler can skip them.
const TERMINAL_STATUSES = ["delivered", "cancelled"];

const normalizeStoredStatus = (status) => {
  const normalizedStatus = String(status || "").toLowerCase().trim();
  if (normalizedStatus === "cancelled") return "cancelled";
  if (normalizedStatus === "delivered") return "delivered";
  if (normalizedStatus === "on delivery") return "on delivery";
  if (normalizedStatus === "shipping" || normalizedStatus === "shipped" || normalizedStatus === "confirmed") {
    return "shipping";
  }
  return "packing";
};

const getLiveOrderStatus = (order) => {
  if (!order) return "packing";

  const storedStatus = normalizeStoredStatus(order.status);
  if (storedStatus === "cancelled" || storedStatus === "delivered") return storedStatus;

  const orderDate = new Date(order.createdAt);
  if (isNaN(orderDate.getTime())) return storedStatus;

  const minutesSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60));

  // Safety guard: if createdAt somehow resolves to the future (clock skew,
  // timezone mismatch between app/server and DB) or shows an implausibly
  // large gap for a brand-new order, don't silently jump the order all the
  // way to "delivered". Log it so a timezone bug gets noticed, not hidden.
  if (minutesSinceOrder < 0) {
    console.warn(
      `getLiveOrderStatus: order ${order.id} createdAt (${order.createdAt}) is in the future ` +
      `relative to server time. Check DB/Sequelize timezone config. Falling back to stored status.`
    );
    return storedStatus;
  }

  // Auto-progress on a 10-minute-per-step timeline:
  // 0-10 min → packing, 10-20 min → shipping, 20-30 min → on delivery, 30 min+ → delivered
  if (minutesSinceOrder >= 30) return "delivered";
  if (minutesSinceOrder >= 20) return "on delivery";
  if (minutesSinceOrder >= 10) return "shipping";
  return "packing";
};

const syncLiveOrderStatus = async (order) => {
  if (!order) return null;

  // Never auto-progress an order the admin has manually set — otherwise the
  // scheduler (or the next read) silently overwrites the admin's choice with
  // the time-based simulation.
  if (order.isManuallySet) return order;

  const liveStatus = getLiveOrderStatus(order);
  if (order.status !== liveStatus) {
    order.status = liveStatus;
    await order.save();
  }

  return order;
};

const syncLiveOrderStatuses = async (orders) => {
  return Promise.all(orders.map((order) => syncLiveOrderStatus(order)));
};

// Advance every still-active order to its live status on the 10-minute-per-step
// timeline and persist any change. This is what the background scheduler calls,
// so the stored status keeps moving (packing -> shipping -> on delivery ->
// delivered) even when nobody is actively fetching the orders. Without this the
// DB status only updates on read and appears frozen until someone loads it.
export const syncActiveOrderStatuses = async () => {
  const activeOrders = await Order.findAll({
    where: {
      status: { [Op.notIn]: TERMINAL_STATUSES },
      isManuallySet: false, // skip orders an admin has manually overridden
    },
  });
  await syncLiveOrderStatuses(activeOrders);
  return activeOrders.length;
};

// CREATE ORDER (customer places an order at checkout)
//
// A cart line item stores the *cart* id as productId. Real catalog products send
// the bare integer products-table id (Store/ProductDetail pass `dbId` into the
// cart, see context/CartContext.jsx), but be liberal in what we accept: also
// handle a numeric string and the store's "db-<id>" routing form. Demo/legacy
// products carry ids that parse to a number but match no products-table row —
// those have no stock to track and are simply skipped.
const parseCatalogProductId = (raw) => {
  if (typeof raw === "number") return Number.isInteger(raw) && raw > 0 ? raw : null;
  if (typeof raw === "string") {
    const value = raw.startsWith("db-") ? raw.slice(3) : raw;
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
};

// Sum the ordered quantity per real catalog product. Shared by create (reserve)
// and cancel/delete (restore) so every path reads an order's line items the same
// way: skip items that map to no catalog row, coerce the quantity, and add
// duplicated ids together.
const sumOrderedByProduct = (products) => {
  const lineItems = Array.isArray(products) ? products : [];
  const orderedByProduct = new Map();
  for (const item of lineItems) {
    const productId = parseCatalogProductId(item?.productId);
    const quantity = Number(item?.quantity);
    if (productId === null || !Number.isFinite(quantity) || quantity <= 0) continue;
    orderedByProduct.set(productId, (orderedByProduct.get(productId) || 0) + quantity);
  }
  return orderedByProduct;
};

// Resolve the order's real, time-aware status the same way the read paths do:
// an admin/cancel override is authoritative, otherwise fall back to the
// 10-minute timeline. Used to decide whether an order still holds stock.
const resolveLiveStatus = (order) =>
  order.isManuallySet ? normalizeStoredStatus(order.status) : getLiveOrderStatus(order);

// Reserve (deduct) stock for an order's items, all-or-nothing. Each product row
// is locked FOR UPDATE so two checkouts can't both sell the same last unit, and
// a shortfall throws a 409 that rolls the whole transaction back. Must run
// inside a transaction.
const reserveStockForOrder = async (orderedByProduct, transaction) => {
  const productIds = [...orderedByProduct.keys()];
  if (productIds.length === 0) return;

  const catalogProducts = await Product.findAll({
    where: { id: { [Op.in]: productIds } },
    lock: transaction.LOCK.UPDATE,
    transaction,
  });
  const productById = new Map(catalogProducts.map((p) => [p.id, p]));

  // Check every item first (so the order is all-or-nothing), then deduct.
  for (const [productId, quantity] of orderedByProduct) {
    const product = productById.get(productId);
    if (!product) continue; // parsed to a number but no such catalog row
    if (product.stock < quantity) {
      const error = new Error(
        product.stock > 0
          ? `Only ${product.stock} left in stock for "${product.name}".`
          : `"${product.name}" is out of stock.`,
      );
      error.statusCode = 409; // client-fixable conflict, not a server fault
      throw error; // rolls the whole transaction back
    }
  }

  for (const [productId, quantity] of orderedByProduct) {
    const product = productById.get(productId);
    if (!product) continue;
    product.stock -= quantity;
    await product.save({ transaction });
  }
};

// Give an order's reserved quantities back to stock — the mirror of
// reserveStockForOrder, used when an order is cancelled or deleted while still
// in flight. Rows whose product was since deleted are skipped (nothing to
// restore to). Must run inside a transaction.
const restoreStockForOrder = async (orderedByProduct, transaction) => {
  const productIds = [...orderedByProduct.keys()];
  if (productIds.length === 0) return;

  const catalogProducts = await Product.findAll({
    where: { id: { [Op.in]: productIds } },
    lock: transaction.LOCK.UPDATE,
    transaction,
  });
  const productById = new Map(catalogProducts.map((p) => [p.id, p]));

  for (const [productId, quantity] of orderedByProduct) {
    const product = productById.get(productId);
    if (!product) continue;
    product.stock += quantity;
    await product.save({ transaction });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { products, totalAmount, address } = req.body;

    if (!products || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "products and totalAmount are required",
      });
    }

    // Sum the ordered quantity per real catalog product. Items that don't map to
    // a products-table row (demo/legacy) are left out — there's no stock to
    // track for them. Duplicated ids are summed so the stock check sees the true
    // demand for a product even if it appears on more than one line.
    const orderedByProduct = sumOrderedByProduct(products);

    // Reserve stock and save the order atomically: either every ordered catalog
    // product is deducted and the order is created, or nothing changes.
    const order = await database.transaction(async (transaction) => {
      await reserveStockForOrder(orderedByProduct, transaction);

      return Order.create(
        {
          userId: req.user.id, // comes from the verified token, not from frontend
          products,
          totalAmount,
          address,
          status: "packing",
          isManuallySet: false,
        },
        { transaction },
      );
    });

    res.json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    // A stock shortfall is a client problem (409 Conflict) with an actionable
    // message, not an internal error — surface it as-is so checkout can show it.
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

// GET MY ORDERS (customer sees only their own orders - track order page)
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    const syncedOrders = await syncLiveOrderStatuses(orders);

    res.json({
      success: true,
      data: syncedOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

// GET SINGLE ORDER (order confirm page) - only if it belongs to the logged-in user
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    const syncedOrder = await syncLiveOrderStatus(order);

    res.json({
      success: true,
      data: syncedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

// TRACK ORDER (public lookup by ORD-11 or 11)
export const trackOrder = async (req, res) => {
  try {
    const trackingId = String(req.params.trackingId || "").trim();
    const databaseOrderId = trackingId.replace(/^ORD-/i, "");

    if (!databaseOrderId || Number.isNaN(Number(databaseOrderId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid tracking ID",
      });
    }

    const order = await Order.findByPk(databaseOrderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const syncedOrder = await syncLiveOrderStatus(order);

    res.json({
      success: true,
      data: syncedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

// DELETE MY ORDER - removes an order only if it belongs to the logged-in user
export const deleteOrder = async (req, res) => {
  try {
    await database.transaction(async (transaction) => {
      const order = await Order.findOne({
        where: { id: req.params.id, userId: req.user.id },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });

      if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }

      // Deleting an order that is still in flight releases its reserved stock,
      // exactly like cancelling would. A delivered order (stock genuinely sold)
      // or an already-cancelled one (stock already returned) must NOT be
      // restored, or we'd invent inventory.
      const liveStatus = resolveLiveStatus(order);
      if (liveStatus !== "delivered" && liveStatus !== "cancelled") {
        await restoreStockForOrder(sumOrderedByProduct(order.products), transaction);
      }

      await order.destroy({ transaction });
    });

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

// CANCEL MY ORDER - the owner can cancel any time before the order is delivered
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Resolve the real, time-based status first so an order that has already
    // reached "delivered" on the timeline can no longer be cancelled.
    const liveStatus = resolveLiveStatus(order);

    if (liveStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    if (liveStatus === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered orders can no longer be cancelled",
      });
    }

    // Return the reserved stock and flip the status atomically. Re-read the
    // order FOR UPDATE inside the transaction and bail if it is already
    // cancelled, so two cancels racing on the same order can't both add the
    // stock back (double-restore).
    await database.transaction(async (transaction) => {
      const lockedOrder = await Order.findOne({
        where: { id: order.id },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });
      if (!lockedOrder || normalizeStoredStatus(lockedOrder.status) === "cancelled") return;

      await restoreStockForOrder(sumOrderedByProduct(lockedOrder.products), transaction);
      lockedOrder.status = "cancelled";
      lockedOrder.isManuallySet = true; // cancellation is a manual, permanent override too
      await lockedOrder.save({ transaction });
    });

    // Reflect the committed change on the instance we hand back to the client.
    await order.reload();

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

// GET ALL ORDERS (admin only - sees every customer's orders with their name/email)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: {
        model: User,
        attributes: ["id", "name", "email"],
      },
      order: [["createdAt", "DESC"]],
    });
    const syncedOrders = await syncLiveOrderStatuses(orders);

    res.json({
      success: true,
      data: syncedOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

// UPDATE ORDER STATUS (admin only - pending -> confirmed -> shipped -> delivered)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required",
      });
    }

    const nextStatus = normalizeStoredStatus(status);

    await database.transaction(async (transaction) => {
      const order = await Order.findOne({
        where: { id: req.params.id },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });

      if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }

      const prevStatus = normalizeStoredStatus(order.status);
      const orderedByProduct = sumOrderedByProduct(order.products);

      // Keep stock in step with an admin's status change: moving an order into
      // "cancelled" returns its reserved units, and moving it back out reserves
      // them again (all-or-nothing, 409 if there is no longer enough). Every
      // other transition leaves stock untouched.
      if (prevStatus !== "cancelled" && nextStatus === "cancelled") {
        await restoreStockForOrder(orderedByProduct, transaction);
      } else if (prevStatus === "cancelled" && nextStatus !== "cancelled") {
        await reserveStockForOrder(orderedByProduct, transaction);
      }

      // FIX: store the normalized status (matches the ENUM exactly), not the
      // raw value from the request body. Saving an un-normalized value like
      // "Cancelled" or "Shipped" can fail Sequelize's ENUM validation, which
      // throws inside the transaction and rolls back the stock restore above
      // — so the status looked "cancelled" to the admin's click, but neither
      // the DB status nor the stock ever actually changed.
      order.status = nextStatus;
      order.isManuallySet = true; // mark as manual so the scheduler won't overwrite it
      await order.save({ transaction });
    });

    res.json({
      success: true,
      message: "Order status updated",
    });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};