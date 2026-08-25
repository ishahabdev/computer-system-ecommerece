import { ChevronDown } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Shared card shell                                                   */
/* ------------------------------------------------------------------ */

// Both panels are the same card — title, dropdown, ranked bar list, Load more.
// It lives here and TopPagesCard imports it, so the two stay identical without
// adding a fourth file.
export function BarListCard({ title, filterLabel, rows }) {
  // Longest bar fills the track; every other bar is read against it.
  const max = Math.max(...rows.map((r) => r.sessions));

  return (
    <div className="flex flex-col rounded-xl border border-admin-line bg-admin-panel">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <h2 className="text-[13px] font-semibold text-admin-fg">{title}</h2>

        <div className="relative">
          <select
            aria-label={filterLabel}
            className="w-28 cursor-pointer appearance-none truncate rounded-lg border border-admin-line-2 bg-admin-panel-2 py-1.5 pl-2.5 pr-7 text-[11px] text-admin-fg-soft outline-none transition-colors focus:border-admin-line-strong"
          >
            <option className="bg-admin-panel-3">{filterLabel}</option>
          </select>
          <ChevronDown
            size={13}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-fg-dim"
          />
        </div>
      </div>

      {/* Rows */}
      <ul className="flex-1 px-4">
        {rows.map((row) => (
          <li key={row.label} className="border-t border-admin-line py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-[11px] text-admin-fg-soft">{row.label}</span>
              <span className="shrink-0 text-[10px] tabular-nums text-admin-fg-dim">
                {row.sessions} sessions
              </span>
            </div>

            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-admin-hover">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${(row.sessions / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="flex justify-center px-4 py-4">
        <button
          type="button"
          className="rounded-lg border border-admin-line-2 px-3 py-1.5 text-[11px] text-admin-fg-soft transition-colors hover:bg-admin-active hover:text-admin-fg"
        >
          Load more
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Left panel — top ecommerce actions                                  */
/* ------------------------------------------------------------------ */

const ACTIONS = [
  { label: "Add to Cart", sessions: 30 },
  { label: "View Product Details", sessions: 25 },
  { label: "Checkout", sessions: 18 },
  { label: "Apply Discount Code", sessions: 10 },
  { label: "Wishlist", sessions: 8 },
  { label: "Share Product", sessions: 6 },
  { label: "Track Order", sessions: 4 },
  { label: "Contact Support", sessions: 3 },
  { label: "Leave Review", sessions: 2 },
  { label: "View Blog Post", sessions: 7 },
  { label: "Sign Up for Newsletter", sessions: 5 },
  { label: "Apply for Account", sessions: 4 },
];

export default function TopActionsCard() {
  return (
    <BarListCard title="Top ecommerce actions" filterLabel="All products" rows={ACTIONS} />
  );
}
