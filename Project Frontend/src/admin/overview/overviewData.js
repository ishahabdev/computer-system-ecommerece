// Admin Overview data layer.
//
// The Overview dashboard is a read-only roll-up of the same two backend tables
// the Orders and Products tabs manage. Every number the dashboard shows is
// derived here from the live `/orders/all` feed and the `/products` catalog, so
// the Overview always agrees with those tabs instead of showing invented totals.
//
// Fetching + normalisation mirror admin/orders/orders.jsx and
// admin/products/products.jsx (same API base, same status/image handling), kept
// self-contained rather than imported so the admin owns its own shapes.

const API_ORIGIN = "http://localhost:9000";
const API_BASE_URL = `${API_ORIGIN}/v1`;
const REQUEST_TIMEOUT_MS = 15000;

/* ------------------------------------------------------------------ */
/* Shared helpers (mirror the Orders + Products tabs)                  */
/* ------------------------------------------------------------------ */

// An uploaded image is stored server-relative ("/uploads/x.webp"); Vite serves
// the admin on another port, so resolve it against the API origin or the
// thumbnail 404s. A pasted absolute URL is left alone.
const resolveImageUrl = (image) => {
  if (typeof image !== "string" || !image.trim()) return "";
  const value = image.trim();
  return /^https?:\/\//i.test(value) ? value : `${API_ORIGIN}${value}`;
};

export const getErrorMessage = (error) => {
  if (error.name === "TimeoutError" || error.name === "AbortError") {
    return "The server took too long to respond. Make sure the backend is running on port 9000.";
  }
  if (error instanceof TypeError) {
    return "Could not reach the server. Make sure the backend is running on port 9000.";
  }
  return error.message || "Something went wrong";
};

// Full and compact currency, exported so the chart components format money the
// same way the tables do.
export const money = (n) =>
  `$${Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const compactCurrency = (n) => {
  const value = Number(n) || 0;
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(abs % 1_000 === 0 ? 0 : 1)}k`;
  return `$${Math.round(value)}`;
};

/* ------------------------------------------------------------------ */
/* Normalisers                                                         */
/* ------------------------------------------------------------------ */

// Collapse the model's wider enum to the five states the UI shows, matching the
// backend's own normalisation. (Same mapping as admin/orders/orders.jsx.)
const normalizeStatus = (status) => {
  const value = String(status || "").toLowerCase().trim();
  if (value === "cancelled") return "cancelled";
  if (value === "delivered") return "delivered";
  if (value === "on delivery") return "on delivery";
  if (value === "shipping" || value === "shipped" || value === "confirmed") return "shipping";
  return "packing";
};

// Backend order row (+ its included User) -> the shape the dashboard needs.
// `items` keeps the JSON line items so revenue-by-category and units-sold can be
// computed without a second request; `total` coerces the FLOAT column defensively.
const normalizeOrder = (order) => {
  const rawItems = Array.isArray(order.products) ? order.products : [];
  const items = rawItems.map((item) => ({
    productId: item.productId,
    name: (typeof item.name === "string" && item.name.trim()) || "Item",
    quantity: Number(item.quantity) || 0,
    price: Number(item.price) || 0,
    image: resolveImageUrl(item.image),
  }));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const created = order.createdAt ? new Date(order.createdAt) : null;
  const hasDate = created && !Number.isNaN(created.getTime());

  return {
    id: order.id,
    customer:
      (order.User?.name && order.User.name.trim()) ||
      (order.User?.email && order.User.email.trim()) ||
      "Unknown customer",
    email: order.User?.email || "",
    status: normalizeStatus(order.status),
    items,
    itemCount,
    total: Number(order.totalAmount) || 0,
    createdAt: hasDate ? created : null,
    time: hasDate ? created.getTime() : 0,
    dateTime: hasDate
      ? created.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—",
  };
};

// Backend product row -> the shape the tables render. mysql2 hands DECIMAL back
// as a string, so price is parsed before any math. (Same as admin/products.)
const normalizeProduct = (product, i) => ({
  id: product.id ?? i + 1,
  name:
    (typeof product.name === "string" && product.name.trim()) || "Untitled product",
  category:
    (typeof product.category === "string" && product.category.trim()) ||
    "Uncategorized",
  price: Number(product.price) || 0,
  stock: Number(product.stock) || 0,
  image: resolveImageUrl(product.image),
});

/* ------------------------------------------------------------------ */
/* Fetchers                                                            */
/* ------------------------------------------------------------------ */

// GET every customer's orders. Admin-only, so it needs the signed-in admin's
// Bearer token — 401/403 becomes an actionable "sign in as admin" message.
export const fetchAllOrders = async (token) => {
  const response = await fetch(`${API_BASE_URL}/orders/all`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      data.message || "You must be signed in as an admin to view analytics.",
    );
  }
  if (!response.ok || data.success === false) {
    throw new Error(data.message || data.error || "Failed to load orders");
  }

  const list = Array.isArray(data.data) ? data.data : [];
  return list.map(normalizeOrder);
};

// GET the catalog. Public — the store grid reads the same endpoint.
export const fetchAllProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || data.error || "Failed to load products");
  }

  const list = Array.isArray(data.data) ? data.data : [];
  return list.map(normalizeProduct);
};

/* ------------------------------------------------------------------ */
/* Derivation                                                          */
/* ------------------------------------------------------------------ */

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// The trailing `count` months ending with the current month, oldest first.
const trailingMonths = (count = 12) => {
  const now = new Date();
  const months = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: `${MONTH_LABELS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
    });
  }
  return months;
};

const monthKeyOf = (date) =>
  date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    : null;

// A cart line item stores the *cart* id as productId. Real catalog products use
// the string "db-<id>" (see context/CartContext.jsx); demo/legacy items use
// numeric ids that won't match the catalog. Parse to the integer products-table
// id so line items can be joined to the catalog; null when it can't map.
const parseProductId = (raw) => {
  if (typeof raw === "number") return Number.isInteger(raw) ? raw : null;
  if (typeof raw === "string") {
    const value = raw.startsWith("db-") ? raw.slice(3) : raw;
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : null;
  }
  return null;
};

const MAX_CATEGORY_SLICES = 6;

// Everything the dashboard renders, computed from the two feeds in one pass.
// Pure: given the same orders + products it always returns the same payload, so
// it's safe to memoise on those inputs.
export const deriveOverview = (orders = [], products = []) => {
  const months = trailingMonths(12);

  // Bucket orders by their creation month once; the cards read from this.
  const byMonth = new Map(months.map((m) => [m.key, []]));
  for (const order of orders) {
    const bucket = byMonth.get(monthKeyOf(order.createdAt));
    if (bucket) bucket.push(order);
  }
  const countIn = (monthOrders, predicate) =>
    monthOrders.reduce((n, o) => n + (predicate(o) ? 1 : 0), 0);

  const isDelivered = (o) => o.status === "delivered";
  const isCancelled = (o) => o.status === "cancelled";
  const isProcessing = (o) => !isDelivered(o) && !isCancelled(o);

  const spark = (predicate) =>
    months.map((m) => ({ m: m.label, v: countIn(byMonth.get(m.key), predicate) }));

  const total = orders.length;
  const delivered = orders.filter(isDelivered).length;
  const cancelled = orders.filter(isCancelled).length;
  const processing = total - delivered - cancelled;

  const cards = {
    total: { value: total, spark: spark(() => true) },
    processing: { value: processing, spark: spark(isProcessing) },
    delivered: { value: delivered, spark: spark(isDelivered) },
    cancelled: { value: cancelled, spark: spark(isCancelled) },
  };

  // Revenue = money booked on orders that weren't cancelled.
  const revenueOrders = orders.filter((o) => !isCancelled(o));
  const revenueByMonth = new Map(months.map((m) => [m.key, 0]));
  for (const order of revenueOrders) {
    const key = monthKeyOf(order.createdAt);
    if (revenueByMonth.has(key)) {
      revenueByMonth.set(key, revenueByMonth.get(key) + order.total);
    }
  }
  const revenue = {
    total: revenueOrders.reduce((sum, o) => sum + o.total, 0),
    series: months.map((m) => ({ label: m.label, value: revenueByMonth.get(m.key) })),
  };

  // Revenue by catalog category: join each non-cancelled line item to its
  // product's category (line price × qty is the realised revenue). Unmatched
  // ids (deleted products, demo items) fall under "Other".
  const categoryOf = new Map(products.map((p) => [p.id, p.category]));
  const revenueByCategory = new Map();
  const soldByProduct = new Map();
  for (const order of revenueOrders) {
    for (const item of order.items) {
      const productId = parseProductId(item.productId);
      if (productId !== null) {
        soldByProduct.set(productId, (soldByProduct.get(productId) || 0) + item.quantity);
      }
      const category = (productId !== null && categoryOf.get(productId)) || "Other";
      const lineRevenue = item.price * item.quantity;
      revenueByCategory.set(category, (revenueByCategory.get(category) || 0) + lineRevenue);
    }
  }

  let categoryItems = [...revenueByCategory.entries()]
    .map(([name, categoryRevenue]) => ({ name, revenue: categoryRevenue }))
    .filter((c) => c.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);

  // Keep the legend readable: fold everything past the top slices into "Other".
  if (categoryItems.length > MAX_CATEGORY_SLICES) {
    const head = categoryItems.slice(0, MAX_CATEGORY_SLICES - 1);
    const tailRevenue = categoryItems
      .slice(MAX_CATEGORY_SLICES - 1)
      .reduce((sum, c) => sum + c.revenue, 0);
    categoryItems = [...head, { name: "Other", revenue: tailRevenue }];
  }

  const categoryTotal = categoryItems.reduce((sum, c) => sum + c.revenue, 0);
  const categories = {
    total: categoryTotal,
    items: categoryItems.map((c) => ({
      ...c,
      share: categoryTotal ? Math.round((c.revenue / categoryTotal) * 100) : 0,
    })),
  };

  // Latest 5 orders — the backend already returns them newest-first.
  const latestOrders = orders.slice(0, 5);

  // Popular products: catalog rows ranked by units sold (matched by parsed id).
  // With no sales yet, fall back to the newest catalog rows so the card isn't
  // empty — products already arrive newest-first.
  const ranked = products
    .map((p) => ({ id: p.id, name: p.name, image: p.image, stock: p.stock, sold: soldByProduct.get(p.id) || 0 }))
    .sort((a, b) => b.sold - a.sold);
  const anySales = ranked.some((p) => p.sold > 0);
  const popularProducts = (anySales ? ranked.filter((p) => p.sold > 0) : ranked).slice(0, 5);

  return { cards, revenue, categories, latestOrders, popularProducts };
};
