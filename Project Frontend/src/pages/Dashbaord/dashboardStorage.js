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

export const getLiveOrderStatus = (order) => {
  if (!order) return "packing";

  const normalizedStatus = (order.status || "").toLowerCase().trim();
  if (normalizedStatus === "cancelled") return "cancelled";
  if (normalizedStatus === "delivered") return "delivered";

  // Use createdAt (ISO timestamp with exact time) first,
  // NOT orderDate (display-only date string like "August 19, 2026" which parses to midnight)
  const orderDate = new Date(order.createdAt || order.orderDate);
  if (isNaN(orderDate.getTime())) {
    if (normalizedStatus === "on delivery") return "on delivery";
    if (["shipping", "shipped", "confirmed"].includes(normalizedStatus)) return "shipping";
    return "packing";
  }

  const currentDate = new Date();
  const minutesSinceOrder = Math.floor((currentDate - orderDate) / (1000 * 60));

  
  if (minutesSinceOrder >= 30) return "delivered";
  if (minutesSinceOrder >= 20) return "on delivery";
  if (minutesSinceOrder >= 10) return "shipping";
  return "packing";
};
