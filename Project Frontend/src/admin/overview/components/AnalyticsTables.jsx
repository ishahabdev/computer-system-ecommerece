import { ImageOff } from "lucide-react";
import { money } from "../overviewData";

/* ------------------------------------------------------------------ */
/* Badges — same vocabulary the Orders + Products tabs already use     */
/* ------------------------------------------------------------------ */

// Order lifecycle colors mirror admin/orders/components/OrdersTable.jsx so a
// status reads the same on the dashboard as it does in the full orders table.
const ORDER_STATUS_STYLES = {
  delivered: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  "on delivery": "border-blue-500/30 bg-blue-500/10 text-blue-400",
  shipping: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
  packing: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-400",
};

const titleCase = (value) =>
  String(value || "")
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");

function OrderStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[9px] font-medium leading-none ${
        ORDER_STATUS_STYLES[status] || "border-transparent text-admin-fg-muted"
      }`}
    >
      {titleCase(status)}
    </span>
  );
}

// Stock thresholds match admin/products/components/ProductsTable.jsx so a
// product's badge is consistent across tabs.
const LOW_STOCK_AT = 5;
const stockStatusOf = (stock) => {
  if (stock === 0) return "Out of Stock";
  if (stock <= LOW_STOCK_AT) return "Low Stock";
  return "In Stock";
};
const STOCK_STYLES = {
  "In Stock": "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  "Low Stock": "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  "Out of Stock": "border-red-500/30 bg-red-500/10 text-red-400",
};

function StockBadge({ stock }) {
  const status = stockStatusOf(stock);
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md border px-2 py-1 text-[8px] font-medium leading-none ${STOCK_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

// A product image is optional and a pasted URL can rot, so fall back to an icon
// (same treatment as the Products table thumbnail).
function ProductThumb({ src, name }) {
  return (
    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-admin-panel-3">
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="h-full w-full object-cover"
        />
      ) : (
        <ImageOff size={12} className="text-admin-fg-faint" aria-label={`No image for ${name}`} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Latest orders                                                       */
/* ------------------------------------------------------------------ */

export function LatestOrders({ orders = [], loading = false }) {
  const th =
    "px-2 py-2 text-left text-[9px] font-medium text-admin-fg-muted";

  return (
    <div className="rounded-xl border border-admin-line bg-admin-panel p-4">
      <h3 className="text-[13px] font-semibold text-admin-fg">Latest Orders</h3>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[500px] border-collapse">
          <thead>
            <tr className="border-b border-admin-line">
              <th className={th}>Order</th>
              <th className={th}>Customer</th>
              <th className={th}>Date</th>
              <th className={th}>Total</th>
              <th className={th}>Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[10px] text-admin-fg-dim">
                  {loading ? "Loading orders…" : "No orders yet."}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-admin-line last:border-0">
                  <td className="px-2 py-2.5 text-[9px] tabular-nums text-admin-fg-dim">
                    #{order.id}
                  </td>

                  <td className="px-2 py-2.5 text-[9px] text-admin-fg-muted">
                    <span className="block max-w-[120px] truncate">{order.customer}</span>
                  </td>

                  <td className="px-2 py-2.5 text-[9px] text-admin-fg-dim">{order.dateTime}</td>

                  <td className="px-2 py-2.5 text-[9px] tabular-nums text-admin-fg-muted">
                    {money(order.total)}
                  </td>

                  <td className="px-2 py-2.5">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Popular products                                                    */
/* ------------------------------------------------------------------ */

export function PopularProducts({ products = [], loading = false }) {
  return (
    <div className="rounded-xl border border-admin-line bg-admin-panel p-4">
      <h3 className="text-[13px] font-semibold text-admin-fg">Popular Products</h3>

      <div className="mt-2">
        <div className="grid grid-cols-[44px_1fr_88px] border-b border-admin-line px-2 py-2">
          <span className="text-[9px] font-medium text-admin-fg-muted">Image</span>
          <span className="text-[9px] font-medium text-admin-fg-muted">Product</span>
          <span className="text-right text-[9px] font-medium text-admin-fg-muted">Stock</span>
        </div>

        {products.length === 0 ? (
          <div className="py-8 text-center text-[10px] text-admin-fg-dim">
            {loading ? "Loading products…" : "No products yet."}
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="grid grid-cols-[44px_1fr_88px] items-center border-b border-admin-line px-2 py-2 last:border-0"
            >
              <ProductThumb src={product.image} name={product.name} />

              <div className="min-w-0">
                <span className="block truncate text-[9px] text-admin-fg-muted">
                  {product.name}
                </span>
                <span className="text-[8px] text-admin-fg-dim">
                  {product.sold > 0 ? `${product.sold.toLocaleString()} sold` : "No sales yet"}
                </span>
              </div>

              <div className="flex justify-end">
                <StockBadge stock={product.stock} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function AnalyticsTables({ orders, products, loading }) {
  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <LatestOrders orders={orders} loading={loading} />
      <PopularProducts products={products} loading={loading} />
    </div>
  );
}
