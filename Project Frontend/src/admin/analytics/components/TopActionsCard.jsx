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
    <div className="flex flex-col rounded-xl border border-white/[0.06] bg-[#141416]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <h2 className="text-[13px] font-semibold text-white">{title}</h2>

        <div className="relative">
          <select
            aria-label={filterLabel}
            className="w-28 cursor-pointer appearance-none truncate rounded-lg border border-white/[0.08] bg-[#0f0f11] py-1.5 pl-2.5 pr-7 text-[11px] text-gray-300 outline-none transition-colors focus:border-white/[0.16]"
          >
            <option className="bg-[#1b1b1e]">{filterLabel}</option>
          </select>
          <ChevronDown
            size={13}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
      </div>

      {/* Rows */}
      <ul className="flex-1 px-4">
        {rows.map((row) => (
          <li key={row.label} className="border-t border-white/[0.04] py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-[11px] text-gray-300">{row.label}</span>
              <span className="shrink-0 text-[10px] tabular-nums text-gray-500">
                {row.sessions} sessions
              </span>
            </div>

            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.04]">
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
          className="rounded-lg border border-white/[0.1] px-3 py-1.5 text-[11px] text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white"
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
