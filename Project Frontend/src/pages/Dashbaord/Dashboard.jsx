import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { FaHome, FaBox, FaMapMarkerAlt, FaCog, FaSignOutAlt, FaUser } from "react-icons/fa"
import { IoClose } from "react-icons/io5"

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("home")
  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: "/dashboard" } })
    }
  }, [isAuthenticated, navigate])

  // Load orders from localStorage
  useEffect(() => {
    if (isAuthenticated && user) {
      const ordersJSON = localStorage.getItem("orders")
      const allOrders = ordersJSON ? JSON.parse(ordersJSON) : []
      
      // Filter orders for current user (if you're storing user email in orders)
      const userOrders = allOrders.filter(order => 
        order.userEmail === user.email || !order.userEmail // Show all if no email stored
      )
      setOrders(userOrders)

      // Load saved addresses
      const addressesJSON = localStorage.getItem(`addresses_${user.email}`)
      const savedAddresses = addressesJSON ? JSON.parse(addressesJSON) : []
      setAddresses(savedAddresses)
    }
  }, [isAuthenticated, user])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  if (!isAuthenticated || !user) {
    return null
  }

  // Get user initials for avatar
  const initials = user.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  return (
    <main className="bg-white min-h-screen">
      {/* Breadcrumb bar */}
      <div className="bg-gray-50">
        <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 py-3">
          <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
            <Link to="/" className="text-[#2196F3] hover:underline transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">User Profile</span>
          </nav>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 py-8">
        <h1 className="text-2xl font-bold text-[#22262A] uppercase tracking-wide mb-8">
          User Profile
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveTab("home")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === "home"
                    ? "bg-[#2196F3] text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaHome className="text-lg" />
                <span className="font-medium">Home</span>
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === "orders"
                    ? "bg-[#2196F3] text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaBox className="text-lg" />
                <span className="font-medium">My Orders</span>
              </button>

              <button
                onClick={() => setActiveTab("address")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === "address"
                    ? "bg-[#2196F3] text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaMapMarkerAlt className="text-lg" />
                <span className="font-medium">Address</span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === "settings"
                    ? "bg-[#2196F3] text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaCog className="text-lg" />
                <span className="font-medium">Account Settings</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Home Tab */}
            {activeTab === "home" && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-[#22262A] mb-6">Home</h2>

                {/* User Info Card */}
                <div className="flex items-start gap-6 bg-gray-50 p-6 rounded-lg mb-6">
                  <div className="w-24 h-24 rounded-full bg-[#2196F3] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#22262A] mb-1">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">{user.email}</p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <p className="text-sm text-gray-700 font-medium mb-2">Hello there!</p>
                      <p className="text-sm text-gray-600">
                        Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the 
                        industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and 
                        scrambled it to make a type specimen book. It has survived not only five centuries but also the leap 
                        into electronic typesetting, remaining essentially unchanged.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                    <div className="text-3xl font-bold mb-1">{orders.length}</div>
                    <div className="text-sm opacity-90">Total Orders</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg text-white">
                    <div className="text-3xl font-bold mb-1">
                      {orders.filter(o => o.status === "Confirmed").length}
                    </div>
                    <div className="text-sm opacity-90">Active Orders</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                    <div className="text-3xl font-bold mb-1">{addresses.length}</div>
                    <div className="text-sm opacity-90">Saved Addresses</div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-[#22262A] mb-6">My Orders</h2>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No orders yet</p>
                    <Link
                      to="/store"
                      className="inline-block bg-[#2196F3] hover:bg-[#1a7fd1] text-white px-6 py-2 rounded-md transition-colors"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-[#22262A]">
                              Order #{order.orderId}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.orderDate || new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#22262A]">${order.total}</p>
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              {order.status}
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-3 mb-3">
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Items:</span> {order.items?.length || 0}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Delivery:</span>{" "}
                            {order.estimatedDelivery}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            to="/track-order"
                            state={{ orderId: order.orderId }}
                            className="flex-1 bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-center py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            Track Order
                          </Link>
                          <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#22262A] py-2 rounded-md text-sm font-medium transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Address Tab */}
            {activeTab === "address" && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#22262A]">Saved Addresses</h2>
                  <button className="bg-[#2196F3] hover:bg-[#1a7fd1] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    + Add New Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <FaMapMarkerAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No saved addresses</p>
                    <p className="text-sm text-gray-500">
                      Add an address for faster checkout
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-[#22262A]">
                            {address.label || `Address ${index + 1}`}
                          </h3>
                          <button className="text-gray-400 hover:text-red-500">
                            <IoClose className="text-xl" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-700">{address.street}</p>
                        <p className="text-sm text-gray-700">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-[#22262A] mb-6">Account Settings</h2>

                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#22262A] mb-4">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={user.name}
                          readOnly
                          className="w-full bg-gray-50 text-sm text-gray-600 rounded-md px-4 py-3 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={user.email}
                          readOnly
                          className="w-full bg-gray-50 text-sm text-gray-600 rounded-md px-4 py-3 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Change */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-[#22262A] mb-4">
                      Change Password
                    </h3>
                    <Link
                      to="/forgot-password"
                      className="inline-block bg-[#2196F3] hover:bg-[#1a7fd1] text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Reset Password
                    </Link>
                  </div>

                  {/* Account Actions */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-[#22262A] mb-4">
                      Account Actions
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Member since: {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                      <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default Dashboard
