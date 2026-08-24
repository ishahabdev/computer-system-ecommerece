import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// One blue hue carries the plotted series; a neutral step de-emphasises
// Returns, a countervailing metric. Emerald/red stay reserved for status
// badges, so a chart color never quietly means "good" or "bad".
const SERIES = "#3b82f6";
const NEUTRAL = "#8b8f98";
const GRID = "rgba(255,255,255,0.05)";
const AXIS_INK = "#6b7280";
const CARD_BG = "#141416";

const tooltipStyle = {
  backgroundColor: "#1b1b1e",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  fontSize: 11,
  padding: "6px 10px",
};
const tooltipItemStyle = { color: "#e5e7eb" };
const tooltipLabelStyle = { color: "#9ca3af" };

/* ------------------------------------------------------------------ */
/* Row 1 — Sales / Revenue / Returns sparkline cards                   */
/* ------------------------------------------------------------------ */

// Bi-monthly ticks (Jan / Mar / May / Jul / Sep / Nov 21) fall out of
// interval={1} on the 12-month series.
const SPARK_MONTHS = [
  "Jan 21", "Feb 21", "Mar 21", "Apr 21", "May 21", "Jun 21",
  "Jul 21", "Aug 21", "Sep 21", "Oct 21", "Nov 21", "Dec 21",
];
const spark = (values) => values.map((v, i) => ({ m: SPARK_MONTHS[i], v }));

// value = the latest month; data = the trailing 12 months behind it.
const topCards = [
  {
    label: "Sales",
    value: "1,245",
    color: SERIES,
    tip: (v) => v.toLocaleString(),
    data: spark([705, 760, 815, 790, 870, 925, 980, 1010, 1080, 1130, 1200, 1245]),
  },
  {
    label: "Revenue",
    value: "$58,981.00",
    color: SERIES,
    tip: (v) => `$${v.toLocaleString()}`,
    data: spark([41200, 44800, 43100, 47600, 52400, 50900, 56200, 54100, 57800, 55600, 58100, 58981]),
  },
  {
    label: "Returns",
    value: "32",
    color: NEUTRAL,
    tip: (v) => `${v}`,
    data: spark([44, 42, 45, 43, 48, 46, 44, 41, 38, 36, 34, 32]),
  },
];

function StatCard({ label, value, color, data, tip, idx }) {
  const gid = `spark-${idx}`;
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#141416] p-4">
      <span className="text-[11px] font-medium text-gray-400">{label}</span>
      <div className="mt-0.5 text-[22px] font-semibold leading-tight text-white">{value}</div>

      {/* height covers plot + the month band, so the card never scrolls */}
      <div className="mt-3 h-[92px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="m"
              interval={1}
              tick={{ fill: AXIS_INK, fontSize: 9 }}
              tickMargin={8}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
              cursor={{ stroke: "rgba(255,255,255,0.18)", strokeWidth: 1 }}
              formatter={(v) => [tip(v), label]}
            />

            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gid})`}
              dot={false}
              activeDot={{ r: 3.5, fill: color, stroke: CARD_BG, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AnalyticsTopCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {topCards.map((c, i) => (
        <StatCard key={c.label} {...c} idx={i} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Row 2 left — Revenue bar chart                                      */
/* ------------------------------------------------------------------ */

// 21 months, Jul 2023 → Mar 2025. interval={4} surfaces exactly the five
// reference ticks (indices 0, 5, 10, 15, 20).
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const barValues = [
  180, 150, 210, 190, 240, 170, 225, 260, 205, 285, 235,
  305, 250, 290, 270, 335, 315, 590, 300, 345, 365,
];
const barData = barValues.map((value, i) => {
  const year = 2023 + Math.floor((6 + i) / 12);
  const month = (6 + i) % 12; // series starts at July (index 6)
  return { key: `${year}-${String(month + 1).padStart(2, "0")}`, value };
});
const AXIS_LABELS = {
  "2023-07": "July 2023",
  "2023-12": "December 2023",
  "2024-05": "May 2024",
  "2024-10": "October 2024",
  "2025-03": "March 2025",
};
const fmtMonth = (key) => {
  const [y, m] = key.split("-");
  return `${MON[+m - 1]} ${y.slice(2)}`;
};

function RevenueBarChart() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#141416] p-4">
      <span className="text-[11px] font-medium text-gray-400">Revenue</span>
      <div className="mt-0.5 text-[22px] font-semibold leading-tight text-white">$4589.00</div>

      <div className="mt-4 h-[232px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 8, right: 6, bottom: 0, left: -14 }}>
            <CartesianGrid stroke={GRID} vertical={false} />

            <XAxis
              dataKey="key"
              interval={4}
              tickFormatter={(k) => AXIS_LABELS[k] || ""}
              tick={{ fill: AXIS_INK, fontSize: 9 }}
              tickMargin={8}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              ticks={[0, 100, 200, 300, 400, 500, 600]}
              domain={[0, 600]}
              tick={{ fill: AXIS_INK, fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />

            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              labelFormatter={fmtMonth}
              formatter={(v) => [v, "Total"]}
            />

            <Bar dataKey="value" fill={SERIES} radius={[2, 2, 0, 0]} maxBarSize={14} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-end gap-1.5">
        <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: SERIES }} />
        <span className="text-[10px] text-gray-400">Total</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Row 2 right — Revenue category donut                                */
/* ------------------------------------------------------------------ */

const categories = [
  { name: "Laptops", share: 36, color: "#3b82f6" },
  { name: "Smartphones", share: 27, color: "#8b5cf6" },
  { name: "PC Components", share: 18, color: "#06b6d4" },
];

// Smooth multi-hue ring — the conic gradient reproduces the reference's
// continuous sweep; the legend below carries the readable category shares.
const RING =
  "conic-gradient(from 180deg, #8b5cf6, #3b82f6, #06b6d4, #22c55e, #eab308, #f97316, #8b5cf6)";

function CategoryDonut() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#141416] p-4">
      <span className="text-[11px] font-medium text-gray-400">Revenue</span>
      <div className="mt-0.5 text-[22px] font-semibold leading-tight text-white">$4589.00</div>

      <div className="mt-2 flex justify-center">
        <div className="relative h-[150px] w-[150px]">
          <div className="h-full w-full rounded-full" style={{ background: RING }} />
          <div className="absolute inset-[19px] flex flex-col items-center justify-center rounded-full bg-[#141416]">
            <span className="text-[13px] font-semibold text-white">Categories</span>
            <span className="mt-0.5 text-[10px] text-gray-500">Last 24 hours</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-[10px] font-medium text-gray-500">
          <span>Category</span>
          <span>Share</span>
        </div>

        {categories.map((c) => (
          <div
            key={c.name}
            className="flex items-center justify-between border-b border-white/[0.04] py-2 text-[11px] last:border-0"
          >
            <span className="flex items-center gap-2 text-gray-300">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
              {c.name}
            </span>
            <span className="tabular-nums text-gray-400">{c.share}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RevenueAndCategoryCharts() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <RevenueBarChart />
      <CategoryDonut />
    </div>
  );
}
