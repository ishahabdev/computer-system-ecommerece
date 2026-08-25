import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  Check,
  Minus,
  Pencil,
  Copy,
  Trash2,
  ImageOff,
  RotateCw,
} from "lucide-react";

const PAGE_SIZE = 14;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const LOW_STOCK_AT = 5;

// Single source of truth for the badge — a row can never read "In Stock"
// while showing a stock count that says otherwise.
function statusOf(stock) {
  if (stock === 0) return "Out of Stock";
  if (stock <= LOW_STOCK_AT) return "Low Stock";
  return "In Stock";
}

const money = (n) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_STYLES = {
  "In Stock": "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  "Low Stock": "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  "Out of Stock": "border-red-500/30 bg-red-500/10 text-red-400",
};

function StatusBadge({ stock }) {
  const status = statusOf(stock);
  return (
    // inline-flex + leading-none: as a plain inline span the padded box
    // baseline-aligns and renders ~3px below the row's other cells.
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md border px-1.5 py-0.5 align-middle text-[9px] font-medium leading-none ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Thumbnail — image is optional, and a pasted URL can rot             */
/* ------------------------------------------------------------------ */

function ProductThumb({ src, name }) {
  // Remembering which URL failed, rather than a bare "it failed" flag, lets the
  // placeholder clear itself when the row is given a different image — no effect
  // needed to reset it.
  const [failedSrc, setFailedSrc] = useState("");

  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-admin-panel-3">
      {src && src !== failedSrc ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailedSrc(src)}
          className="h-full w-full object-cover"
        />
      ) : (
        <ImageOff
          size={12}
          className="text-admin-fg-faint"
          aria-label={`No image for ${name}`}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Checkbox — React owns `checked`, so the tick can render as an icon   */
/* ------------------------------------------------------------------ */

function Checkbox({ checked, indeterminate = false, onChange, label }) {
  const on = checked || indeterminate;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      onClick={onChange}
      className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
        on
          ? "border-emerald-500 bg-emerald-500"
          : "border-admin-line-stronger hover:border-admin-line-hover"
      }`}
    >
      {indeterminate ? (
        <Minus size={10} strokeWidth={3.5} className="text-[#0a0a0b]" />
      ) : (
        checked && (
          <Check size={10} strokeWidth={3.5} className="text-[#0a0a0b]" />
        )
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Sortable column header                                              */
/* ------------------------------------------------------------------ */

function SortHeader({ label, sortKey, sort, onSort, className = "" }) {
  const active = sort.key === sortKey;
  const Icon = !active
    ? ChevronsUpDown
    : sort.dir === "asc"
      ? ChevronUp
      : ChevronDown;

  return (
    <th
      scope="col"
      className={`px-3 py-2.5 text-left font-medium ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`flex items-center gap-1 text-[10px] transition-colors hover:text-admin-fg ${
          active ? "text-admin-fg" : "text-admin-fg-muted"
        }`}
      >
        {label}
        <Icon
          size={11}
          strokeWidth={2}
          className={active ? "" : "text-admin-fg-faint"}
        />
      </button>
    </th>
  );
}

/* ------------------------------------------------------------------ */
/* Per-row actions menu                                                */
/* ------------------------------------------------------------------ */

// Edit / Duplicate / Delete still need backend endpoints (the API is create +
// read only for now), so the menu opens but the items are inert.
const ROW_ACTIONS = [
  { label: "Edit", icon: Pencil },
  { label: "Duplicate", icon: Copy },
  { label: "Delete", icon: Trash2, danger: true },
];

function RowActions({ product }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        type="button"
        aria-label={`Actions for ${product.name}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-1 text-admin-fg-dim transition-colors hover:bg-admin-active hover:text-admin-fg"
      >
        <MoreVertical size={14} strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-32 overflow-hidden rounded-lg border border-admin-line-2 bg-admin-panel-3 py-1 shadow-xl shadow-black/40">
          {ROW_ACTIONS.map((action) => {
            // Capitalized local so it renders as a component — a destructured
            // `icon: Icon` arg falsely lints as unused (see AdminSidebar).
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => setOpen(false)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] transition-colors hover:bg-admin-active ${
                  action.danger
                    ? "text-red-400"
                    : "text-admin-fg-soft hover:text-admin-fg"
                }`}
              >
                <Icon size={12} strokeWidth={1.75} />
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pagination                                                          */
/* ------------------------------------------------------------------ */

const pageBtn =
  "flex h-6 min-w-6 items-center justify-center rounded-md border border-admin-line-2 px-1 text-[10px] text-admin-fg-muted transition-colors hover:bg-admin-active hover:text-admin-fg disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-admin-fg-muted";

const WINDOW = 5;

function Pagination({ page, pageCount, onPage }) {
  // Slide a fixed-width window so the control never grows with the dataset.
  const start = Math.max(
    1,
    Math.min(page - Math.floor(WINDOW / 2), pageCount - WINDOW + 1),
  );
  const pages = Array.from(
    { length: Math.min(WINDOW, pageCount) },
    (_, i) => start + i,
  );

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-end gap-1 px-4 py-3"
    >
      <button
        type="button"
        aria-label="First page"
        className={pageBtn}
        disabled={page === 1}
        onClick={() => onPage(1)}
      >
        <ChevronsLeft size={12} strokeWidth={2} />
      </button>

      <button
        type="button"
        aria-label="Previous page"
        className={pageBtn}
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
      >
        <ChevronLeft size={12} strokeWidth={2} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-label={`Page ${p}`}
          aria-current={p === page ? "page" : undefined}
          onClick={() => onPage(p)}
          className={
            p === page
              ? "flex h-6 min-w-6 items-center justify-center rounded-md border border-admin-line-strong bg-admin-active px-1 text-[10px] font-medium text-admin-fg"
              : pageBtn
          }
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        aria-label="Next page"
        className={pageBtn}
        disabled={page === pageCount}
        onClick={() => onPage(page + 1)}
      >
        <ChevronRight size={12} strokeWidth={2} />
      </button>

      <button
        type="button"
        aria-label="Last page"
        className={pageBtn}
        disabled={page === pageCount}
        onClick={() => onPage(pageCount)}
      >
        <ChevronsRight size={12} strokeWidth={2} />
      </button>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Table                                                               */
/* ------------------------------------------------------------------ */

// Sort reads the same derived values the cells render, so ordering always
// matches what's on screen (Status sorts by severity, not alphabetically).
const SORTERS = {
  name: (p) => p.name.toLowerCase(),
  category: (p) => p.category.toLowerCase(),
  price: (p) => p.price,
  stock: (p) => p.stock,
  status: (p) => p.stock,
};

// Checkbox + 5 data columns + actions.
const COLUMN_COUNT = 7;

export default function ProductsTable({
  products = [],
  loading = false,
  error = "",
  onRetry,
  onAddProduct,
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());

  const categories = useMemo(
    () => ["All", ...new Set(products.map((p) => p.category))],
    [products],
  );

  // Clamp on read, like `page` below: a reload can drop the category that was
  // filtered on, which would otherwise show an empty table with no way back.
  const activeCategory = categories.includes(category) ? category : "All";

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = products.filter(
      (p) =>
        (activeCategory === "All" || p.category === activeCategory) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)),
    );

    if (!sort.key) return filtered;

    const read = SORTERS[sort.key];
    const sign = sort.dir === "asc" ? 1 : -1;
    // Copy first — filtered can be the source array when no filter is active.
    return [...filtered].sort((a, b) => {
      const x = read(a);
      const y = read(b);
      return x === y ? 0 : (x > y ? 1 : -1) * sign;
    });
  }, [products, query, activeCategory, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  // Clamp on read rather than storing a corrected page — narrowing the
  // results can otherwise strand `page` past the end for a render.
  const safePage = Math.min(page, pageCount);
  const visible = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const selectedOnPage = visible.filter((p) => selected.has(p.id)).length;
  const allOnPageSelected =
    visible.length > 0 && selectedOnPage === visible.length;

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
      visible.forEach((p) =>
        allOnPageSelected ? next.delete(p.id) : next.add(p.id),
      );
      return next;
    });

  const onSort = (key) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );

  // One full-width message row, reused for the loading / error / empty states.
  const renderStateRow = () => {
    if (loading) {
      return (
        <tr>
          <td
            colSpan={COLUMN_COUNT}
            className="px-3 py-14 text-center text-[11px] text-admin-fg-dim"
          >
            Loading products…
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={COLUMN_COUNT} className="px-3 py-14 text-center">
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

    // An empty catalog and a too-narrow search need different advice.
    const filtering = query.trim() || activeCategory !== "All";
    return (
      <tr>
        <td colSpan={COLUMN_COUNT} className="px-3 py-14 text-center">
          <p className="text-[11px] text-admin-fg-dim">
            {filtering
              ? "No products match your search."
              : "No products yet. Add your first one to get started."}
          </p>
          {!filtering && onAddProduct && (
            <button
              type="button"
              onClick={onAddProduct}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-admin-line-strong px-3 py-1.5 text-[11px] font-medium text-admin-fg transition-colors hover:bg-admin-active"
            >
              <Plus size={12} strokeWidth={2.25} />
              Add Product
            </button>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="rounded-xl border border-admin-line bg-admin-panel">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-admin-line px-4 py-3">
        <h2 className="text-[13px] font-semibold text-admin-fg">Products</h2>

        {selected.size > 0 && (
          <span className="text-[10px] text-admin-fg-dim">
            {selected.size} selected
          </span>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-admin-fg-dim"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search..."
              aria-label="Search products"
              className="w-40 rounded-lg border border-admin-line-2 bg-admin-panel-2 py-1.5 pl-8 pr-2.5 text-[11px] text-admin-fg outline-none transition-colors placeholder:text-admin-fg-dim focus:border-admin-line-strong sm:w-52"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <select
              value={activeCategory}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by category"
              className="w-28 cursor-pointer appearance-none rounded-lg border border-admin-line-2 bg-admin-panel-2 py-1.5 pl-2.5 pr-7 text-[11px] text-admin-fg outline-none transition-colors focus:border-admin-line-strong sm:w-32"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-admin-panel-3">
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-fg-dim"
            />
          </div>

          <button
            type="button"
            onClick={onAddProduct}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-admin-line-strong px-3 py-1.5 text-[11px] font-medium text-admin-fg transition-colors hover:bg-admin-active"
          >
            <Plus size={13} strokeWidth={2.25} />
            Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-admin-line bg-admin-hover">
              <th scope="col" className="w-10 px-3 py-2.5">
                <Checkbox
                  checked={allOnPageSelected}
                  indeterminate={selectedOnPage > 0 && !allOnPageSelected}
                  onChange={togglePage}
                  label="Select all products on this page"
                />
              </th>

              <SortHeader
                label="Product"
                sortKey="name"
                sort={sort}
                onSort={onSort}
              />
              <SortHeader
                label="Category"
                sortKey="category"
                sort={sort}
                onSort={onSort}
                className="w-32"
              />
              <SortHeader
                label="Price"
                sortKey="price"
                sort={sort}
                onSort={onSort}
                className="w-28"
              />
              <SortHeader
                label="Stock"
                sortKey="stock"
                sort={sort}
                onSort={onSort}
                className="w-24"
              />
              <SortHeader
                label="Status"
                sortKey="status"
                sort={sort}
                onSort={onSort}
                className="w-28"
              />

              <th scope="col" className="w-10 px-3 py-2.5">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {visible.length === 0
              ? renderStateRow()
              : visible.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-admin-line transition-colors last:border-0 hover:bg-admin-hover"
                  >
                    <td className="px-3 py-2">
                      <Checkbox
                        checked={selected.has(product.id)}
                        onChange={() => toggleRow(product.id)}
                        label={`Select ${product.name}`}
                      />
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <ProductThumb
                          src={product.image}
                          name={product.name}
                        />
                        <span className="text-[11px] font-medium text-admin-fg">
                          {product.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-2 text-[10px] text-admin-fg-muted">
                      {product.category}
                    </td>

                    <td className="px-3 py-2 text-[10px] tabular-nums text-admin-fg-soft">
                      {money(product.price)}
                    </td>

                    <td className="px-3 py-2 text-[10px] tabular-nums text-admin-fg-muted">
                      {product.stock}
                    </td>

                    <td className="px-3 py-2">
                      <StatusBadge stock={product.stock} />
                    </td>

                    <td className="px-3 py-2">
                      <RowActions product={product} />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <Pagination page={safePage} pageCount={pageCount} onPage={setPage} />
    </div>
  );
}
