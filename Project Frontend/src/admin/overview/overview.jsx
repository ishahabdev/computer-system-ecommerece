import { SlidersHorizontal, ChevronDown, Shuffle } from "lucide-react";

import {
  AnalyticsTopCards,
  RevenueAndCategoryCharts,
} from "./components/AnalyticsCharts";

import { AnalyticsTables } from "./components/AnalyticsTables";

const barBtn =
  "flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#141416] px-3 py-1.5 text-[12px] text-gray-300 transition-colors hover:bg-white/[0.04] hover:text-white";

const Overview = () => {
  return (
    <div className="p-4 md:p-6">

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[16px] font-semibold text-white">Analytics</h1>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={barBtn}>
            <SlidersHorizontal size={13} strokeWidth={1.75} />
            Filter
          </button>

          <button type="button" className={barBtn}>
            Last 30 days
            <ChevronDown size={13} strokeWidth={1.75} />
          </button>

          <button type="button" className={barBtn}>
            <Shuffle size={13} strokeWidth={1.75} />
            Shuffle Grids
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Top Cards */}
        <AnalyticsTopCards />

        {/* Charts */}
        <RevenueAndCategoryCharts />

        {/* Tables */}
        <AnalyticsTables />
      </div>
    </div>
  );
};

export default Overview;
