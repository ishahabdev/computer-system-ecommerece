import { TrendingUp } from "lucide-react";

// Row 1 — four session metrics. Values are display-ready strings because each
// one is formatted differently (count, m:ss, ratio, percent).
const CARDS = [
  { label: "Total sessions", value: "1069", trend: "1.8%" },
  { label: "Session duration", value: "2:20", trend: "1.8%" },
  { label: "Pages per session", value: "2", trend: "1.8%" },
  { label: "Bounce rate", value: "43%", trend: "1.8%" },
];

// The 3x3 drag handle in each card corner. Drawn with divs rather than an icon
// import so it matches the reference dot size exactly.
function GripDots() {
  return (
    <span aria-hidden="true" className="grid shrink-0 grid-cols-3 gap-[3px]">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className="h-[3px] w-[3px] rounded-full bg-gray-600" />
      ))}
    </span>
  );
}

export default function SessionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((card) => (
        <div key={card.label} className="rounded-xl border border-white/[0.06] bg-[#141416] p-4">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] font-medium text-gray-400">{card.label}</span>
            <GripDots />
          </div>

          <div className="mt-1 flex items-center gap-2">
            <span className="text-[22px] font-semibold leading-tight text-white">{card.value}</span>
            <span className="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
              <TrendingUp size={10} strokeWidth={2.5} />
              {card.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
