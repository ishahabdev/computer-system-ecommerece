// Shared data layer for the storefront (Store grid + product detail page).
//
// The store shows the real catalog from the backend `products` table — the same
// rows the admin Products tab creates. Both the admin page and this module talk
// to the same API, so a product added in admin appears here on the next load.

const API_ORIGIN = "http://localhost:9000";
const API_BASE_URL = `${API_ORIGIN}/v1`;
const REQUEST_TIMEOUT_MS = 15000;

// An uploaded image is stored as a server-relative path ("/uploads/product-1.webp").
// Vite serves the frontend on a different port, so that path has to be resolved
// against the API origin or every image 404s. A pasted remote URL is already
// absolute and is left alone. (Mirrors resolveImageUrl in admin/products/products.jsx.)
export const resolveImageUrl = (image) => {
  if (typeof image !== "string" || !image.trim()) return "";
  const value = image.trim();
  return /^https?:\/\//i.test(value) ? value : `${API_ORIGIN}${value}`;
};

// Shown when a product has no image (the image field is optional on the model).
// An inline SVG keeps it self-contained — no extra asset import or network request.
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
       <rect width="240" height="240" fill="#F1F3F5"/>
       <g fill="none" stroke="#C4CBD3" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
         <rect x="66" y="66" width="108" height="108" rx="12"/>
         <path d="M66 146l32-30 26 24 28-36 22 26"/>
         <circle cx="150" cy="98" r="11"/>
       </g>
     </svg>`,
  );

// Store products carry two ids. The demo products the Home page still uses reuse the
// same numeric range and link to /store/product/:id, so a bare number is ambiguous.
//   - the "db-<id>" id disambiguates the route/React key and tells ProductDetail to
//     fetch from the API rather than the static demo data.
//   - the raw integer dbId is the real products-table id, and is what the cart and
//     wishlist must POST to the backend as productId.
export const STORE_ID_PREFIX = "db-";

export const toStoreId = (dbId) => `${STORE_ID_PREFIX}${dbId}`;

// "db-12" -> 12 for a store product; null for a bare demo id (handled statically).
export const parseStoreId = (routeId) => {
  if (typeof routeId !== "string" || !routeId.startsWith(STORE_ID_PREFIX)) {
    return null;
  }
  const dbId = Number(routeId.slice(STORE_ID_PREFIX.length));
  return Number.isInteger(dbId) && dbId > 0 ? dbId : null;
};

// Backend row -> the shape the store card / grid / detail expect. Note mysql2 hands
// DECIMAL back as a string, so price is parsed before the grid can sort or format it.
export const mapProduct = (row) => ({
  id: toStoreId(row.id),
  dbId: row.id,
  title:
    (typeof row.name === "string" && row.name.trim()) || "Untitled product",
  price: Number(row.price) || 0,
  currency: "$",
  img: resolveImageUrl(row.image) || PLACEHOLDER_IMAGE,
  category:
    (typeof row.category === "string" && row.category.trim()) ||
    "Uncategorized",
  // The products table has no brand column; the store's brand facet is hidden.
  brand: "",
  rating: 4.5,
  // A freshly added product is the newest, so flag it for the "New" badge.
  isNew: true,
  stock: Number(row.stock) || 0,
  description: row.description || "",
  // Epoch ms so "newest" sorting is stable; 0 if the timestamp is missing.
  createdAt: row.created_at ? Date.parse(row.created_at) || 0 : 0,
});

// Turns fetch/timeout failures into a message worth showing. (Mirrors the admin page.)
export const getErrorMessage = (error) => {
  if (error.name === "TimeoutError" || error.name === "AbortError") {
    return "The server took too long to respond. Make sure the backend is running on port 9000.";
  }
  if (error instanceof TypeError) {
    return "Could not reach the server. Make sure the backend is running on port 9000.";
  }
  return error.message || "Something went wrong";
};

// GET all products, newest-first (the backend already orders them). Throws on
// failure so the caller can show an error state.
export const fetchProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || data.error || "Failed to load products");
  }

  const list = Array.isArray(data.data) ? data.data : [];
  return list.map(mapProduct);
};

// GET one product by its real integer id. Returns null on 404 so the detail page
// can render its "not found" state; throws on other failures.
export const fetchProductById = async (dbId) => {
  const response = await fetch(`${API_BASE_URL}/products/${dbId}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (response.status === 404) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false || !data.data) {
    throw new Error(data.message || data.error || "Failed to load product");
  }

  return mapProduct(data.data);
};
