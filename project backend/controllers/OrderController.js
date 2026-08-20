import Order from "../model/orderModel.js";
import User from "../model/userModel.js";

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

  if (minutesSinceOrder >= 3) return "delivered";
  if (minutesSinceOrder >= 2) return "on delivery";
  if (minutesSinceOrder >= 1) return "shipping";
  return "packing";
};

const syncLiveOrderStatus = async (order) => {
  if (!order) return null;

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

// CREATE ORDER (customer places an order at checkout)
export const createOrder = async (req, res) => {
  try {
    const { products, totalAmount, address } = req.body;

    if (!products || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "products and totalAmount are required",
      });
    }

    const order = await Order.create({
      userId: req.user.id, // comes from the verified token, not from frontend
      products,
      totalAmount,
      address,
      status: "packing",
    });

    res.json({
      success: true,
      message: "Order placed successfully",
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
    const deleted = await Order.destroy({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order deleted successfully",
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

    await Order.update(
      { status },
      { where: { id: req.params.id } }
    );

    res.json({
      success: true,
      message: "Order status updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};
