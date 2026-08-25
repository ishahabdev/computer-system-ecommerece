import { SlidersHorizontal, ChevronDown } from "lucide-react";

import SessionCards from "./components/SessionCards";
import TopActionsCard from "./components/TopActionsCard";
import TopPagesCard from "./components/TopPagesCard";

const barBtn =
  "flex items-center gap-1.5 rounded-lg border border-admin-line-2 bg-admin-panel px-3 py-1.5 text-[12px] text-admin-fg-soft transition-colors hover:bg-admin-hover hover:text-admin-fg";

const Analytics = () => {
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
        </div>
      </div>

      <div className="space-y-4">
        {/* Row 1 — session metrics */}
        <SessionCards />

        {/* Row 2 — two ranked bar lists side by side */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TopActionsCard />
          <TopPagesCard />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
