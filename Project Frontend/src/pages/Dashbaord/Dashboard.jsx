import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import {
  FiHeart,
  FiFileText,
  FiLock,
  FiLogOut,
  FiMapPin,
  FiShoppingBag,
  FiUser,
} from "react-icons/fi";
import { MdHome } from "react-icons/md";
import AddressTab from "./components/AddressTab";
import ChangePasswordTab from "./components/ChangePasswordTab";
import OrderDetailsTab from "./components/OrderDetailsTab";
import OrdersTab from "./components/OrdersTab";
import OverviewTab from "./components/OverviewTab";
import ProfileTab from "./components/ProfileTab";
import WishlistTab from "./components/WishlistTab";
import { readCustomerList, writeCustomerList } from "./dashboardStorage";

const dashboardTabs = [
  { id: "overview", label: "Overview", icon: MdHome },
  { id: "profile", label: "Profile", icon: FiUser },
  { id: "addresses", label: "Addresses", icon: FiMapPin },
  { id: "orders", label: "Orders", icon: FiShoppingBag },
  { id: "order-details", label: "Order Details", icon: FiFileText },
  { id: "wishlist", label: "Wishlist", icon: FiHeart },
  { id: "change-password", label: "Change Password", icon: FiLock },
];

const API_BASE_URL = "http://localhost:9000/v1";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile, updateProfilePicture } = useAuth();
  const { wishlistItems } = useWishlist();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: "/dashboard" } });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setAddresses(readCustomerList(user, "addresses"));
    setSelectedOrder(null);
  }, [user]);

  // Fetch real orders from backend and keep synced with localStorage
  useEffect(() => {
    if (!user) return;

    const localOrders = readCustomerList(user, "orders");
    setOrders(localOrders);

    const token = localStorage.getItem("authToken");
    if (!token) return;

    const fetchBackendOrders = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            setOrders(result.data);
            writeCustomerList(user, "orders", result.data);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch orders from backend:", err);
      }
    };

    fetchBackendOrders();

    const interval = setInterval(fetchBackendOrders, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSaveAddresses = (nextAddresses) => {
    setAddresses(nextAddresses);
    writeCustomerList(user, "addresses", nextAddresses);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setActiveTab("order-details");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const userName = typeof user.name === "string" ? user.name.trim() : "";
  const initials =
    userName
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => name[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "U";

  return (
    <main className="bg-white min-h-screen">
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 py-3">
          <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
            <Link to="/" className="text-[#2196F3] hover:underline transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Customer Dashboard</span>
          </nav>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 py-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#22262A]">Customer Dashboard</h1>
      </div>

      <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#2196F3] text-white flex items-center justify-center overflow-hidden font-bold">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={userName || "Profile"} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#22262A] truncate">{userName || "Customer"}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email || ""}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {dashboardTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-[#2196F3] border-l-4 border-[#2196F3]"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="text-xl shrink-0" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded text-red-600 hover:bg-red-50 transition-all"
              >
                <FiLogOut className="text-xl shrink-0" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {activeTab === "overview" && (
              <OverviewTab
                user={user}
                orders={orders}
                addresses={addresses}
                wishlistItems={wishlistItems}
                onSelectTab={setActiveTab}
              />
            )}
            {activeTab === "profile" && (
              <ProfileTab
                user={user}
                updateProfile={updateProfile}
                updateProfilePicture={updateProfilePicture}
              />
            )}
            {activeTab === "addresses" && (
              <AddressTab addresses={addresses} onSaveAddresses={handleSaveAddresses} />
            )}
            {activeTab === "orders" && (
              <OrdersTab orders={orders} onViewDetails={handleViewDetails} />
            )}
            {activeTab === "order-details" && (
              <OrderDetailsTab order={selectedOrder} user={user} onBack={() => setActiveTab("orders")} />
            )}
            {activeTab === "wishlist" && <WishlistTab />}
            {activeTab === "change-password" && <ChangePasswordTab user={user} />}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
