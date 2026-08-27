import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  MoreVertical,
  Check,
  Minus,
  Tag,
  Star,
  Copy,
  Trash2,
  ImageOff,
  RotateCw,
} from "lucide-react";

import ManageDealModal from "./ManageDealModal";

const PAGE_SIZE = 14;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const LOW_STOCK_AT = 5;

// Single source of truth for the badge — a row can never read "In stock"
// while showing a stock count that says otherwise.
function statusOf(stock) {
  if (stock === 0) return "Out of stock";
  if (stock <= LOW_STOCK_AT) return "Low stock";
  return "In stock";
}

const money = (n) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_STYLES = {
  "In stock": "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  "Low stock": "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  "Out of stock": "border-red-500/30 bg-red-500/10 text-red-400",
};

function StatusBadge({ stock }) {
  const status = statusOf(stock);
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md border px-2 py-1 align-middle text-[10px] font-medium leading-none ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Thumbnail — image is optional, and a pasted URL can rot             */
/* ------------------------------------------------------------------ */

function ProductThumb({ src, name }) {
  const [failedSrc, setFailedSrc] = useState("");

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-admin-panel-3">
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
          size={13}
          className="text-admin-fg-faint"
          aria-label={`No image for ${name}`}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Checkbox                                                             */
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
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
        on
          ? "border-blue-500 bg-blue-500"
          : "border-admin-line-stronger hover:border-admin-line-hover"
      }`}
    >
      {indeterminate ? (
        <Minus size={10} strokeWidth={3.5} className="text-white" />
      ) : (
        checked && <Check size={10} strokeWidth={3.5} className="text-white" />
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
    <th scope="col" className={`px-4 py-3 text-left font-medium ${className}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`flex items-center gap-1 text-[12px] transition-colors hover:text-admin-fg ${
          active ? "text-admin-fg" : "text-admin-fg-muted"
        }`}
      >
        {label}
        <Icon size={12} strokeWidth={2} className={active ? "" : "text-admin-fg-faint"} />
      </button>
    </th>
  );
}

/* ------------------------------------------------------------------ */
/* Per-row actions menu                                                */
/* ------------------------------------------------------------------ */

const INERT_ACTIONS = [
  { label: "Duplicate", icon: Copy },
  { label: "Delete", icon: Trash2, danger: true },
];

function RowActions({ product, onManageDeal, onToggleFeatured }) {
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
        className="rounded-md p-1.5 text-admin-fg-dim transition-colors hover:bg-admin-active hover:text-admin-fg"
      >
        <MoreVertical size={15} strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-lg border border-admin-line-2 bg-admin-panel-3 py-1 shadow-xl shadow-black/40">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onManageDeal(product);
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-admin-fg-soft transition-colors hover:bg-admin-active hover:text-admin-fg"
          >
            <Tag size={13} strokeWidth={1.75} />
            {product.discountPercent > 0 ? "Manage deal" : "Add to deals"}
          </button>

          {onToggleFeatured && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onToggleFeatured(product);
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-admin-fg-soft transition-colors hover:bg-admin-active hover:text-admin-fg"
            >
              <Star
                size={13}
                strokeWidth={1.75}
                className={product.featured ? "fill-amber-400 text-amber-400" : ""}
              />
              {product.featured ? "Unfeature" : "Feature on homepage"}
            </button>
          )}

          {INERT_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => setOpen(false)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors hover:bg-admin-active ${
                  action.danger ? "text-red-400" : "text-admin-fg-soft hover:text-admin-fg"
                }`}
              >
                <Icon size={13} strokeWidth={1.75} />
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
/* Simple footer pagination — "Showing X of Y" + Prev / page / Next    */
/* ------------------------------------------------------------------ */

function Pagination({ page, pageCount, totalCount, onPage }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-[12px] text-admin-fg-dim">
        Showing {totalCount} of {totalCount} products
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          className="rounded-lg border border-admin-line-2 px-3 py-1.5 text-[12px] text-admin-fg-soft transition-colors hover:bg-admin-active hover:text-admin-fg disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
        >
          Prev
        </button>

        <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-blue-500 px-2 text-[12px] font-medium text-white">
          {page}
        </span>

        <button
          type="button"
          disabled={page === pageCount}
          onClick={() => onPage(page + 1)}
          className="rounded-lg border border-admin-line-2 px-3 py-1.5 text-[12px] text-admin-fg-soft transition-colors hover:bg-admin-active hover:text-admin-fg disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Table                                                               */
/* ------------------------------------------------------------------ */

const SORTERS = {
  name: (p) => p.name.toLowerCase(),
  category: (p) => p.category.toLowerCase(),
  price: (p) => p.price,
  stock: (p) => p.stock,
  status: (p) => p.stock,
};

const COLUMN_COUNT = 7;

export default function ProductsTable({
  products = [],
  loading = false,
  error = "",
  onRetry,
  onAddProduct,
  onUpdateProduct,
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());
  const [dealProduct, setDealProduct] = useState(null);

  const categories = useMemo(
    () => ["All", ...new Set(products.map((p) => p.category))],
    [products],
  );

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
    return [...filtered].sort((a, b) => {
      const x = read(a);
      const y = read(b);
      return x === y ? 0 : (x > y ? 1 : -1) * sign;
    });
  }, [products, query, activeCategory, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const selectedOnPage = visible.filter((p) => selected.has(p.id)).length;
  const allOnPageSelected = visible.length > 0 && selectedOnPage === visible.length;

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
      visible.forEach((p) => (allOnPageSelected ? next.delete(p.id) : next.add(p.id)));
      return next;
    });

  const onSort = (key) =>
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );

  const renderStateRow = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={COLUMN_COUNT} className="px-3 py-14 text-center text-[12px] text-admin-fg-dim">
            Loading products…
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={COLUMN_COUNT} className="px-3 py-14 text-center">
            <p className="text-[12px] text-red-400">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-admin-line-2 px-3 py-1.5 text-[12px] text-admin-fg-soft transition-colors hover:bg-admin-active"
              >
                <RotateCw size={13} />
                Retry
              </button>
            )}
          </td>
        </tr>
      );
    }

    const filtering = query.trim() || activeCategory !== "All";
    return (
      <tr>
        <td colSpan={COLUMN_COUNT} className="px-3 py-14 text-center">
          <p className="text-[12px] text-admin-fg-dim">
            {filtering ? "No products match your search." : "No products yet. Add your first one to get started."}
          </p>
          {!filtering && onAddProduct && (
            <button
              type="button"
              onClick={onAddProduct}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[12px] font-medium text-admin-bg transition-colors hover:bg-zinc-200"
            >
              <Plus size={13} strokeWidth={2.25} />
              Add product
            </button>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="rounded-xl border border-admin-line bg-admin-panel">
      {/* Toolbar — title + search + category filter + add product, all in one row */}
      <div className="flex flex-wrap items-center gap-3 border-b border-admin-line px-5 py-4">
        <h2 className="text-[20px] font-bold text-admin-fg">Products</h2>

        <div className="relative ml-2">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-admin-fg-dim"
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
            className="w-48 rounded-lg border border-admin-line-2 bg-admin-panel-2 py-2 pl-9 pr-3 text-[12px] text-admin-fg outline-none transition-colors placeholder:text-admin-fg-dim focus:border-admin-line-strong"
          />
        </div>

        <div className="relative">
          <select
            value={activeCategory}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by category"
            className="cursor-pointer appearance-none rounded-lg border border-admin-line-2 bg-admin-panel-2 py-2 pl-3 pr-8 text-[12px] text-admin-fg outline-none transition-colors focus:border-admin-line-strong"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-admin-panel-3">
                {c === "All" ? "All categories" : c}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-fg-dim"
          />
        </div>

        <button
          type="button"
          onClick={onAddProduct}
          className="ml-auto flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-white px-4 py-2 text-[12px] font-medium text-admin-bg transition-colors hover:bg-zinc-200"
        >
          <Plus size={14} strokeWidth={2.5} />
          Add product
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-admin-line">
              <th scope="col" className="w-10 px-4 py-3">
                <Checkbox
                  checked={allOnPageSelected}
                  indeterminate={selectedOnPage > 0 && !allOnPageSelected}
                  onChange={togglePage}
                  label="Select all products on this page"
                />
              </th>

              <SortHeader label="Product" sortKey="name" sort={sort} onSort={onSort} />
              <SortHeader label="Category" sortKey="category" sort={sort} onSort={onSort} className="w-32" />
              <SortHeader label="Price" sortKey="price" sort={sort} onSort={onSort} className="w-40" />
              <SortHeader label="Stock" sortKey="stock" sort={sort} onSort={onSort} className="w-20" />
              <SortHeader label="Status" sortKey="status" sort={sort} onSort={onSort} className="w-28" />

              <th scope="col" className="w-10 px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {visible.length === 0
              ? renderStateRow()
              : visible.map((product) => {
                  const outOfStock = product.stock === 0;
                  return (
                    <tr
                      key={product.id}
                      className={`border-b border-admin-line transition-colors last:border-0 hover:bg-admin-hover ${
                        outOfStock ? "border-l-2 border-l-red-500 bg-red-500/[0.03]" : "border-l-2 border-l-transparent"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selected.has(product.id)}
                          onChange={() => toggleRow(product.id)}
                          label={`Select ${product.name}`}
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ProductThumb src={product.image} name={product.name} />
                          <span className="text-[13px] font-medium text-admin-fg">{product.name}</span>
                          {product.featured && (
                            <Star
                              size={12}
                              className="shrink-0 fill-amber-400 text-amber-400"
                              aria-label="Featured on homepage"
                            />
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-[12px] text-blue-400">{product.category}</td>

                      <td className="px-4 py-3 text-[12px] tabular-nums text-admin-fg-soft">
                        <div className="flex items-center gap-2">
                          {product.discountPercent > 0 ? (
                            <>
                              <span className="text-admin-fg-dim line-through">{money(product.price)}</span>
                              <span className="font-medium text-admin-fg">
                                {money(product.price * (1 - product.discountPercent / 100))}
                              </span>
                              <span className="inline-flex items-center whitespace-nowrap rounded border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-red-400">
                                -{product.discountPercent}%
                              </span>
                            </>
                          ) : (
                            <span>{money(product.price)}</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-[12px] tabular-nums text-blue-400">{product.stock}</td>

                      <td className="px-4 py-3">
                        <StatusBadge stock={product.stock} />
                      </td>

                      <td className="px-4 py-3">
                        <RowActions
                          product={product}
                          onManageDeal={setDealProduct}
                          onToggleFeatured={
                            onUpdateProduct
                              ? (p) => onUpdateProduct(p.id, { featured: !p.featured })
                              : undefined
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {visible.length > 0 && (
        <Pagination page={safePage} pageCount={pageCount} totalCount={rows.length} onPage={setPage} />
      )}

      {dealProduct && (
        <ManageDealModal
          product={dealProduct}
          onClose={() => setDealProduct(null)}
          onUpdate={async (id, patch) => {
            if (!onUpdateProduct) {
              return { success: false, error: "Updating is unavailable." };
            }
            const result = await onUpdateProduct(id, patch);
            if (result?.success) setDealProduct(null);
            return result;
          }}
        />
      )}
    </div>
  );
}