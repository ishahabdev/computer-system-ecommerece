import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Settings, RotateCw } from "lucide-react";
import OrdersTable from "./components/OrdersTable";
import DateRangeMenu from "../components/filters/DateRangeMenu";
import FilterMenu from "../components/filters/FilterMenu";
import { DEFAULT_RANGE, inRange } from "../components/filters/dateRange";

// The Filter panel narrows the table by status; these five values match the
// normalizeStatus() mapping below.
const ORDER_FILTER_GROUPS = [
  {
    id: "status",
    label: "Order status",
    options: [
      { value: "packing", label: "Packing" },
      { value: "shipping", label: "Shipping" },
      { value: "on delivery", label: "On Delivery" },
      { value: "delivered", label: "Delivered" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
];

// Admin reads every customer's orders from the same backend the checkout writes
// to, so an order placed on the storefront shows up here on the next load.
const API_BASE_URL = "http://localhost:9000/v1";
const REQUEST_TIMEOUT_MS = 15000;

// Collapse the model's wider enum down to the five states the UI shows, matching
// the backend's own normalisation (pending -> packing, shipped/confirmed ->
// shipping) so the table and the track-order page agree on a status.
const normalizeStatus = (status) => {
  const value = String(status || "").toLowerCase().trim();
  if (value === "cancelled") return "cancelled";
  if (value === "delivered") return "delivered";
  if (value === "on delivery") return "on delivery";
  if (value === "shipping" || value === "shipped" || value === "confirmed") return "shipping";
  return "packing";
};

// Backend order row (with its included User) -> the shape the table renders.
// totalAmount is a FLOAT column but is coerced defensively; products is a JSON
// array of line items, so the item count is the sum of their quantities.
const normalizeOrder = (order) => {
  const products = Array.isArray(order.products) ? order.products : [];
  const itemCount = products.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
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
    itemCount,
    total: Number(order.totalAmount) || 0,
    address: order.address || "",
    date: hasDate ? created.toLocaleDateString("en-US") : "—",
    time: hasDate ? created.getTime() : 0,
  };
};

const getErrorMessage = (error) => {
  if (error.name === "TimeoutError" || error.name === "AbortError") {
    return "The server took too long to respond. Make sure the backend is running on port 9000.";
  }
  if (error instanceof TypeError) {
    return "Could not reach the server. Make sure the backend is running on port 9000.";
  }
  return error.message || "Failed to load orders";
};

const Orders = () => {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState(DEFAULT_RANGE);
  const [filters, setFilters] = useState({});

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    // /orders/all is admin-only, so it needs the signed-in admin's Bearer token
    // (the same one the storefront stores at login). Without it the call can only
    // ever come back 401, so we say what to do instead of making the round trip.
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("You must be signed in as an admin to view orders.");
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orders/all`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          data.message || "You must be signed in as an admin to view orders.",
        );
      }
      if (!response.ok || data.success === false) {
        throw new Error(data.message || data.error || "Failed to load orders");
      }

      const list = Array.isArray(data.data) ? data.data : [];
      setOrders(list.map(normalizeOrder));
    } catch (err) {
      setError(getErrorMessage(err));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // The toolbar's date range + status filter narrow the feed; the cards and the
  // table both read from this, so they always agree. Text search stays inside
  // the table and composes on top of what's left here.
  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          inRange(o.time, range) &&
          (!filters.status?.length || filters.status.includes(o.status)),
      ),
    [orders, range, filters],
  );

  // Summary cards, derived from the filtered orders rather than hard-coded
  // totals. "Processing" is anything still moving through the pipeline (not yet
  // delivered and not cancelled); the share bar shows each slice as a % of the
  // filtered total.
  const total = filteredOrders.length;
  const cancelled = filteredOrders.filter((o) => o.status === "cancelled").length;
  const completed = filteredOrders.filter((o) => o.status === "delivered").length;
  const processing = total - completed - cancelled;
  const share = (n) => (total ? Math.round((n / total) * 100) : 0);

  const stats = [
    { label: "Total Orders", value: total, share: 100, color: "bg-blue-500" },
    { label: "Processing", value: processing, share: share(processing), color: "bg-yellow-400" },
    { label: "Completed", value: completed, share: share(completed), color: "bg-emerald-500" },
    { label: "Cancelled", value: cancelled, share: share(cancelled), color: "bg-red-400" },
  ];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[16px] font-semibold text-admin-fg">Orders</h1>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-admin-fg-dim"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders..."
              aria-label="Search orders"
              className="w-44 rounded-lg border border-admin-line-2 bg-admin-panel-2 py-1.5 pl-8 pr-2.5 text-[11px] text-admin-fg outline-none transition-colors placeholder:text-admin-fg-dim focus:border-admin-line-strong sm:w-56"
            />
          </div>

          <FilterMenu groups={ORDER_FILTER_GROUPS} value={filters} onChange={setFilters} />

          <DateRangeMenu value={range} onChange={setRange} />

          <button
            type="button"
            onClick={loadOrders}
            className="flex items-center gap-1.5 rounded-lg border border-admin-line-2 px-3 py-1.5 text-[11px] text-admin-fg-soft transition-colors hover:bg-admin-active hover:text-admin-fg"
          >
            <RotateCw size={13} />
            Refresh
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-admin-line-2 px-3 py-1.5 text-[11px] text-admin-fg-soft transition-colors hover:bg-admin-active hover:text-admin-fg"
          >
            <Settings size={13} />
            Settings
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-admin-line bg-admin-panel p-4">
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${stat.color}`} />
              <p className="text-[11px] text-admin-fg-muted">{stat.label}</p>
            </div>

            <div className="mt-2 flex items-baseline justify-between gap-2">
              <p className="text-[18px] font-semibold text-admin-fg">{loading ? "—" : stat.value}</p>
              <p className="text-[10px] text-admin-fg-dim">{stat.share}% of total</p>
            </div>

            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-admin-active">
              <div className={`h-full rounded-full ${stat.color}`} style={{ width: `${stat.share}%` }} />
            </div>
          </div>
        ))}
      </div>

      <OrdersTable
        query={query}
        orders={filteredOrders}
        loading={loading}
        error={error}
        onRetry={loadOrders}
      />
    </div>
  );
};

export default Orders;
