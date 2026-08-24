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
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const BASE = [
  {
    name: "Wireless Headphones",
    sku: "WH-1000XM5",
    category: "Electronics",
    price: 399,
    stock: 25,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&q=80",
  },
  {
    name: "Apple Watch Series 10",
    sku: "AW-S10-GPS",
    category: "Electronics",
    price: 699,
    stock: 19,
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=80&q=80",
  },
  {
    name: "Dell Laptop",
    sku: "DELL-LAT-I7",
    category: "Electronics",
    price: 1200,
    stock: 5,
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=80&q=80",
  },
  {
    name: "iPhone",
    sku: "IPHONE-15-PRO",
    category: "Electronics",
    price: 999,
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=80&q=80",
  },
  {
    name: "LG OLED evo G4 55",
    sku: "LG-OLED-G4-55",
    category: "Electronics",
    price: 1800,
    stock: 5,
    image:
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=80&q=80",
  },
  {
    name: "LG UltraGear 27GR83Q-B",
    sku: "LG-ULTRAGEAR-27",
    category: "Electronics",
    price: 350,
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=80&q=80",
  },
  {
    name: "MSI MAG 271QPX QD-OLED",
    sku: "MSI-MAG-27-OLED",
    category: "Electronics",
    price: 450,
    stock: 14,
    image:
      "https://images.unsplash.com/photo-1616763355603-9755a640a287?w=80&q=80",
  },
  {
    name: "Sony Headphones",
    sku: "SONY-WH-CH720N",
    category: "Audio",
    price: 150,
    stock: 12,
    image:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=80&q=80",
  },
  {
    name: "MX Master Mouse",
    sku: "MX-MASTER-3S",
    category: "Accessories",
    price: 99,
    stock: 23,
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=80&q=80",
  },
  {
    name: "Macbook Pro",
    sku: "MACBOOK-PRO",
    category: "Electronics",
    price: 999,
    stock: 50,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=80&q=80",
  },
  {
    name: "Keychron K2 Pro",
    sku: "KEYCHRON-K2-PRO",
    category: "Accessories",
    price: 189,
    stock: 31,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&q=80",
  },
  {
    name: "Samsung 990 Pro 2TB",
    sku: "SAM-990PRO-2TB",
    category: "Components",
    price: 219,
    stock: 4,
    image:
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=80&q=80",
  },
  {
    name: "iPad Air M2",
    sku: "IPAD-AIR-M2",
    category: "Electronics",
    price: 749,
    stock: 17,
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=80&q=80",
  },
  {
    name: "Logitech C920 Webcam",
    sku: "LOGI-C920-HD",
    category: "Accessories",
    price: 79,
    stock: 0,
    image:
      "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=80&q=80",
  },
];

// The reference table paginates over five pages of the same catalog. Copies
// past the first get a -N SKU suffix so every row keeps a unique key, and
// their stock is rotated so the Status column isn't five identical pages.
const STOCK_CYCLE = [25, 3, 19, 41, 0, 8, 62, 5, 12, 1, 34, 9, 27, 16];
const PAGES_OF_DATA = 5;

const PRODUCTS = Array.from({ length: PAGES_OF_DATA }, (_, copy) =>
  BASE.map((product, i) => ({
    ...product,
    id: `${product.sku}-${copy}`,
    sku: copy === 0 ? product.sku : `${product.sku}-${copy + 1}`,
    stock:
      copy === 0
        ? product.stock
        : STOCK_CYCLE[(i + copy * 3) % STOCK_CYCLE.length],
  })),
).flat();

const CATEGORIES = ["All", ...new Set(BASE.map((p) => p.category))];
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
          : "border-white/[0.18] hover:border-white/40"
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
        className={`flex items-center gap-1 text-[10px] transition-colors hover:text-white ${
          active ? "text-white" : "text-gray-400"
        }`}
      >
        {label}
        <Icon
          size={11}
          strokeWidth={2}
          className={active ? "" : "text-gray-600"}
        />
      </button>
    </th>
  );
}

/* ------------------------------------------------------------------ */
/* Per-row actions menu                                                */
/* ------------------------------------------------------------------ */

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
        className="rounded-md p-1 text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-white"
      >
        <MoreVertical size={14} strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-32 overflow-hidden rounded-lg border border-white/[0.1] bg-[#1b1b1e] py-1 shadow-xl shadow-black/40">
          {ROW_ACTIONS.map((action) => {
            // Capitalized local so it renders as a component — a destructured
            // `icon: Icon` arg falsely lints as unused (see AdminSidebar).
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => setOpen(false)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] transition-colors hover:bg-white/[0.06] ${
                  action.danger
                    ? "text-red-400"
                    : "text-gray-300 hover:text-white"
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
  "flex h-6 min-w-6 items-center justify-center rounded-md border border-white/[0.08] px-1 text-[10px] text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-gray-400";

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
              ? "flex h-6 min-w-6 items-center justify-center rounded-md border border-white/[0.16] bg-white/[0.08] px-1 text-[10px] font-medium text-white"
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
  sku: (p) => p.sku.toLowerCase(),
  category: (p) => p.category.toLowerCase(),
  price: (p) => p.price,
  stock: (p) => p.stock,
  status: (p) => p.stock,
};

export default function ProductsTable() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = PRODUCTS.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)),
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
  }, [query, category, sort]);

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

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#141416]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <h2 className="text-[13px] font-semibold text-white">Products</h2>

        {selected.size > 0 && (
          <span className="text-[10px] text-gray-500">
            {selected.size} selected
          </span>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"
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
              className="w-40 rounded-lg border border-white/[0.08] bg-[#0f0f11] py-1.5 pl-8 pr-2.5 text-[11px] text-white outline-none transition-colors placeholder:text-gray-500 focus:border-white/[0.16] sm:w-52"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by category"
              className="w-28 cursor-pointer appearance-none rounded-lg border border-white/[0.08] bg-[#0f0f11] py-1.5 pl-2.5 pr-7 text-[11px] text-white outline-none transition-colors focus:border-white/[0.16] sm:w-32"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#1b1b1e]">
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/[0.14] px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-white/[0.06]"
          >
            <Plus size={13} strokeWidth={2.25} />
            Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.015]">
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
                label="SKU"
                sortKey="sku"
                sort={sort}
                onSort={onSort}
                className="w-40"
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
            {visible.map((product) => (
              <tr
                key={product.id}
                className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.02]"
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
                    <div className="h-7 w-7 shrink-0 overflow-hidden rounded-md bg-[#292929]">
                      <img
                        src={product.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-white">
                      {product.name}
                    </span>
                  </div>
                </td>

                <td className="px-3 py-2 text-[10px] uppercase tracking-wide text-gray-500">
                  {product.sku}
                </td>

                <td className="px-3 py-2 text-[10px] text-gray-400">
                  {product.category}
                </td>

                <td className="px-3 py-2 text-[10px] tabular-nums text-gray-300">
                  {money(product.price)}
                </td>

                <td className="px-3 py-2 text-[10px] tabular-nums text-gray-400">
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

            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-14 text-center text-[11px] text-gray-500"
                >
                  No products match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={safePage} pageCount={pageCount} onPage={setPage} />
    </div>
  );
}
