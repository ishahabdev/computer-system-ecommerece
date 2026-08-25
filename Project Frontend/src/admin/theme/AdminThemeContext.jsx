import { createContext, useContext, useCallback, useState } from "react";

// Light/dark theme state for the admin dashboard. The value drives a
// `.admin-theme` / `.admin-theme.light` class on the admin root (AdminLayout),
// which flips the CSS variables the `admin-*` Tailwind colors read from.
// Scoped to admin — the storefront never mounts this provider.
const AdminThemeContext = createContext(null);

const STORAGE_KEY = "admin-theme";

// Read the saved choice once, defaulting to dark (the original admin look).
// Wrapped in try/catch because localStorage can throw (private mode, etc.).
const readStoredTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
};

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error("useAdminTheme must be used within an AdminThemeProvider");
  }
  return context;
};

export const AdminThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(readStoredTheme);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Persisting failed (private mode, quota) — the toggle still applies for
        // this session; it just won't be remembered on the next load.
      }
      return next;
    });
  }, []);

  const value = { theme, isLight: theme === "light", toggleTheme };

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  );
};
