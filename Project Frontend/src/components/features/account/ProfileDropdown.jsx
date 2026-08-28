import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiShoppingBag,
  FiHeart,
  FiSettings,
  FiLogOut,
  FiLogIn,
  FiUserPlus,
  FiPackage,
  FiClipboard,
} from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";

// The two menus differ only by role. A customer gets their storefront account
// pages; an admin gets shortcuts into the admin area. Both end with Account
// settings + Log out (rendered separately below), matching the design.
const CUSTOMER_LINKS = [
  { label: "Dashboard", to: "/dashboard", icon: FiGrid },
  { label: "My orders", to: "/dashboard?tab=orders", icon: FiShoppingBag },
  { label: "Wishlist", to: "/wishlist", icon: FiHeart },
  { label: "Account settings", to: "/dashboard?tab=profile", icon: FiSettings },
];

// Manage-orders points at the same admin route the sidebar uses; Account
// settings mirrors the sidebar's Settings link so the two stay consistent.
const ADMIN_LINKS = [
  { label: "Admin dashboard", to: "/admin/overview", icon: FiGrid },
  { label: "Manage products", to: "/admin/products", icon: FiPackage },
  { label: "Manage orders", to: "/admin/orders", icon: FiClipboard },
  { label: "Account settings", to: "/admin/settings", icon: FiSettings },
];

// Shown while signed out. The profile icon opens a menu offering the two ways in
// rather than jumping straight to /signin, so "create account" is one click away.
const GUEST_LINKS = [
  { label: "Log in", to: "/signin", icon: FiLogIn },
  { label: "Create account", to: "/signup", icon: FiUserPlus },
];

// Anchored under the header's profile icon. `triggerRef` is the toggle button so
// clicks on it aren't treated as "outside" (which would close-then-reopen).
const ProfileDropdown = ({ isOpen, onClose, triggerRef }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close on outside click / Escape — same interaction as CartDropdown.
  useEffect(() => {
    const handleClickOutside = (event) => {
      const insidePanel = dropdownRef.current?.contains(event.target);
      const onTrigger = triggerRef?.current?.contains(event.target);
      if (!insidePanel && !onTrigger) {
        onClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose, triggerRef]);

  // Both menus share one shell: same anchor under the profile icon, same
  // open/close animation, same dismiss behaviour — only the contents differ.
  const panelClasses = `absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 transition-all duration-300 transform origin-top-right ${
    isOpen
      ? "opacity-100 scale-100 visible"
      : "opacity-0 scale-95 invisible pointer-events-none"
  }`;

  // Backdrop so a click anywhere dismisses the menu.
  const backdrop = isOpen && (
    <div
      className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
      onClick={onClose}
      aria-hidden="true"
    />
  );

  // Signed out: no identity header and no account links to show — just Log in
  // and Create account, split by a divider.
  if (!user) {
    return (
      <>
        {backdrop}

        <div
          ref={dropdownRef}
          // overflow-hidden clips each row's hover fill to the rounded corners.
          className={`${panelClasses} w-56 overflow-hidden`}
          role="menu"
          aria-label="Account menu"
        >
          {GUEST_LINKS.map((link, index) => {
            // Capitalized local so it renders as a component — see the note on
            // the signed-in list below.
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                to={link.to}
                role="menuitem"
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#F7F7F5] hover:text-[#22262A] transition-colors ${
                  index > 0 ? "border-t border-gray-200" : ""
                }`}
              >
                <Icon className="text-lg shrink-0 text-gray-500" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </>
    );
  }

  // Still drives which link set is shown (Admin dashboard vs. Dashboard, etc.) —
  // only the visible "Admin"/"Customer" badge next to the name was removed.
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const links = isAdmin ? ADMIN_LINKS : CUSTOMER_LINKS;

  const userName = typeof user.name === "string" ? user.name.trim() : "";
  const displayName = userName || (isAdmin ? "Admin" : "Customer");
  const initials =
    userName
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "U";

  const handleLogout = () => {
    onClose();
    logout();
    navigate("/");
  };

  return (
    <>
      {backdrop}

      <div
        ref={dropdownRef}
        className={`${panelClasses} w-72`}
        role="menu"
        aria-label="Account menu"
      >
        {/* Identity — avatar, name, email. FIX: the "Admin"/"Customer" role
            badge that used to sit next to the name has been removed; the
            name now shows plain, with the email underneath. */}
        <div className="flex items-start gap-3 px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white rounded-t-xl">
          <div className="w-11 h-11 rounded-full bg-[#2196F3] text-white text-sm font-bold flex items-center justify-center overflow-hidden shrink-0">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[#22262A] truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{user.email || ""}</p>
          </div>
        </div>

        {/* Role-specific navigation */}
        <nav className="p-2" aria-label="Account navigation">
          {links.map((link) => {
            // Capitalized local so it renders as a component — a destructured
            // `icon: Icon` arg falsely lints as unused (same fix as
            // ProductsTable's RowActions/INERT_ACTIONS).
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                to={link.to}
                role="menuitem"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-[#F7F7F5] hover:text-[#22262A] transition-colors"
              >
                <Icon className="text-lg shrink-0 text-gray-500" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-gray-200">
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <FiLogOut className="text-lg shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileDropdown;