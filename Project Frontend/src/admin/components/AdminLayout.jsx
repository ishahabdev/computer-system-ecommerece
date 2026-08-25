import { Outlet } from "react-router"
import AdminSidebar from "./AdminSidebar"
import AdminNavbar from "./AdminNavbar"
import { AdminThemeProvider, useAdminTheme } from "../theme/AdminThemeContext"

// The `.admin-theme` class (+ `.light` when toggled) declares the CSS variables
// every `admin-*` color resolves from, so all descendants — including inline
// modals — pick up the active theme.
function AdminShell() {
  const { isLight } = useAdminTheme()

  return (
    <div
      className={`admin-theme ${isLight ? "light" : ""} flex h-screen overflow-hidden bg-admin-bg text-admin-fg`}
    >
      {/* Sidebar */}
      <AdminSidebar />

      {/* Right Side */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Navbar */}
        <AdminNavbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  )
}

export default function AdminLayout() {
  return (
    <AdminThemeProvider>
      <AdminShell />
    </AdminThemeProvider>
  )
}
