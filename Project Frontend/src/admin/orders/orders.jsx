import { useState } from "react";
import { Search, Settings, Plus } from "lucide-react";
import OrdersTable from "./components/OrdersTable";

// Static summary cards — one entry per card, colour drives both dot and bar.
const STATS = [
  { label: "Total Orders", value: 15, share: 75, color: "bg-blue-500" },
  { label: "Pending Orders", value: 3, share: 15, color: "bg-yellow-400" },
  { label: "Completed Orders", value: 9, share: 45, color: "bg-emerald-500" },
  { label: "Failed Orders", value: 3, share: 15, color: "bg-red-400" },
];

const Orders = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[16px] font-semibold text-white">Orders</h1>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders..."
              aria-label="Search orders"
              className="w-44 rounded-lg border border-white/[0.08] bg-[#0f0f11] py-1.5 pl-8 pr-2.5 text-[11px] text-white outline-none transition-colors placeholder:text-gray-500 focus:border-white/[0.16] sm:w-56"
            />
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-[11px] text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <Settings size={13} />
            Settings
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/[0.14] bg-white/[0.08] px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-white/[0.12]"
          >
            <Plus size={13} strokeWidth={2.25} />
            New Order
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-[#141416] p-4">
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${stat.color}`} />
              <p className="text-[11px] text-gray-400">{stat.label}</p>
            </div>

            <div className="mt-2 flex items-baseline justify-between gap-2">
              <p className="text-[18px] font-semibold text-white">${stat.value}</p>
              <p className="text-[10px] text-gray-500">{stat.share}% of total</p>
            </div>

            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div className={`h-full rounded-full ${stat.color}`} style={{ width: `${stat.share}%` }} />
            </div>
          </div>
        ))}
      </div>

      <OrdersTable query={query} />
    </div>
  );
};

export default Orders;
