import { useCallback, useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, ChevronDown, RotateCw } from "lucide-react";

import {
  AnalyticsTopCards,
  RevenueAndCategoryCharts,
} from "./components/AnalyticsCharts";
import { AnalyticsTables } from "./components/AnalyticsTables";
import {
  deriveOverview,
  fetchAllOrders,
  fetchAllProducts,
  getErrorMessage,
} from "./overviewData";

const barBtn =
  "flex items-center gap-1.5 rounded-lg border border-admin-line-2 bg-admin-panel px-3 py-1.5 text-[12px] text-admin-fg-soft transition-colors hover:bg-admin-hover hover:text-admin-fg";

const Overview = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Every figure on the page is derived from the two live feeds; recompute only
  // when they change.
  const data = useMemo(() => deriveOverview(orders, products), [orders, products]);

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[16px] font-semibold text-admin-fg">Analytics</h1>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={barBtn}>
            <SlidersHorizontal size={13} strokeWidth={1.75} />
            Filter
          </button>

          <button type="button" className={barBtn}>
            Last 30 days
            <ChevronDown size={13} strokeWidth={1.75} />
          </button>

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
