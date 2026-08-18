import { Link } from "react-router-dom";
import { FiHeart, FiMapPin, FiShoppingBag } from "react-icons/fi";

const OverviewTab = ({ user, orders = [], addresses = [], wishlistItems = [], onSelectTab }) => {
  const userName = typeof user?.name === "string" ? user.name.trim() : "";
  const recentOrder = orders[orders.length - 1];

  const stats = [
    { label: "Orders", value: orders.length, icon: FiShoppingBag, tab: "orders" },
    { label: "Addresses", value: addresses.length, icon: FiMapPin, tab: "addresses" },
    { label: "Wishlist", value: wishlistItems.length, icon: FiHeart, tab: "wishlist" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#22262A] mb-6">Overview</h2>

      <div className="border border-gray-200 rounded-lg p-6 mb-6">
        <p className="text-sm text-gray-600 mb-1">Welcome back</p>
        <h3 className="text-xl font-bold text-[#22262A]">{userName || "Customer"}</h3>
        <p className="text-sm text-gray-600 mt-2">{user?.email || "No email available"}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              type="button"
              onClick={() => onSelectTab(stat.tab)}
              className="text-left border border-gray-200 rounded-lg p-4 hover:border-[#2196F3] hover:bg-blue-50/40 transition-colors"
            >
              <Icon className="text-2xl text-[#2196F3] mb-3" />
              <p className="text-2xl font-bold text-[#22262A]">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </button>
          );
        })}
      </div>

      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-[#22262A]">Latest Order</h3>
          <button
            type="button"
            onClick={() => onSelectTab("orders")}
            className="text-sm font-semibold text-[#2196F3] hover:text-[#1a7fd1]"
          >
            View all
          </button>
        </div>

        {recentOrder ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-semibold text-[#22262A]">Order #{recentOrder.orderId}</p>
              <p className="text-sm text-gray-600">{recentOrder.orderDate}</p>
              <p className="text-sm text-gray-600">{recentOrder.items?.length || 0} product(s)</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-bold text-[#22262A]">${recentOrder.total || 0}</p>
              <span className="inline-block mt-1 text-xs font-semibold uppercase tracking-wide text-[#2196F3] bg-blue-50 px-2 py-1 rounded">
                {recentOrder.status || "pending"}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-4">You have not placed an order yet.</p>
            <Link
              to="/store"
              className="inline-block bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-sm font-semibold px-5 py-2.5 rounded transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
