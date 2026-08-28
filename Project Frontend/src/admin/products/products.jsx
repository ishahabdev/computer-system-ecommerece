import { useCallback, useEffect, useState } from "react";

import { useToast } from "../../context/ToastContext";
import AddProductModal from "./components/AddProductModal";
import EditProductModal from "./components/EditProductModal";
import ProductsTable from "./components/ProductsTable";

// Same backend the store grid reads from, so a product added here appears on the
// storefront too — both sides read the same `products` table.
const API_ORIGIN = "http://localhost:9000";
const API_BASE_URL = `${API_ORIGIN}/v1`;
const REQUEST_TIMEOUT_MS = 15000;

// An uploaded image is stored as a server-relative path ("/uploads/product-1.webp").
// Vite serves the admin on a different port, so that path has to be resolved
// against the API origin or every thumbnail 404s. A pasted remote URL is already
// absolute and is left alone.
const resolveImageUrl = (image) => {
  if (typeof image !== "string" || !image.trim()) return "";
  const value = image.trim();
  return /^https?:\/\//i.test(value) ? value : `${API_ORIGIN}${value}`;
};

// A whole 0–100 percentage; anything malformed or <= 0 means "not a deal".
const normalizeDiscount = (value) => {
  const pct = Math.round(Number(value));
  if (!Number.isFinite(pct) || pct <= 0) return 0;
  return Math.min(pct, 100);
};

// Resolve the stored gallery to absolute URLs, falling back to the single `image`
// column for rows created before the images column existed. The admin table only
// shows the primary thumbnail, but the count is handy context for the deal modal.
const resolveGallery = (product) => {
  let raw = product.images;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = [];
    }
  }
  const resolved = (Array.isArray(raw) ? raw : [])
    .map(resolveImageUrl)
    .filter(Boolean);
  if (resolved.length > 0) return resolved;
  const single = resolveImageUrl(product.image);
  return single ? [single] : [];
};

// Backend rows -> the shape the table renders. Note mysql2 hands DECIMAL back as
// a string, so price must be parsed before the table can sort or format it.
const normalizeProduct = (product, i) => {
  const images = resolveGallery(product);
  return {
    id: product.id ?? i + 1,
    name:
      (typeof product.name === "string" && product.name.trim()) ||
      "Untitled product",
    category:
      (typeof product.category === "string" && product.category.trim()) ||
      "Uncategorized",
    price: Number(product.price) || 0,
    stock: Number(product.stock) || 0,
    // Drives the table's Deal badge and the "Manage deal" modal's starting value.
    discountPercent: normalizeDiscount(product.discountPercent),
    // Homepage controls: `featured` powers the "Handpicked" section and the row's
    // Feature toggle; `saleEndsAt` bounds a flash deal and prefills the deal modal.
    featured: Boolean(product.featured),
    saleEndsAt: product.saleEndsAt || null,
    description: product.description || "",
    image: images[0] || "",
    images,
  };
};

const getErrorMessage = (error) => {
  if (error.name === "TimeoutError" || error.name === "AbortError") {
    return "The server took too long to respond. Make sure the backend is running on port 9000.";
  }
  if (error instanceof TypeError) {
    return "Could not reach the server. Make sure the backend is running on port 9000.";
  }
  return error.message || "Something went wrong";
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { addToast } = useToast();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || data.error || "Failed to load products");
      }

      const list = Array.isArray(data.data) ? data.data : [];
      setProducts(list.map(normalizeProduct));
    } catch (err) {
      setError(getErrorMessage(err));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Create a product from the modal's FormData. Resolves to {success, error} so
  // the modal can keep the form open and show why a submission failed.
  const createProduct = useCallback(
    async (payload) => {
      // The create route is admin-only. Checking here avoids a round trip that
      // could only ever come back 401, and lets us say what to do about it.
      const token = localStorage.getItem("authToken");
      if (!token) {
        return {
          success: false,
          error: "You must be signed in as an admin to add products.",
        };
      }

      try {
        const response = await fetch(`${API_BASE_URL}/admin/products`, {
          method: "POST",
          // Deliberately no Content-Type: the browser has to set the multipart
          // boundary itself, and multer cannot parse the body without it.
          headers: { Authorization: `Bearer ${token}` },
          body: payload,
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        const data = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
          return {
            success: false,
            error:
              data.message ||
              "You must be signed in as an admin to add products.",
          };
        }

        if (!response.ok || data.success === false) {
          throw new Error(data.message || data.error || "Failed to add product");
        }

        addToast("Product added", "success");
        setShowAddModal(false);
        // Refetch rather than pushing the row locally: the server assigns the id
        // and stored image path, so this keeps the table showing persisted truth.
        loadProducts();
        return { success: true };
      } catch (err) {
        return { success: false, error: getErrorMessage(err) };
      }
    },
    [addToast, loadProducts],
  );

  // Update a product (currently just the "Manage deal" discount control). Sends a
  // JSON PATCH, then refetches so the table shows persisted truth. Resolves to
  // {success, error} so the modal can keep itself open and explain a failure.
  const updateProduct = useCallback(
    async (id, patch) => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return {
          success: false,
          error: "You must be signed in as an admin to update products.",
        };
      }

      try {
        const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(patch),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        const data = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
          return {
            success: false,
            error:
              data.message ||
              "You must be signed in as an admin to update products.",
          };
        }

        if (!response.ok || data.success === false) {
          throw new Error(
            data.message || data.error || "Failed to update product",
          );
        }

        addToast("Product updated", "success");
        loadProducts();
        return { success: true };
      } catch (err) {
        return { success: false, error: getErrorMessage(err) };
      }
    },
    [addToast, loadProducts],
  );

  // Edit a product - sends JSON data (images not supported yet in backend PATCH).
  const editProduct = useCallback(
    async (id, updates) => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return {
          success: false,
          error: "You must be signed in as an admin to edit products.",
        };
      }

      try {
        const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        const data = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
          return {
            success: false,
            error:
              data.message ||
              "You must be signed in as an admin to edit products.",
          };
        }

        if (!response.ok || data.success === false) {
          throw new Error(
            data.message || data.error || "Failed to update product",
          );
        }

        addToast("Product updated successfully", "success");
        setEditingProduct(null);
        loadProducts();
        return { success: true };
      } catch (err) {
        return { success: false, error: getErrorMessage(err) };
      }
    },
    [addToast, loadProducts],
  );

  // Apply one JSON patch to several products at once — powers the selection
  // toolbar's "Feature" action and the deal modal when it's opened on a
  // multi-selection. Each id is a separate PATCH (the endpoint is single-id), run
  // together with allSettled so one failure doesn't abort the rest; the result
  // reports how many landed so the toolbar / modal can react. Refetches once at
  // the end so the table shows persisted truth.
  const bulkUpdateProducts = useCallback(
    async (ids, patch) => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return {
          success: false,
          error: "You must be signed in as an admin to update products.",
        };
      }

      const idList = (Array.isArray(ids) ? ids : [ids]).filter(
        (id) => id != null,
      );
      if (idList.length === 0) {
        return { success: false, error: "No products selected." };
      }

      try {
        const results = await Promise.allSettled(
          idList.map((id) =>
            fetch(`${API_BASE_URL}/admin/products/${id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(patch),
              signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            }).then(async (response) => {
              const data = await response.json().catch(() => ({}));
              if (!response.ok || data.success === false) {
                throw new Error(
                  data.message || data.error || "Failed to update product",
                );
              }
              return id;
            }),
          ),
        );

        const ok = results.filter((r) => r.status === "fulfilled").length;
        const failed = idList.length - ok;
        if (ok > 0) loadProducts();

        if (failed === 0) {
          addToast(
            `Updated ${ok} product${ok !== 1 ? "s" : ""}`,
            "success",
          );
          return { success: true, count: ok };
        }

        const firstError =
          results.find((r) => r.status === "rejected")?.reason?.message ||
          "Failed to update products";

        if (ok === 0) {
          addToast(firstError, "error");
          return { success: false, error: firstError };
        }

        addToast(`Updated ${ok} of ${idList.length}; ${failed} failed`, "error");
        return {
          success: false,
          partial: true,
          count: ok,
          error: `${failed} update${failed !== 1 ? "s" : ""} failed`,
        };
      } catch (err) {
        const message = getErrorMessage(err);
        addToast(message, "error");
        return { success: false, error: message };
      }
    },
    [addToast, loadProducts],
  );

  // Delete the selected products. Same single-id-per-request + allSettled shape as
  // the bulk update so a partial failure still removes the rows that succeeded.
  const deleteProducts = useCallback(
    async (ids) => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return {
          success: false,
          error: "You must be signed in as an admin to delete products.",
        };
      }

      const idList = (Array.isArray(ids) ? ids : [ids]).filter(
        (id) => id != null,
      );
      if (idList.length === 0) {
        return { success: false, error: "No products selected." };
      }

      try {
        const results = await Promise.allSettled(
          idList.map((id) =>
            fetch(`${API_BASE_URL}/admin/products/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
              signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            }).then(async (response) => {
              const data = await response.json().catch(() => ({}));
              if (!response.ok || data.success === false) {
                throw new Error(
                  data.message || data.error || "Failed to delete product",
                );
              }
              return id;
            }),
          ),
        );

        const ok = results.filter((r) => r.status === "fulfilled").length;
        const failed = idList.length - ok;
        if (ok > 0) loadProducts();

        if (failed === 0) {
          addToast(
            `Deleted ${ok} product${ok !== 1 ? "s" : ""}`,
            "success",
          );
          return { success: true, count: ok };
        }

        const firstError =
          results.find((r) => r.status === "rejected")?.reason?.message ||
          "Failed to delete products";

        if (ok === 0) {
          addToast(firstError, "error");
          return { success: false, error: firstError };
        }

        addToast(`Deleted ${ok} of ${idList.length}; ${failed} failed`, "error");
        return { success: false, partial: true, count: ok, error: firstError };
      } catch (err) {
        const message = getErrorMessage(err);
        addToast(message, "error");
        return { success: false, error: message };
      }
    },
    [addToast, loadProducts],
  );

  return (
    <div className="p-4 md:p-6">
      {/* FIX: ProductsTable now renders its own title + search + category
          filter + "Add product" button in one toolbar row (matching the
          reference design). The old page-level header (a second "Products"
          heading and a second "Add Product" button) was removed here — it
          was stacking on top of the table's own toolbar and rendering
          everything twice. */}
      <ProductsTable
        products={products}
        loading={loading}
        error={error}
        onRetry={loadProducts}
        onAddProduct={() => setShowAddModal(true)}
        onEditProduct={setEditingProduct}
        onUpdateProduct={updateProduct}
        onBulkUpdate={bulkUpdateProducts}
        onBulkDelete={deleteProducts}
      />

      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onCreate={createProduct}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdate={editProduct}
        />
      )}
    </div>
  );
};

export default Products;