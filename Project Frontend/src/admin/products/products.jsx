import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useToast } from "../../context/ToastContext";
import AddProductModal from "./components/AddProductModal";
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

// Backend rows -> the shape the table renders. Note mysql2 hands DECIMAL back as
// a string, so price must be parsed before the table can sort or format it.
const normalizeProduct = (product, i) => ({
  id: product.id ?? i + 1,
  name:
    (typeof product.name === "string" && product.name.trim()) ||
    "Untitled product",
  category:
    (typeof product.category === "string" && product.category.trim()) ||
    "Uncategorized",
  price: Number(product.price) || 0,
  stock: Number(product.stock) || 0,
  description: product.description || "",
  image: resolveImageUrl(product.image),
});

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

  // Existing categories, offered as suggestions in the add form so the catalog
  // doesn't drift into near-duplicate categories.
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products],
  );

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[16px] font-semibold text-admin-fg">Products</h1>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-admin-line-strong bg-admin-invert px-3 py-1.5 text-[11px] font-medium text-admin-invert-fg transition-colors hover:opacity-90"
        >
          <Plus size={13} strokeWidth={2.25} />
          Add Product
        </button>
      </div>

      <ProductsTable
        products={products}
        loading={loading}
        error={error}
        onRetry={loadProducts}
        onAddProduct={() => setShowAddModal(true)}
      />

      {showAddModal && (
        <AddProductModal
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onCreate={createProduct}
        />
      )}
    </div>
  );
};

export default Products;
