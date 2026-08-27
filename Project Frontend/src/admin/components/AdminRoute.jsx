import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

// Route guard for the entire /admin subtree. This is the UX half of admin
// protection — the backend (authMiddleware + adminOnly) is the real enforcement,
// so hiding a route here never has to be trusted on its own.
export default function AdminRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { error: showError } = useToast();
  const location = useLocation();

  const isAdmin = user?.role?.toLowerCase() === "admin";
  // A signed-in customer who landed on an admin URL. (While isLoading is true we
  // don't know the role yet, so this stays false until the session is resolved.)
  const denied = !isLoading && isAuthenticated && !isAdmin;

  // Tell that customer why they're being bounced. Fired from an effect rather than
  // during render, and latched with a ref so it shows once even under StrictMode's
  // double-invoke and the re-render that precedes the redirect.
  const notified = useRef(false);
  useEffect(() => {
    if (denied && !notified.current) {
      notified.current = true;
      showError("Access denied. That area is for administrators only.");
    }
  }, [denied, showError]);

  // The session is restored from localStorage and re-validated against /me on load
  // (see AuthContext). Deciding before that resolves would kick a real admin out to
  // /admin/login on every refresh, so wait for it.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-sm text-gray-500">
        Checking access…
      </div>
    );
  }

  // Not logged in → admin login, remembering the intended page so we can return
  // there after a successful sign-in.
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  // Logged in but not an admin → back to the customer dashboard.
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin — render the nested admin layout + page.
  return <Outlet />;
}
