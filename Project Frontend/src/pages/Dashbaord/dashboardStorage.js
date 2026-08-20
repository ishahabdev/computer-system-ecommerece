export const getCustomerIdentifier = (user) => {
  const identifier = user?.id || user?._id || user?.email;
  return identifier ? String(identifier).toLowerCase() : null;
};

export const getCustomerStorageKey = (user, resource) => {
  const identifier = getCustomerIdentifier(user);
  return identifier ? `${resource}:${identifier}` : null;
};

export const readCustomerList = (user, resource) => {
  try {
    const storageKey = getCustomerStorageKey(user, resource);
    const storedValue = storageKey ? localStorage.getItem(storageKey) : null;
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

export const writeCustomerList = (user, resource, items) => {
  const storageKey = getCustomerStorageKey(user, resource);
  if (!storageKey) return;
  localStorage.setItem(storageKey, JSON.stringify(items));
};

export const getBackendOrderId = (order) => order?.databaseOrderId ?? order?.id ?? null;

const parseBackendProducts = (products) => {
  const parsed = typeof products === "string" ? JSON.parse(products || "[]") : products;
  if (!Array.isArray(parsed)) return [];
  return parsed.map((product) => ({
    id: product.productId,
    title: product.name,
    qty: product.quantity || 1,
    price: product.price || 0,
  }));
};

// Backend rows use products/totalAmount/address; the dashboard renders items/total/shippingAddress
export const normalizeBackendOrder = (backendOrder) => {
  let items = [];
  try {
    items = parseBackendProducts(backendOrder.products);
  } catch {
    items = [];
  }

  return {
    orderId: `ORD-${backendOrder.id}`,
    databaseOrderId: backendOrder.id,
    createdAt: backendOrder.createdAt,
    orderDate: backendOrder.createdAt
      ? new Date(backendOrder.createdAt).toLocaleDateString()
      : "",
    status: backendOrder.status,
    items,
    subtotal: items.reduce((sum, item) => sum + item.price * item.qty, 0),
    shippingFee: 0,
    total: backendOrder.totalAmount || 0,
    shippingAddress: backendOrder.address || "",
  };
};

// Backend is the source of truth for which orders exist and their status, while the
// richer checkout snapshot kept locally holds line items, fees and coupon discounts.
export const mergeBackendOrders = (localOrders, backendOrders) =>
  backendOrders.map((backendOrder) => {
    const normalized = normalizeBackendOrder(backendOrder);
    const localOrder = localOrders.find(
      (candidate) => getBackendOrderId(candidate) === backendOrder.id
    );
    if (!localOrder) return normalized;

    return {
      ...normalized,
      ...localOrder,
      status: normalized.status,
      items: localOrder.items?.length ? localOrder.items : normalized.items,
      total: localOrder.total ?? normalized.total,
      shippingAddress: localOrder.shippingAddress || normalized.shippingAddress,
    };
  });

export const getLiveOrderStatus = (order) => {
  if (!order) return "packing";
  if (order.status === "cancelled") return "cancelled";

  const normalizedStatus = (order.status || "").toLowerCase().trim();

  // Use createdAt (ISO timestamp with exact time) first,
  // NOT orderDate (display-only date string like "August 19, 2026" which parses to midnight)
  const orderDate = new Date(order.createdAt || order.orderDate);
  if (isNaN(orderDate.getTime())) {
    return normalizedStatus || "packing";
  }

  const currentDate = new Date();
  const minutesSinceOrder = Math.floor((currentDate - orderDate) / (1000 * 60));

  // Auto-progress: 1 minute per step
  // 0-1 min  → packing
  // 1-2 min  → shipping
  // 2-3 min  → on delivery
  // 3+ min   → delivered
  if (normalizedStatus === "delivered" || minutesSinceOrder >= 3) return "delivered";
  if (normalizedStatus === "on delivery" || minutesSinceOrder >= 2) return "on delivery";
  if (normalizedStatus === "shipping" || normalizedStatus === "shipped" || minutesSinceOrder >= 1) return "shipping";
  return "packing";
};
