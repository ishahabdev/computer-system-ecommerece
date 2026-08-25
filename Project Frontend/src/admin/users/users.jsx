import { useCallback, useEffect, useState } from "react";
import { Search, Settings, Plus, X } from "lucide-react";
import UsersTable from "./components/UsersTable";

// Same backend the customer auth flow talks to. New signups/logins land in this
// table because they are written to the same users table this reads from.
const API_BASE_URL = "http://localhost:9000/v1";
const REQUEST_TIMEOUT_MS = 15000;

// Backend rows -> the shape the table renders. Role/status fall back to the
// model defaults, and `joined` is derived from the Sequelize createdAt column.
const normalizeUser = (u, i) => ({
  id: u.id ?? i + 1,
  name: (typeof u.name === "string" && u.name.trim()) || (u.email ? u.email.split("@")[0] : "Unknown"),
  email: u.email || "—",
  role: u.role || "User",
  status: u.status || "Active",
  joined: u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : "—",
});

const getErrorMessage = (error) => {
  if (error.name === "TimeoutError" || error.name === "AbortError") {
    return "The server took too long to respond. Make sure the backend is running on port 9000.";
  }
  if (error instanceof TypeError) {
    return "Could not reach the server. Make sure the backend is running on port 9000.";
  }
  return error.message || "Failed to load users";
};

const Users = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || data.error || "Failed to load users");
      }

      const list = Array.isArray(data.data) ? data.data : [];
      setUsers(list.map(normalizeUser));
    } catch (err) {
      setError(getErrorMessage(err));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Change a user's account status (Active / Suspended). Applied optimistically
  // so the row updates instantly; on failure we resync from the server, which is
  // the source of truth.
  const setUserStatus = useCallback(
    async (id, status) => {
      setActionError("");
      setUsers((list) => list.map((u) => (u.id === id ? { ...u, status } : u)));
      try {
        const response = await fetch(`${API_BASE_URL}/user/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        const data = await response.json();
        if (!response.ok || data.success === false) {
          throw new Error(data.message || data.error || "Failed to update user");
        }
        // Reconcile the row with the status the server actually stored, so the
        // table shows the persisted truth rather than the optimistic guess.
        if (data.data && data.data.status) {
          setUsers((list) =>
            list.map((u) => (u.id === id ? { ...u, status: data.data.status } : u)),
          );
        }
      } catch (err) {
        setActionError(getErrorMessage(err));
        loadUsers();
      }
    },
    [loadUsers],
  );

  // Permanently delete a user. Optimistically drop the row, resync on failure.
  const deleteUser = useCallback(
    async (id) => {
      setActionError("");
      setUsers((list) => list.filter((u) => u.id !== id));
      try {
        const response = await fetch(`${API_BASE_URL}/user/${id}`, {
          method: "DELETE",
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        const data = await response.json();
        if (!response.ok || data.success === false) {
          throw new Error(data.message || data.error || "Failed to delete user");
        }
      } catch (err) {
        setActionError(getErrorMessage(err));
        loadUsers();
      }
    },
    [loadUsers],
  );

  // Summary cards, derived from the live data rather than hard-coded totals.
  const total = users.length;
  const countByStatus = (status) => users.filter((u) => u.status === status).length;
  const share = (n) => (total ? Math.round((n / total) * 100) : 0);

  const active = countByStatus("Active");
  const invited = countByStatus("Invited");
  const suspended = countByStatus("Suspended");

  const stats = [
    { label: "Total Users", value: total, share: 100, color: "bg-blue-500" },
    { label: "Active", value: active, share: share(active), color: "bg-emerald-500" },
    { label: "Invited", value: invited, share: share(invited), color: "bg-admin-fg-muted" },
    { label: "Suspended", value: suspended, share: share(suspended), color: "bg-yellow-400" },
  ];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[16px] font-semibold text-admin-fg">Users</h1>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-admin-fg-dim"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
              aria-label="Search users"
              className="w-44 rounded-lg border border-admin-line-2 bg-admin-panel-2 py-1.5 pl-8 pr-2.5 text-[11px] text-admin-fg outline-none transition-colors placeholder:text-admin-fg-dim focus:border-admin-line-strong sm:w-56"
            />
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-admin-line-2 px-3 py-1.5 text-[11px] text-admin-fg-soft transition-colors hover:bg-admin-active hover:text-admin-fg"
          >
            <Settings size={13} />
            Settings
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-admin-line-strong bg-admin-invert px-3 py-1.5 text-[11px] font-medium text-admin-invert-fg transition-colors hover:opacity-90"
          >
            <Plus size={13} strokeWidth={2.25} />
            New User
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-admin-line bg-admin-panel p-4">
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${stat.color}`} />
              <p className="text-[11px] text-admin-fg-muted">{stat.label}</p>
            </div>

            <div className="mt-2 flex items-baseline justify-between gap-2">
              <p className="text-[18px] font-semibold text-admin-fg">{loading ? "—" : stat.value}</p>
              <p className="text-[10px] text-admin-fg-dim">{stat.share}% of total</p>
            </div>

            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-admin-active">
              <div className={`h-full rounded-full ${stat.color}`} style={{ width: `${stat.share}%` }} />
            </div>
          </div>
        ))}
      </div>

      {actionError && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
          <span>{actionError}</span>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setActionError("")}
            className="flex-shrink-0 text-red-300/70 transition-colors hover:text-red-200"
          >
            <X size={13} />
          </button>
        </div>
      )}

      <UsersTable
        query={query}
        users={users}
        loading={loading}
        error={error}
        onRetry={loadUsers}
        onSetStatus={setUserStatus}
        onDelete={deleteUser}
      />
    </div>
  );
};

export default Users;
