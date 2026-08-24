import { useMemo, useState } from "react";
import {
  Check,
  X,
  Minus,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const COMPANIES = [
  { company: "Acme Corp", status: "Paid", total: 120.5 },
  { company: "Globex Inc", status: "Pending", total: 89.99 },
  { company: "Initech", status: "Paid", total: 45 },
  { company: "Umbrella LLC", status: "Failed", total: 210 },
  { company: "Wayne Enterprises", status: "Paid", total: 67.25 },
  { company: "Stark Industries", status: "Paid", total: 350.75 },
  { company: "Oscorp", status: "Pending", total: 55 },
  { company: "Cyberdyne Systems", status: "Failed", total: 180 },
  { company: "Tyrell Corporation", status: "Paid", total: 99.99 },
  { company: "Weyland-Yutani", status: "Paid", total: 500 },
  { company: "Gekko & Co", status: "Paid", total: 150 },
  { company: "Soylent Corp", status: "Pending", total: 75.5 },
  { company: "Omni Consumer Products", status: "Paid", total: 300 },
  { company: "OCP", status: "Failed", total: 120 },
  { company: "Sirius Cybernetics Corporation", status: "Paid", total: 95 },
];

// 30 orders = two pages. One order per day counting back from 6/18/2025, and
// the four tick columns simply follow the status, so a row can never show
// "Paid" next to an unpaid tick. Built once at module load, not per render.
const ORDERS = Array.from({ length: 30 }, (_, i) => {
  const base = COMPANIES[i % COMPANIES.length];
  const date = new Date(2025, 5, 18 - i);
  return {
    ...base,
    id: i + 1,
    done: base.status === "Paid",
    date: date.toLocaleDateString("en-US"),
    time: date.getTime(), // sortable form of the date shown in the cell
  };
});

const TICK_COLUMNS = ["Packaged", "Fulfilled", "Invoiced", "Paid"];
const PAGE_SIZE = 15;

// Each column carries its own read function, so sorting always uses the value
// the cell actually shows. Sort state stores the column index, which keeps the
// four identical tick columns from all highlighting at once.
const COLUMNS = [
  { label: "Order #", read: (o) => o.id, width: "w-20" },
  { label: "Company", read: (o) => o.company.toLowerCase() },
  { label: "Status", read: (o) => o.status, width: "w-28" },
  ...TICK_COLUMNS.map((label) => ({ label, read: (o) => Number(o.done), width: "w-24" })),
  { label: "Order Total", read: (o) => o.total, width: "w-28" },
  { label: "Date", read: (o) => o.time, width: "w-24" },
];

const STATUS_STYLES = {
  Paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  Failed: "border-transparent text-gray-400",
};

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function Checkbox({ checked, indeterminate = false, onChange, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      onClick={onChange}
      className={`flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border transition-colors ${
        checked || indeterminate
          ? "border-emerald-500 bg-emerald-500"
          : "border-white/[0.18] hover:border-white/40"
      }`}
    >
      {indeterminate ? (
        <Minus size={10} strokeWidth={3.5} className="text-[#0a0a0b]" />
      ) : (
        checked && <Check size={10} strokeWidth={3.5} className="text-[#0a0a0b]" />
      )}
    </button>
  );
}

const pageBtn =
  "flex h-6 min-w-6 items-center justify-center rounded-md border border-white/[0.08] px-1 text-[10px] text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent";

/* ------------------------------------------------------------------ */
/* Table                                                              */
/* ------------------------------------------------------------------ */

export default function OrdersTable({ query = "" }) {
  const [sort, setSort] = useState({ col: null, dir: "asc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const found = q
      ? ORDERS.filter((o) => o.company.toLowerCase().includes(q) || String(o.id).includes(q))
      : ORDERS;

    if (sort.col === null) return found;

    const { read } = COLUMNS[sort.col];
    const sign = sort.dir === "asc" ? 1 : -1;
    // Copy first: `found` is the source array when nothing is filtered out.
    return [...found].sort((a, b) => {
      const x = read(a);
      const y = read(b);
      return x === y ? 0 : (x > y ? 1 : -1) * sign;
    });
  }, [query, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  // Clamp on read so a narrowed search can't strand `page` past the last page.
  const current = Math.min(page, pageCount);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const pickedOnPage = visible.filter((o) => selected.has(o.id)).length;
  const allOnPage = visible.length > 0 && pickedOnPage === visible.length;

  const toggleRow = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const togglePage = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      visible.forEach((o) => (allOnPage ? next.delete(o.id) : next.add(o.id)));
      return next;
    });

  const onSort = (col) =>
    setSort((prev) =>
      prev.col === col ? { col, dir: prev.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" },
    );

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#141416]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.015]">
              <th scope="col" className="w-10 px-4 py-3">
                <Checkbox
                  checked={allOnPage}
                  indeterminate={pickedOnPage > 0 && !allOnPage}
                  onChange={togglePage}
                  label="Select all orders on this page"
                />
              </th>

              {COLUMNS.map((col, i) => {
                const active = sort.col === i;
                const Icon = !active ? ChevronsUpDown : sort.dir === "asc" ? ChevronUp : ChevronDown;
                return (
                  <th
                    key={col.label}
                    scope="col"
                    className={`px-3 py-3 text-left font-medium ${col.width ?? ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => onSort(i)}
                      className={`flex items-center gap-1 text-[11px] transition-colors hover:text-white ${
                        active ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {col.label}
                      <Icon size={11} className={active ? "" : "text-gray-600"} />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {visible.map((order) => (
              <tr
                key={order.id}
                className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.02]"
              >
                <td className="px-4 py-2.5">
                  <Checkbox
                    checked={selected.has(order.id)}
                    onChange={() => toggleRow(order.id)}
                    label={`Select order #${order.id}`}
                  />
                </td>

                <td className="px-3 py-2.5 text-[11px] tabular-nums text-gray-400">#{order.id}</td>

                <td className="px-3 py-2.5 text-[11px] font-medium text-white">{order.company}</td>

                <td className="px-3 py-2.5">
                  <span
                    className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[order.status]}`}
                  >
                    {order.status}
                  </span>
                </td>

                {TICK_COLUMNS.map((label) => (
                  <td key={label} className="px-3 py-2.5">
                    {order.done ? (
                      <Check size={13} strokeWidth={2.5} className="text-emerald-500" />
                    ) : (
                      <X size={13} strokeWidth={2.5} className="text-yellow-500" />
                    )}
                    <span className="sr-only">
                      {label}: {order.done ? "yes" : "no"}
                    </span>
                  </td>
                ))}

                <td className="px-3 py-2.5 text-[11px] tabular-nums text-gray-300">
                  {order.total.toFixed(2)}
                </td>

                <td className="px-3 py-2.5 text-[11px] tabular-nums text-gray-400">{order.date}</td>
              </tr>
            ))}

            {visible.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="py-14 text-center text-[11px] text-gray-500">
                  No orders match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <nav aria-label="Pagination" className="flex items-center justify-end gap-1 px-4 py-3">
        <button type="button" aria-label="First page" className={pageBtn} disabled={current === 1} onClick={() => setPage(1)}>
          <ChevronsLeft size={12} />
        </button>
        <button type="button" aria-label="Previous page" className={pageBtn} disabled={current === 1} onClick={() => setPage(current - 1)}>
          <ChevronLeft size={12} />
        </button>

        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            aria-label={`Page ${p}`}
            aria-current={p === current ? "page" : undefined}
            onClick={() => setPage(p)}
            className={
              p === current
                ? "flex h-6 min-w-6 items-center justify-center rounded-md border border-white/[0.16] bg-white/[0.08] px-1 text-[10px] font-medium text-white"
                : pageBtn
            }
          >
            {p}
          </button>
        ))}

        <button type="button" aria-label="Next page" className={pageBtn} disabled={current === pageCount} onClick={() => setPage(current + 1)}>
          <ChevronRight size={12} />
        </button>
        <button type="button" aria-label="Last page" className={pageBtn} disabled={current === pageCount} onClick={() => setPage(pageCount)}>
          <ChevronsRight size={12} />
        </button>
      </nav>
    </div>
  );
}
