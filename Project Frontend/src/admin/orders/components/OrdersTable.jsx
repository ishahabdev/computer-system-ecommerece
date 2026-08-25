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
  RotateCw,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Order lifecycle                                                     */
/* ------------------------------------------------------------------ */

// The backend advances an order packing -> shipping -> on delivery -> delivered
// (or cancelled). The four tick columns below mirror that timeline: a step is
// "reached" once the order's status is at or past it. A cancelled order sits at
// step 0, so it shows no ticks.
const STATUS_STEP = { packing: 1, shipping: 2, "on delivery": 3, delivered: 4 };
const stepOf = (status) => STATUS_STEP[status] ?? 0;

const TICK_COLUMNS = ["Packed", "Shipped", "On Delivery", "Delivered"];
const PAGE_SIZE = 10;

const titleCase = (value) =>
  String(value || "")
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");

// Each column carries its own read function, so sorting always uses the value
// the cell actually shows. Sort state stores the column index, which keeps the
// four tick columns from all highlighting at once.
const COLUMNS = [
  { label: "Order #", read: (o) => o.id, width: "w-20" },
  { label: "Customer", read: (o) => o.customer.toLowerCase() },
  { label: "Items", read: (o) => o.itemCount, width: "w-16" },
  { label: "Status", read: (o) => o.status, width: "w-28" },
  ...TICK_COLUMNS.map((label, i) => ({
    label,
    read: (o) => (stepOf(o.status) > i ? 1 : 0),
    width: "w-24",
  })),
  { label: "Order Total", read: (o) => o.total, width: "w-28" },
  { label: "Date", read: (o) => o.time, width: "w-24" },
];

const STATUS_STYLES = {
  delivered: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  "on delivery": "border-blue-500/30 bg-blue-500/10 text-blue-400",
  shipping: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
  packing: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-400",
};

// Fixed avatar tints. Picked from the customer's email/name so a customer keeps
// the same colour regardless of how the table is sorted or paged.
const AVATAR_TINTS = [
  "bg-blue-500/15 text-blue-300",
  "bg-emerald-500/15 text-emerald-300",
  "bg-purple-500/15 text-purple-300",
  "bg-amber-500/15 text-amber-300",
  "bg-rose-500/15 text-rose-300",
  "bg-cyan-500/15 text-cyan-300",
];

function tintFor(key) {
  let sum = 0;
  for (let i = 0; i < key.length; i += 1) sum += key.charCodeAt(i);
  return AVATAR_TINTS[sum % AVATAR_TINTS.length];
}

function initials(name) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
}

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
          : "border-admin-line-stronger hover:border-admin-line-hover"
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
  "flex h-6 min-w-6 items-center justify-center rounded-md border border-admin-line-2 px-1 text-[10px] text-admin-fg-muted transition-colors hover:bg-admin-active hover:text-admin-fg disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent";

/* ------------------------------------------------------------------ */
/* Table                                                              */
/* ------------------------------------------------------------------ */

export default function OrdersTable({
  query = "",
  orders = [],
  loading = false,
  error = "",
  onRetry,
}) {
  const [sort, setSort] = useState({ col: null, dir: "asc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const found = q
      ? orders.filter(
          (o) =>
            o.customer.toLowerCase().includes(q) ||
            o.email.toLowerCase().includes(q) ||
            String(o.id).includes(q),
        )
      : orders;

    if (sort.col === null) return found;

    const { read } = COLUMNS[sort.col];
    const sign = sort.dir === "asc" ? 1 : -1;
    // Copy first: `found` is the source array when nothing is filtered out.
    return [...found].sort((a, b) => {
      const x = read(a);
      const y = read(b);
      return x === y ? 0 : (x > y ? 1 : -1) * sign;
    });
  }, [orders, query, sort]);

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

  // A single full-width message row reused for the loading / error / empty states.
  const renderStateRow = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={COLUMNS.length + 1} className="py-14 text-center text-[11px] text-admin-fg-dim">
            Loading orders…
          </td>
        </tr>
      );
    }
    if (error) {
      return (
        <tr>
          <td colSpan={COLUMNS.length + 1} className="py-14 text-center">
            <p className="text-[11px] text-red-400">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-admin-line-2 px-3 py-1.5 text-[11px] text-admin-fg-soft transition-colors hover:bg-admin-active"
              >
                <RotateCw size={12} />
                Retry
              </button>
            )}
          </td>
        </tr>
      );
    }
    return (
      <tr>
        <td colSpan={COLUMNS.length + 1} className="py-14 text-center text-[11px] text-admin-fg-dim">
          {query.trim() ? "No orders match your search." : "No orders yet."}
        </td>
      </tr>
    );
  };

  return (
    <div className="rounded-xl border border-admin-line bg-admin-panel">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse">
          <thead>
            <tr className="border-b border-admin-line bg-admin-hover">
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
                      className={`flex items-center gap-1 text-[11px] transition-colors hover:text-admin-fg ${
                        active ? "text-admin-fg" : "text-admin-fg-muted"
                      }`}
                    >
                      {col.label}
                      <Icon size={11} className={active ? "" : "text-admin-fg-faint"} />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {visible.length === 0
              ? renderStateRow()
              : visible.map((order) => {
                  const step = stepOf(order.status);
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-admin-line transition-colors last:border-0 hover:bg-admin-hover"
                    >
                      <td className="px-4 py-2.5">
                        <Checkbox
                          checked={selected.has(order.id)}
                          onChange={() => toggleRow(order.id)}
                          label={`Select order #${order.id}`}
                        />
                      </td>

                      <td className="px-3 py-2.5 text-[11px] tabular-nums text-admin-fg-muted">
                        #{order.id}
                      </td>

                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${tintFor(order.email || order.customer)}`}
                          >
                            {initials(order.customer)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-medium text-admin-fg">
                              {order.customer}
                            </p>
                            {order.email && (
                              <p className="truncate text-[10px] text-admin-fg-dim">{order.email}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-2.5 text-[11px] tabular-nums text-admin-fg-soft">
                        {order.itemCount}
                      </td>

                      <td className="px-3 py-2.5">
                        <span
                          className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[order.status] ?? "border-transparent text-admin-fg-muted"}`}
                        >
                          {titleCase(order.status)}
                        </span>
                      </td>

                      {TICK_COLUMNS.map((label, i) => {
                        const reached = step > i;
                        return (
                          <td key={label} className="px-3 py-2.5">
                            {reached ? (
                              <Check size={13} strokeWidth={2.5} className="text-emerald-500" />
                            ) : (
                              <X size={13} strokeWidth={2.5} className="text-admin-fg-faint" />
                            )}
                            <span className="sr-only">
                              {label}: {reached ? "yes" : "no"}
                            </span>
                          </td>
                        );
                      })}

                      <td className="px-3 py-2.5 text-[11px] tabular-nums text-admin-fg-soft">
                        {order.total.toFixed(2)}
                      </td>

                      <td className="px-3 py-2.5 text-[11px] tabular-nums text-admin-fg-muted">
                        {order.date}
                      </td>
                    </tr>
                  );
                })}
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
                ? "flex h-6 min-w-6 items-center justify-center rounded-md border border-admin-line-strong bg-admin-active px-1 text-[10px] font-medium text-admin-fg"
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
