import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { MdHome, MdShoppingBag, MdLocationOn, MdSettings } from "react-icons/md"
import { FiLogOut } from "react-icons/fi"

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("home") // Default to "home" tab
  const [orders, setOrders] = useState([])

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
      setOrders(allOrders)
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
      <div className="bg-gray-50 border-b border-gray-200">
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

      {/* Page Title */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 py-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#22262A]">User Profile</h1>
      </div>

      <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 py-8">
        <div className="flex gap-8">
          {/* SIDEBAR */}
          <aside className="w-40 flex-shrink-0">
            <div className="space-y-2">
              {/* Home */}
              <button
                onClick={() => setActiveTab("home")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${
                  activeTab === "home"
                    ? "bg-blue-50 text-[#2196F3] border-l-4 border-[#2196F3]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <MdHome className="text-xl" />
                <span className="text-sm font-medium">Home</span>
              </button>

              {/* My Orders */}
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${
                  activeTab === "orders"
                    ? "bg-blue-50 text-[#2196F3] border-l-4 border-[#2196F3]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <MdShoppingBag className="text-xl" />
                <span className="text-sm font-medium">My Orders</span>
              </button>

              {/* Address */}
              <button
                onClick={() => setActiveTab("address")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${
                  activeTab === "address"
                    ? "bg-blue-50 text-[#2196F3] border-l-4 border-[#2196F3]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <MdLocationOn className="text-xl" />
                <span className="text-sm font-medium">Address</span>
              </button>

              {/* Account Settings */}
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${
                  activeTab === "settings"
                    ? "bg-blue-50 text-[#2196F3] border-l-4 border-[#2196F3]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <MdSettings className="text-xl" />
                <span className="text-sm font-medium">Settings</span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded text-red-600 hover:bg-red-50 transition-all"
              >
                <FiLogOut className="text-xl" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="flex-1">
            {/* Home Tab */}
            {activeTab === "home" && (
              <div>
                <h2 className="text-2xl font-bold text-[#22262A] mb-6">Home</h2>
                
                {/* User Profile Section */}
                <div className="flex items-start gap-6 mb-6">
                  {/* User Avatar */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2196F3] to-[#1976d2] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-lg">
                    {initials}
                  </div>
                  
                  {/* User Info */}
                  <div>
                    <h3 className="text-xl font-bold text-[#22262A] mb-1">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Welcome Message Box */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-base font-semibold text-[#22262A] mb-3">
                    Hello Sarah!
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the 
                    industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and 
                    scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into 
                    electronic typesetting, remaining essentially unchanged.
                  </p>
                </div>
              </div>
            )}

            {/* My Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <h2 className="text-2xl font-bold text-[#22262A] mb-6">My Orders</h2>

                {orders.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">No orders yet</p>
                    <Link
                      to="/store"
                      className="inline-block bg-[#2196F3] hover:bg-[#1a7fd1] text-white px-6 py-2 rounded transition-colors"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Order Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-[#22262A]">
                            Order #{order.orderId}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {order.orderDate || new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Products Section */}
                        <div className="px-6 py-6">
                          <h4 className="text-sm font-semibold text-[#22262A] mb-4">Products</h4>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-2 text-gray-600 font-medium">Product Name</th>
                                <th className="text-right py-2 text-gray-600 font-medium">Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items && order.items.map((item, itemIdx) => (
                                <tr key={itemIdx} className="border-b border-gray-200">
                                  <td className="py-3 text-gray-700">{item.title}</td>
                                  <td className="text-right py-3 text-gray-700">
                                    ${item.price * item.qty}
                              </td>
                                </tr>
                              ))}
                              <tr className="border-b border-gray-200">
                                <td className="py-3 text-gray-700">Subtotal</td>
                                <td className="text-right py-3 text-gray-700">${order.subtotal}</td>
                              </tr>
                              <tr className="border-b border-gray-200">
                                <td className="py-3 text-gray-700">Delivery</td>
                                <td className="text-right py-3 text-gray-700">${order.shippingFee}</td>
                              </tr>
                              <tr className="font-semibold">
                                <td className="py-3 text-[#22262A]">Total</td>
                                <td className="text-right py-3 text-[#22262A]">${order.total}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Shipping Details Section */}
                        <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-[#22262A] mb-4">Shipping details</h4>
                          <table className="w-full text-sm">
                            <tbody>
                              <tr className="border-b border-gray-200">
                                <td className="py-2 text-gray-600 font-medium">Name</td>
                                <td className="text-right py-2 text-gray-700">{user.name}</td>
                              </tr>
                              <tr className="border-b border-gray-200">
                                <td className="py-2 text-gray-600 font-medium">Email</td>
                                <td className="text-right py-2 text-gray-700">{user.email}</td>
                              </tr>
                              <tr className="border-b border-gray-200">
                                <td className="py-2 text-gray-600 font-medium">Type</td>
                                <td className="text-right py-2 text-gray-700">Delivery</td>
                              </tr>
                              <tr>
                                <td className="py-2 text-gray-600 font-medium">Address</td>
                                <td className="text-right py-2 text-gray-700">
                                  {order.shippingAddress}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Address Tab */}
            {activeTab === "address" && (
              <div>
                <h2 className="text-2xl font-bold text-[#22262A] mb-6">Address</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-700 text-sm">
                    No saved addresses yet. Addresses will be saved from your checkout.
                  </p>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div>
                <h2 className="text-2xl font-bold text-[#22262A] mb-6">Account Settings</h2>
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={user.name}
                      readOnly
                      className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded outline-none"
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
                      className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded outline-none"
                    />
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <Link
                      to="/forgot-password"
                      className="text-[#2196F3] hover:underline text-sm font-medium"
                    >
                      Reset Password
                    </Link>
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
