// Shared date-range model for the admin toolbars (Overview / Orders / Users).
// Pure helpers, no React: the tab keeps the range value in state and hands it to
// <DateRangeMenu>, then uses inRange() to filter its own rows so the summary
// cards and the table always agree on what's shown.

// Presets the dropdown offers. "custom" is handled separately (it needs from/to).
export const PRESETS = [
  { id: "1d", label: "Last 24 hours" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "all", label: "All time" },
];

// How many days back each bounded preset reaches.
const PRESET_DAYS = { "1d": 1, "7d": 7, "30d": 30 };
const DAY_MS = 24 * 60 * 60 * 1000;

// Default: show everything, so a tab renders exactly as it did before a range is
// chosen (and Overview keeps its trailing-12-month charts intact).
export const DEFAULT_RANGE = { preset: "all" };

// Parse a native date input value ("YYYY-MM-DD") at a local day boundary. `end`
// pushes to the final millisecond of that day so a custom range is inclusive.
const parseDayStart = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
};
const parseDayEnd = (value) => {
  const start = parseDayStart(value);
  return start === null ? null : start + DAY_MS - 1;
};

// Resolve a range to epoch-ms bounds. A null bound means "unbounded on that
// side", so { start: null, end: null } matches everything.
export const boundsOf = (range) => {
  if (!range || range.preset === "all") return { start: null, end: null };
  if (range.preset === "custom") {
    return { start: parseDayStart(range.from), end: parseDayEnd(range.to) };
  }
  const days = PRESET_DAYS[range.preset];
  if (!days) return { start: null, end: null };
  return { start: Date.now() - days * DAY_MS, end: null };
};

// Is an epoch-ms timestamp inside the range? A missing/zero timestamp only
// passes on a side that is unbounded, so undated rows drop out of a bounded range.
export const inRange = (timeMs, range) => {
  const { start, end } = boundsOf(range);
  const t = Number(timeMs) || 0;
  if (start !== null && t < start) return false;
  if (end !== null && t > end) return false;
  return true;
};

// Short month-day label for a custom bound, e.g. "Aug 1".
const shortDay = (value) => {
  const start = parseDayStart(value);
  if (start === null) return "…";
  return new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Text for the dropdown button.
export const labelOf = (range) => {
  if (!range || range.preset === "all") return "All time";
  if (range.preset === "custom") {
    if (!range.from && !range.to) return "Custom range";
    if (range.from && !range.to) return `From ${shortDay(range.from)}`;
    if (!range.from && range.to) return `Until ${shortDay(range.to)}`;
    return `${shortDay(range.from)} – ${shortDay(range.to)}`;
  }
  return PRESETS.find((p) => p.id === range.preset)?.label ?? "All time";
};
