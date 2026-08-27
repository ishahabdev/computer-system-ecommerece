import { useCallback, useEffect, useMemo, useState } from "react";
import { RotateCw } from "lucide-react";

import {
  AnalyticsTopCards,
  RevenueAndCategoryCharts,
} from "./components/AnalyticsCharts";
import { AnalyticsTables } from "./components/AnalyticsTables";
import DateRangeMenu from "../components/filters/DateRangeMenu";
import FilterMenu from "../components/filters/FilterMenu";
import { DEFAULT_RANGE, inRange } from "../components/filters/dateRange";
import {
  deriveOverview,
  fetchAllOrders,
  fetchAllProducts,
  getErrorMessage,
} from "./overviewData";

const barBtn =
  "flex items-center gap-1.5 rounded-lg border border-admin-line-2 bg-admin-panel px-3 py-1.5 text-[12px] text-admin-fg-soft transition-colors hover:bg-admin-hover hover:text-admin-fg";

// The Filter panel narrows the dashboard by order status; the five values match
// the backend's normalised statuses (see overviewData.normalizeStatus).
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

const Overview = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState(DEFAULT_RANGE);
  const [filters, setFilters] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    // Orders are the admin-only half of the dashboard, so a Bearer token is
    // required (same one the storefront stores at login). Checking up front
    // avoids a round trip that could only ever come back 401.
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("You must be signed in as an admin to view analytics.");
      setOrders([]);
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      const [ordersData, productsData] = await Promise.all([
        fetchAllOrders(token),
        fetchAllProducts(),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (err) {
      setError(getErrorMessage(err));
      setOrders([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Apply the toolbar's date range + status filter to the raw order feed. The
  // whole dashboard derives from this, so the cards, charts and tables all move
  // together. Products are the catalog and aren't date-filtered.
  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          inRange(o.time, range) &&
          (!filters.status?.length || filters.status.includes(o.status)),
      ),
    [orders, range, filters],
  );

  // Every figure on the page is derived from the filtered feed; recompute only
  // when the inputs change.
  const data = useMemo(
    () => deriveOverview(filteredOrders, products),
    [filteredOrders, products],
  );

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[16px] font-semibold text-admin-fg">Analytics</h1>

        <div className="flex flex-wrap gap-2">
          <FilterMenu groups={ORDER_FILTER_GROUPS} value={filters} onChange={setFilters} />

          <DateRangeMenu value={range} onChange={setRange} />

          <button type="button" onClick={load} className={barBtn}>
            <RotateCw size={13} strokeWidth={1.75} />
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-admin-line bg-admin-panel px-4 py-14 text-center">
          <p className="text-[12px] text-red-400">{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-admin-line-2 px-3 py-1.5 text-[11px] text-admin-fg-soft transition-colors hover:bg-admin-active hover:text-admin-fg"
          >
            <RotateCw size={12} />
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top Cards */}
          <AnalyticsTopCards cards={data.cards} loading={loading} />

          {/* Charts */}
          <RevenueAndCategoryCharts
            revenue={data.revenue}
            categories={data.categories}
            loading={loading}
          />

          {/* Tables */}
          <AnalyticsTables
            orders={data.latestOrders}
            products={data.popularProducts}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default Overview;
