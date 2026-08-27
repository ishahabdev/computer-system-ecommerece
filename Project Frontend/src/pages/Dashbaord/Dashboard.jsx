import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiLock, FiLogOut, FiMapPin, FiShoppingBag, FiUser } from "react-icons/fi";
import { MdHome } from "react-icons/md";
import AddressTab from "./components/AddressTab";
import ChangePasswordTab from "./components/ChangePasswordTab";
import OrdersTab from "./components/OrdersTab";
import OverviewTab from "./components/OverviewTab";
import ProfileTab from "./components/ProfileTab";
import { getLiveOrderStatus, readCustomerList, writeCustomerList } from "./dashboardStorage";
import { CARD, HAIRLINE, SURFACE } from "./dashboardStyles";

const dashboardTabs = [
  { id: "overview", label: "Overview", icon: MdHome },
  { id: "profile", label: "Profile", icon: FiUser },
  { id: "addresses", label: "Addresses", icon: FiMapPin },
  { id: "orders", label: "Orders", icon: FiShoppingBag },
  { id: "change-password", label: "Change Password", icon: FiLock },
];

// Tabs the header account menu (and any deep link) may open via ?tab=.
const TAB_IDS = dashboardTabs.map((tab) => tab.id);

const API_BASE_URL = "http://localhost:9000/v1";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile, updateProfilePicture } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(() =>
    TAB_IDS.includes(requestedTab) ? requestedTab : "overview"
  );
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: "/dashboard" } });
    }
  }, [isAuthenticated, navigate]);

  // Keep the open tab in sync with ?tab= so the header account menu can jump
  // straight to Orders / Profile even when the dashboard is already mounted.
  // Depending on the string value (not the params object) means switching tabs
  // from the sidebar — which doesn't touch the URL — isn't overridden.
  useEffect(() => {
    if (requestedTab && TAB_IDS.includes(requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  useEffect(() => {
    setAddresses(readCustomerList(user, "addresses"));
  }, [user]);

  // Close the logout confirmation dialog when Escape is pressed.
  useEffect(() => {
    if (!showLogoutConfirm) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setShowLogoutConfirm(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLogoutConfirm]);

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

  // Cancel an order the customer owns (allowed until it is delivered). Returns a
  // { success, message } result so the Orders tab can show inline feedback.
  const handleCancelOrder = async (order) => {
    const dbId = order.databaseOrderId ?? order.id;
    const token = localStorage.getItem("authToken");

    if (!dbId || !token) {
      return { success: false, message: "You must be signed in to cancel this order." };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${dbId}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        return { success: false, message: result.message || "Unable to cancel order" };
      }

      setOrders((currentOrders) => {
        const nextOrders = currentOrders.map((existingOrder) =>
          (existingOrder.databaseOrderId ?? existingOrder.id) === dbId
            ? { ...existingOrder, status: "cancelled" }
            : existingOrder
        );
        writeCustomerList(user, "orders", nextOrders);
        return nextOrders;
      });

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || "Unable to cancel order" };
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate("/");
  };

  // Sidebar summary counts (live status so an order that has auto-progressed to
  // "delivered" is counted even before the backend persists the change).
  const totalOrders = orders.length;
  const deliveredOrders = useMemo(
    () => orders.filter((order) => getLiveOrderStatus(order) === "delivered").length,
    [orders]
  );

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
    <main className="bg-white min-h-screen text-gray-800">
      <div className={`border-b ${HAIRLINE}`}>
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

      <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-[#22262A]">Customer Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your profile, addresses and orders in one place.
        </p>
      </div>

      <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            {/* Identity, counts and navigation live in one card so the sidebar
                reads as a single object against the white page. */}
            <div className={`${CARD} overflow-hidden lg:sticky lg:top-6`}>
              <div className="flex items-center gap-3 p-4">
                <div className="w-12 h-12 rounded-full bg-[#2196F3] text-white flex items-center justify-center overflow-hidden font-bold shrink-0">
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

              <div className={`grid grid-cols-2 border-y ${HAIRLINE} ${SURFACE}`}>
                <div className={`px-4 py-3 border-r ${HAIRLINE}`}>
                  <p className="text-xs text-gray-500">Total orders</p>
                  <p className="text-xl font-bold text-[#22262A]">{totalOrders}</p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs text-gray-500">Delivered</p>
                  <p className="text-xl font-bold text-[#22262A]">{deliveredOrders}</p>
                </div>
              </div>

              <nav className="p-2" aria-label="Dashboard sections">
                {dashboardTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-[#2196F3] font-semibold"
                          : "text-gray-600 hover:bg-[#F7F7F5] hover:text-[#22262A]"
                      }`}
                    >
                      <Icon className="text-lg shrink-0" />
                      <span className="text-sm">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className={`p-2 border-t ${HAIRLINE}`}>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <FiLogOut className="text-lg shrink-0" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {activeTab === "overview" && (
              <OverviewTab
                user={user}
                orders={orders}
                addresses={addresses}
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
              <AddressTab addresses={addresses} onSaveAddresses={handleSaveAddresses} user={user} />
            )}
            {activeTab === "orders" && (
              <OrdersTab orders={orders} onCancelOrder={handleCancelOrder} />
            )}
            {activeTab === "change-password" && <ChangePasswordTab user={user} />}
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
        >
          <div
            className="absolute inset-0 bg-black/40 transition-opacity"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl border border-[#E5E5E0] p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <FiLogOut className="text-2xl" />
            </div>
            <h2 id="logout-dialog-title" className="text-lg font-bold text-[#22262A]">
              Log out?
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to log out of your account?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
