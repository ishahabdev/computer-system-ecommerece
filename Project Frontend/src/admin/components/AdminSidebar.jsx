import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  LayoutGrid,
  Package,
  ShoppingCart,
  Users,
  LineChart,
  Image,
  Megaphone,
  MessageSquare,
  Tag,
  Settings,
  LifeBuoy,
  Plus,
  Triangle,
  ChevronDown,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const mainLinks = [
  { name: "Overview", icon: LayoutGrid, path: "/admin/overview" },
  { name: "Products", icon: Package, path: "/admin/products" },
  { name: "Orders", icon: ShoppingCart, path: "/admin/orders" },
  { name: "Users", icon: Users, path: "/admin/users" },
  { name: "Analyze", icon: LineChart, path: "/admin/analyze" },
  { name: "Media", icon: Image, path: "/admin/media" },
  { name: "Campaigns", icon: Megaphone, path: "/admin/campaigns" },
];

const settingsLinks = [
  { name: "Settings", icon: Settings, path: "/admin/settings" },
];

// `icon` is read into a capitalized local so it can render as a component
// (`varsIgnorePattern` covers the const; a destructured arg would falsely lint).
function NavItem({ icon, label, active = false, dot = false, onClick }) {
  const Icon = icon;
  return (
    <button
  type="button"
  onClick={onClick}
  aria-current={active ? "page" : undefined}
  className={`flex w-full items-center gap-3 px-3 py-2 text-[13px] border-l-2 transition-colors ${
    active
      ? "bg-admin-panel text-blue-500 border-blue-500 font-medium"
      : "border-transparent hover:bg-admin-hover hover:text-admin-fg"
  }`}
>
  <Icon size={16} strokeWidth={1.75} />
  <span>{label}</span>
  {dot && <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />}
</button> 
  );
}

function SectionLabel({ children }) {
  return (
    <p className="mb-1 px-3 text-[10px] font-medium tracking-wider text-admin-fg-faint">
      {children}
    </p>
  );
}

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isActive = (path) => location.pathname === path;

  // Close the logout confirmation dialog when Escape is pressed.
  useEffect(() => {
    if (!showLogoutConfirm) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setShowLogoutConfirm(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLogoutConfirm]);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate("/admin/login", { replace: true });
  };

  const adminName = typeof user?.name === "string" ? user.name.trim() : "";
  const adminEmail = typeof user?.email === "string" ? user.email : "";
  const initials =
    adminName
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "A";

  return (
    <>

    <aside className="flex w-56 flex-col border-r border-admin-line bg-admin-bg">
      {/* Brand — h-16 + border-b aligns the divider with the top bar */}
      <div className="flex h-16 items-center gap-2 border-b border-admin-line px-4">
        <Triangle size={17} className="fill-emerald-400 text-emerald-400" />
        <span className="text-[15px] font-semibold text-admin-fg">
          TECH MART
        </span>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col justify-between overflow-y-auto px-3 py-4">
        {/* Main nav */}
        <div>
          <nav className="space-y-0.5">
            {mainLinks.map((link) => (
              <NavItem
                key={link.name}
                icon={link.icon}
                label={link.name}
                active={isActive(link.path)}
                onClick={() => navigate(link.path)}
              />
            ))}
          </nav>
        </div>

        <div>
          <SectionLabel>SETTINGS</SectionLabel>
          {settingsLinks.map((link) => (
            <NavItem
              key={link.name}
              icon={link.icon}
              label={link.name}
              onClick={() => link.path && navigate(link.path)}
            />
          ))}
        </div>
      </div>

      {/* Account footer — profile identity + logout, pinned to the bottom */}
      <div className="border-t border-admin-line p-3">
        <div className="mb-2 flex items-center gap-2.5 px-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-admin-line-2 bg-admin-panel-3 text-[11px] font-semibold text-admin-fg-soft">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={adminName || "Admin"}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-admin-fg">
              {adminName || "Admin"}
            </p>
            <p className="truncate text-[11px] text-admin-fg-dim">
              {adminEmail || "Administrator"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="flex w-full items-center gap-2 rounded-lg border border-admin-line-2 px-3 py-2 text-[13px] font-medium text-red-500 transition-colors hover:border-red-500/40 hover:bg-red-500/10"
        >
          <LogOut size={16} strokeWidth={1.75} />
          <span>Logout</span>
        </button>
      </div>
    </aside>

    {showLogoutConfirm && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-logout-title"
      >
        <div
          className="absolute inset-0"
          onClick={() => setShowLogoutConfirm(false)}
        />
        <div className="relative w-full max-w-sm rounded-xl border border-admin-line-2 bg-admin-panel-3 p-6 text-center shadow-2xl shadow-black/50">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(false)}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-md p-1 text-admin-fg-dim transition-colors hover:bg-admin-active hover:text-admin-fg"
          >
            <X size={16} />
          </button>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <LogOut size={24} strokeWidth={1.75} />
          </div>
          <h2 id="admin-logout-title" className="text-base font-semibold text-admin-fg">
            Log out?
          </h2>
          <p className="mt-2 text-[13px] text-admin-fg-muted">
            Are you sure you want to log out of your admin account?
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 rounded-lg border border-admin-line-2 px-4 py-2 text-[13px] font-medium text-admin-fg-soft transition-colors hover:bg-admin-active"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmLogout}
              className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-red-600"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
