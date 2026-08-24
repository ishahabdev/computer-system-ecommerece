import { Outlet } from "react-router"
import AdminSidebar from "./AdminSidebar"
import AdminNavbar from "./AdminNavbar"

export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0b] text-white">

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
