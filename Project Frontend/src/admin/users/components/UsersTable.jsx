import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Minus,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCw,
  MoreVertical,
  UserCheck,
  Ban,
  Trash2,
  AlertTriangle,
} from "lucide-react";

const PAGE_SIZE = 10;

// Each column reads the value its cell shows, so sorting matches what's visible.
const COLUMNS = [
  { label: "User", read: (u) => u.name.toLowerCase() },
  { label: "Email", read: (u) => u.email.toLowerCase() },
  { label: "Role", read: (u) => u.role, width: "w-28" },
  { label: "Status", read: (u) => u.status, width: "w-32" },
  { label: "Joined", read: (u) => u.joined, width: "w-32" },
];

const STATUS_STYLES = {
  Active: "text-emerald-400",
  Invited: "text-gray-200 font-medium",
  Suspended: "rounded-md border border-yellow-500/30 bg-yellow-500/10 px-1.5 py-0.5 text-yellow-400",
};

// Fixed avatar tints. Picked from the email so a user keeps the same colour
// regardless of how the table is sorted or paged.
const AVATAR_TINTS = [
  "bg-blue-500/15 text-blue-300",
  "bg-emerald-500/15 text-emerald-300",
  "bg-purple-500/15 text-purple-300",
  "bg-amber-500/15 text-amber-300",
  "bg-rose-500/15 text-rose-300",
  "bg-cyan-500/15 text-cyan-300",
];

function tintFor(email) {
  let sum = 0;
  for (let i = 0; i < email.length; i += 1) sum += email.charCodeAt(i);
  return AVATAR_TINTS[sum % AVATAR_TINTS.length];
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
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
/* Per-row actions: activate / suspend / delete                        */
/* ------------------------------------------------------------------ */

const menuItem =
  "flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] transition-colors hover:bg-white/[0.06]";

function RowActions({ user, openUp = false, onSetStatus, onRequestDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
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

  // Close before running so the menu never lingers over the optimistic re-render.
  const run = (fn) => {
    setOpen(false);
    fn();
  };

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        type="button"
        aria-label={`Actions for ${user.name}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-1 text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-white"
      >
        <MoreVertical size={14} />
      </button>

      {open && (
        // Bottom rows open upward: the table's overflow-x-auto wrapper also
        // clips vertically, so a downward menu on the last rows gets cut off.
        <div
          className={`absolute right-0 z-20 w-36 overflow-hidden rounded-lg border border-white/[0.1] bg-[#1b1b1e] py-1 shadow-xl shadow-black/40 ${
            openUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {user.status !== "Active" && (
            <button
              type="button"
              onClick={() => run(() => onSetStatus(user.id, "Active"))}
              className={`${menuItem} text-gray-300 hover:text-white`}
            >
              <UserCheck size={12} className="text-emerald-400" />
              Activate
            </button>
          )}

          {user.status !== "Suspended" && (
            <button
              type="button"
              onClick={() => run(() => onSetStatus(user.id, "Suspended"))}
              className={`${menuItem} text-gray-300 hover:text-white`}
            >
              <Ban size={12} className="text-yellow-400" />
              Suspend
            </button>
          )}

          <button
            type="button"
            onClick={() => run(() => onRequestDelete(user))}
            className={`${menuItem} text-red-400`}
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Delete confirmation — deletion hits the DB and can't be undone      */
/* ------------------------------------------------------------------ */

function ConfirmDeleteDialog({ user, onCancel, onConfirm }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-user-title"
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl border border-white/[0.1] bg-[#1b1b1e] p-5 shadow-2xl shadow-black/50"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <AlertTriangle size={18} />
          </span>
          <div className="min-w-0">
            <h3 id="delete-user-title" className="text-[13px] font-semibold text-white">
              Delete user?
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
              This permanently removes{" "}
              <span className="font-medium text-gray-200">{user.name}</span> ({user.email}). This
              action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/[0.12] px-3 py-1.5 text-[11px] text-gray-200 transition-colors hover:bg-white/[0.06]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-1.5 rounded-lg bg-red-500/90 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-red-500"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Table                                                              */
/* ------------------------------------------------------------------ */

export default function UsersTable({
  query = "",
  users = [],
  loading = false,
  error = "",
  onRetry,
  onSetStatus = () => {},
  onDelete = () => {},
}) {
  const [sort, setSort] = useState({ col: null, dir: "asc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());
  const [confirmUser, setConfirmUser] = useState(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const found = q
      ? users.filter(
          (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
        )
      : users;

    if (sort.col === null) return found;

    const { read } = COLUMNS[sort.col];
    const sign = sort.dir === "asc" ? 1 : -1;
    // Copy first: `found` is the source array when nothing is filtered out.
    return [...found].sort((a, b) => {
      const x = read(a);
      const y = read(b);
      return x === y ? 0 : (x > y ? 1 : -1) * sign;
    });
  }, [users, query, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  // Clamp on read so a narrowed search can't strand `page` past the last page.
  const current = Math.min(page, pageCount);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const pickedOnPage = visible.filter((u) => selected.has(u.id)).length;
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
      visible.forEach((u) => (allOnPage ? next.delete(u.id) : next.add(u.id)));
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
          <td colSpan={COLUMNS.length + 2} className="py-14 text-center text-[11px] text-gray-500">
            Loading users…
          </td>
        </tr>
      );
    }
    if (error) {
      return (
        <tr>
          <td colSpan={COLUMNS.length + 2} className="py-14 text-center">
            <p className="text-[11px] text-red-400">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] px-3 py-1.5 text-[11px] text-gray-200 transition-colors hover:bg-white/[0.06]"
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
        <td colSpan={COLUMNS.length + 1} className="py-14 text-center text-[11px] text-gray-500">
          {query.trim() ? "No users match your search." : "No registered users yet."}
        </td>
      </tr>
    );
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#141416]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.015]">
              <th scope="col" className="w-10 px-4 py-3">
                <Checkbox
                  checked={allOnPage}
                  indeterminate={pickedOnPage > 0 && !allOnPage}
                  onChange={togglePage}
                  label="Select all users on this page"
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

              <th scope="col" className="w-10 px-3 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {visible.length === 0
              ? renderStateRow()
              : visible.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-2.5">
                      <Checkbox
                        checked={selected.has(user.id)}
                        onChange={() => toggleRow(user.id)}
                        label={`Select ${user.name}`}
                      />
                    </td>

                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${tintFor(user.email)}`}
                        >
                          {initials(user.name)}
                        </span>
                        <span className="text-[11px] font-medium text-white">{user.name}</span>
                      </div>
                    </td>

                    <td className="px-3 py-2.5 text-[11px] text-gray-400">{user.email}</td>

                    <td className="px-3 py-2.5 text-[11px] text-gray-300">{user.role}</td>

                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-medium ${STATUS_STYLES[user.status] ?? "text-gray-300"}`}>
                        {user.status}
                      </span>
                    </td>

                    <td className="px-3 py-2.5 text-[11px] tabular-nums text-gray-400">{user.joined}</td>

                    <td className="px-3 py-2.5">
                      <RowActions
                        user={user}
                        openUp={visible.length > 5 && index >= visible.length - 2}
                        onSetStatus={onSetStatus}
                        onRequestDelete={setConfirmUser}
                      />
                    </td>
                  </tr>
                ))}
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

      {confirmUser && (
        <ConfirmDeleteDialog
          user={confirmUser}
          onCancel={() => setConfirmUser(null)}
          onConfirm={() => {
            onDelete(confirmUser.id);
            setConfirmUser(null);
          }}
        />
      )}
    </div>
  );
}
