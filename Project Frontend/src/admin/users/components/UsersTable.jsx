import { useEffect, useMemo, useState } from "react";
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
  Invited: "text-admin-fg-soft font-medium",
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
/* Per-row actions: inline suspend/activate toggle + delete            */
/* ------------------------------------------------------------------ */

const actionBtn =
  "rounded-md p-[2px] text-admin-fg-dim transition-colors hover:bg-admin-active";

function RowActions({ user, onSetStatus, onRequestDelete }) {
  const suspended = user.status === "Suspended";

  return (
    <div className="flex items-center justify-end gap-0">
      {/* Suspend flips to Activate once the account is suspended. `title` gives
          the native hover tooltip; aria-label carries the name for a11y. */}
      {suspended ? (
        <button
          type="button"
          title="Activate"
          aria-label={`Activate ${user.name}`}
          onClick={() => onSetStatus(user.id, "Active")}
          className={`${actionBtn} `}
        >
         <span className="text-emerald-400 "> <UserCheck size={14}  /></span>
        </button>
      ) : (
        <button
          type="button"
          title="Suspend"
          aria-label={`Suspend ${user.name}`}
          onClick={() => onSetStatus(user.id, "Suspended")}
          className={`${actionBtn} text-yellow-400`}
        >
          <Ban size={14} />
        </button>
      )}

      <button
        type="button"
        title="Delete"
        aria-label={`Delete ${user.name}`}
        onClick={() => onRequestDelete(user)}
        className={`${actionBtn} text-red-400`}
      >
        <Trash2 size={14} />
      </button>
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
        className="w-full max-w-sm rounded-xl border border-admin-line-2 bg-admin-panel-3 p-5 shadow-2xl shadow-black/50"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <AlertTriangle size={18} />
          </span>
          <div className="min-w-0">
            <h3 id="delete-user-title" className="text-[13px] font-semibold text-admin-fg">
              Delete user?
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-admin-fg-muted">
              This permanently removes{" "}
              <span className="font-medium text-admin-fg-soft">{user.name}</span> ({user.email}). This
              action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-admin-line-2 px-3 py-1.5 text-[11px] text-admin-fg-soft transition-colors hover:bg-admin-active"
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
          <td colSpan={COLUMNS.length + 2} className="py-14 text-center text-[11px] text-admin-fg-dim">
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
          {query.trim() ? "No users match your search." : "No registered users yet."}
        </td>
      </tr>
    );
  };

  return (
    <div className="rounded-xl border border-admin-line bg-admin-panel">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-admin-line bg-admin-hover">
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

              <th
                scope="col"
                className="w-24 px-3 py-3 text-right text-[11px] font-medium text-admin-fg-muted"
              >
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {visible.length === 0
              ? renderStateRow()
              : visible.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-admin-line transition-colors last:border-0 hover:bg-admin-hover"
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
                        <span className="text-[11px] font-medium text-admin-fg">{user.name}</span>
                      </div>
                    </td>

                    <td className="px-3 py-2.5 text-[11px] text-admin-fg-muted">{user.email}</td>

                    <td className="px-3 py-2.5 text-[11px] text-admin-fg-soft">{user.role}</td>

                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-medium ${STATUS_STYLES[user.status] ?? "text-admin-fg-soft"}`}>
                        {user.status}
                      </span>
                    </td>

                    <td className="px-3 py-2.5 text-[11px] tabular-nums text-admin-fg-muted">{user.joined}</td>

                    <td className="px-3 py-2.5">
                      <RowActions
                        user={user}
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
