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
import { useAdminTheme } from "../../theme/AdminThemeContext";
import { money, compactCurrency } from "../overviewData";

// One blue hue carries the revenue bar series. The order-status cards below
// add their own semantic hues — amber = processing, emerald = delivered,
// red = cancelled — because on those cards the color IS the meaning. All hues
// are identical in both themes.
const SERIES = "#3b82f6";
const STATUS_PROCESSING = "#f59e0b";
const STATUS_DELIVERED = "#10b981";
const STATUS_CANCELLED = "#ef4444";

// Chart chrome (grid lines, axis ink, tooltip, hover cursor, and the ring
// drawn around the active dot so it reads as cut into the card) depends on the
// theme, so it lives in a palette the components pick from via useAdminTheme.
// Recharts renders these through inline SVG/JS, out of reach of CSS classes,
// which is why they can't use the `admin-*` tokens the rest of the UI does.
const CHART_THEME = {
  dark: {
    grid: "rgba(255,255,255,0.05)",
    axisInk: "#71717a",
    cardBg: "#151518",
    cursorLine: "rgba(255,255,255,0.18)",
    cursorFill: "rgba(255,255,255,0.04)",
    tooltipContent: {
      backgroundColor: "#1c1c21",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8,
      fontSize: 11,
      padding: "6px 10px",
    },
    tooltipItem: { color: "#e4e4e7" },
    tooltipLabel: { color: "#a1a1aa" },
  },
  light: {
    grid: "rgba(9,9,11,0.06)",
    axisInk: "#52525b",
    cardBg: "#ffffff",
    cursorLine: "rgba(9,9,11,0.18)",
    cursorFill: "rgba(9,9,11,0.05)",
    tooltipContent: {
      backgroundColor: "#ffffff",
      border: "1px solid rgba(9,9,11,0.11)",
      borderRadius: 8,
      fontSize: 11,
      padding: "6px 10px",
    },
    tooltipItem: { color: "#18181b" },
    tooltipLabel: { color: "#52525b" },
  },
};

const useChartTheme = () => {
  const { isLight } = useAdminTheme();
  return CHART_THEME[isLight ? "light" : "dark"];
};

/* ------------------------------------------------------------------ */
/* Row 1 — Order status cards                                          */
/* ------------------------------------------------------------------ */

// Display metadata for the four cards; the numbers + sparkline series come from
// deriveOverview keyed by these `key`s, so the color stays a presentation concern.
const CARD_META = [
  { key: "total", label: "Total Orders", color: SERIES },
  { key: "processing", label: "Processing", color: STATUS_PROCESSING },
  { key: "delivered", label: "Delivered", color: STATUS_DELIVERED },
  { key: "cancelled", label: "Cancelled", color: STATUS_CANCELLED },
];

function StatCard({ label, value, color, data, idx }) {
  const t = useChartTheme();
  const gid = `spark-${idx}`;
  return (
    <div className="rounded-xl border border-admin-line bg-admin-panel p-4">
      <span className="text-[11px] font-medium text-admin-fg-muted">{label}</span>
      <div className="mt-0.5 text-[22px] font-semibold leading-tight text-admin-fg">{value}</div>

      {/* height covers plot + the month band, so the card never scrolls */}
      <div className="mt-3  h-[92px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: 12 }}>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="m"
              interval={1}
              tick={{ fill: t.axisInk, fontSize: 9 }}
              tickMargin={8}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={t.tooltipContent}
              labelStyle={t.tooltipLabel}
              itemStyle={t.tooltipItem}
              cursor={{ stroke: t.cursorLine, strokeWidth: 1 }}
              formatter={(v) => [Number(v).toLocaleString(), label]}
            />

            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gid})`}
              dot={false}
              activeDot={{ r: 3.5, fill: color, stroke: t.cardBg, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AnalyticsTopCards({ cards, loading }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARD_META.map((meta, i) => {
        const card = cards?.[meta.key];
        return (
          <StatCard
            key={meta.key}
            idx={i}
            label={meta.label}
            color={meta.color}
            value={loading ? "—" : (card?.value ?? 0).toLocaleString()}
            data={card?.spark ?? []}
          />
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Row 2 left — Revenue bar chart                                      */
/* ------------------------------------------------------------------ */

function RevenueBarChart({ revenue, loading }) {
  const t = useChartTheme();
  const series = revenue?.series ?? [];

  return (
    <div className="rounded-xl border border-admin-line bg-admin-panel p-4">
      <span className="text-[11px] font-medium text-admin-fg-muted">Revenue</span>
      <div className="mt-0.5 text-[22px] font-semibold leading-tight text-admin-fg">
        {loading ? "—" : money(revenue?.total)}
      </div>

      <div className="mt-4 h-[232px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 8, right: 6, bottom: 0, left: -6 }}>
            <CartesianGrid stroke={t.grid} vertical={false} />

            <XAxis
              dataKey="label"
              interval={1}
              tick={{ fill: t.axisInk, fontSize: 9 }}
              tickMargin={8}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tickFormatter={compactCurrency}
              tick={{ fill: t.axisInk, fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />

            <Tooltip
              contentStyle={t.tooltipContent}
              labelStyle={t.tooltipLabel}
              itemStyle={t.tooltipItem}
              cursor={{ fill: t.cursorFill }}
              formatter={(v) => [money(v), "Revenue"]}
            />

            <Bar dataKey="value" fill={SERIES} radius={[2, 2, 0, 0]} maxBarSize={22} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-end gap-1.5">
        <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: SERIES }} />
        <span className="text-[10px] text-admin-fg-muted">Revenue (last 12 months)</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Row 2 right — Revenue category donut                                */
/* ------------------------------------------------------------------ */

// Slice colors. The conic ring is built from the real category shares, so a
// category keeps the same color in the ring and the legend below it.
const CATEGORY_COLORS = [
  "#3b82f6", "#8b5cf6", "#06b6d4", "#22c55e", "#eab308", "#f97316",
];
const EMPTY_RING = "conic-gradient(var(--admin-active, #26262b) 0 100%)";

// Build the ring from cumulative revenue fractions (not the rounded shares, so
// the segments never leave a gap). Falls back to a flat muted ring with no sales.
function buildRing(items, total) {
  if (!items.length || !total) return EMPTY_RING;
  let acc = 0;
  const stops = items.map((item, i) => {
    const start = (acc / total) * 100;
    acc += item.revenue;
    const end = (acc / total) * 100;
    const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
    return `${color} ${start}% ${end}%`;
  });
  return `conic-gradient(from 180deg, ${stops.join(", ")})`;
}

function CategoryDonut({ categories, loading }) {
  const items = categories?.items ?? [];
  const total = categories?.total ?? 0;
  const ring = buildRing(items, total);

  return (
    <div className="rounded-xl border border-admin-line bg-admin-panel p-4">
      <span className="text-[11px] font-medium text-admin-fg-muted">Revenue</span>
      <div className="mt-0.5 text-[22px] font-semibold leading-tight text-admin-fg">
        {loading ? "—" : money(total)}
      </div>

      <div className="mt-2 flex justify-center">
        <div className="relative h-[150px] w-[150px]">
          <div className="h-full w-full rounded-full" style={{ background: ring }} />
          <div className="absolute inset-[19px] flex flex-col items-center justify-center rounded-full bg-admin-panel">
            <span className="text-[13px] font-semibold text-admin-fg">Categories</span>
            <span className="mt-0.5 text-[10px] text-admin-fg-dim">By revenue</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between border-b border-admin-line pb-2 text-[10px] font-medium text-admin-fg-dim">
          <span>Category</span>
          <span>Share</span>
        </div>

        {items.length === 0 ? (
          <div className="py-4 text-center text-[11px] text-admin-fg-dim">
            {loading ? "Loading…" : "No sales yet."}
          </div>
        ) : (
          items.map((c, i) => (
            <div
              key={c.name}
              className="flex items-center justify-between border-b border-admin-line py-2 text-[11px] last:border-0"
            >
              <span className="flex items-center gap-2 text-admin-fg-soft">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                />
                {c.name}
              </span>
              <span className="tabular-nums text-admin-fg-muted">{c.share}%</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function RevenueAndCategoryCharts({ revenue, categories, loading }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <RevenueBarChart revenue={revenue} loading={loading} />
      <CategoryDonut categories={categories} loading={loading} />
    </div>
  );
}
