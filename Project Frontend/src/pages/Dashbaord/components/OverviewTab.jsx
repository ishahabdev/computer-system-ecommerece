import { Link } from "react-router-dom";
import { FiCreditCard, FiMapPin, FiShoppingBag } from "react-icons/fi";
import { getLiveOrderStatus } from "../dashboardStorage";
import { BUTTON_PRIMARY, CARD, HAIRLINE, SURFACE, TAB_SUBTITLE, TAB_TITLE } from "../dashboardStyles";

const OverviewTab = ({ user, orders = [], addresses = [], onSelectTab }) => {
  const userName = typeof user?.name === "string" ? user.name.trim() : "";
  const recentOrder = orders[orders.length - 1];

  // Total amount paid across every order that has not been cancelled.
  const totalPayment = orders
    .filter((order) => getLiveOrderStatus(order) !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total ?? order.totalAmount ?? 0), 0);

  const stats = [
    { label: "Orders", value: orders.length, icon: FiShoppingBag, tab: "orders" },
    { label: "Addresses", value: addresses.length, icon: FiMapPin, tab: "addresses" },
    {
      label: "Total Payment",
      value: `$${totalPayment.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: FiCreditCard,
      tab: "orders",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className={TAB_TITLE}>Overview</h2>
        <p className={TAB_SUBTITLE}>A snapshot of your account activity.</p>
      </div>

      <div className={`${CARD} p-6 mb-5`}>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#2196F3] mb-2">
          Welocome Back!
        </p>
        <h3 className="text-xl font-bold text-[#22262A]">{userName || "Customer"}</h3>
        <p className="text-sm text-gray-500 mt-1">{user?.email || "No email available"}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              type="button"
              onClick={() => onSelectTab(stat.tab)}
              className={`${CARD} text-left p-5 hover:border-[#2196F3] hover:shadow-md transition-all`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#2196F3] mb-4">
                <Icon className="text-xl" />
              </span>
              <p className="text-2xl font-bold text-[#22262A]">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </button>
          );
        })}
      </div>

      <div className={CARD}>
        <div className={`flex items-center justify-between gap-4 px-6 py-4 border-b ${HAIRLINE}`}>
          <h3 className="text-base font-semibold text-[#22262A]">Latest Order</h3>
          <button
            type="button"
            onClick={() => onSelectTab("orders")}
            className="text-sm font-semibold text-[#2196F3] hover:underline"
          >
            View all
          </button>
        </div>

        <div className="p-6">
          {recentOrder ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-semibold text-[#22262A]">Order #{recentOrder.orderId}</p>
                <p className="text-sm text-gray-500 mt-0.5">{recentOrder.orderDate}</p>
                <p className="text-sm text-gray-500">{recentOrder.items?.length || 0} product(s)</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-bold text-[#22262A]">${recentOrder.total || 0}</p>
                <span className="inline-block mt-1 text-xs font-semibold uppercase tracking-wide text-[#2196F3] bg-blue-50 px-2.5 py-1 rounded-full">
                  {getLiveOrderStatus(recentOrder)}
                </span>
              </div>
            </div>
          ) : (
            <div className={`${SURFACE} text-center py-10 rounded-lg`}>
              <p className="text-sm text-gray-500 mb-4">You have not placed an order yet.</p>
              <Link to="/store" className={BUTTON_PRIMARY}>
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
