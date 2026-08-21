import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { FiCalendar, FiChevronDown, FiPackage, FiSearch, FiXCircle } from 'react-icons/fi';
import { getLiveOrderStatus } from '../dashboardStorage';
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CARD,
  FIELD_INPUT,
  HAIRLINE,
  SURFACE,
  TAB_SUBTITLE,
  TAB_TITLE,
} from '../dashboardStyles';

const ORDERS_PER_PAGE = 5;

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

const getOrderKey = (order, index) => order.orderId || order.databaseOrderId || order.id || index;

const getOrderItems = (order) => {
  if (Array.isArray(order.items)) return order.items;
  if (Array.isArray(order.products)) return order.products;
  return [];
};

const getItemName = (item) => item.title || item.name || "Product";
const getItemQty = (item) => item.qty || item.quantity || 1;
const getItemImage = (item) => item.image || item.img || item.thumbnail || "";
const getOrderTotal = (order) => order.total ?? order.totalAmount ?? 0;

// A stored image is either a real picture (URL / absolute path / data URI) or a
// short emoji/text placeholder (e.g. "🛍️"). Only the former should render as <img>.
const isImageUrl = (value) =>
  typeof value === "string" && /^(https?:|\/|data:)/.test(value);

// Round product thumbnail. Falls back to the emoji placeholder, then to a
// generic package icon, when no real image is available (or one fails to load).
const OrderThumbnail = ({ image, alt, className = "mt-0.5 h-10 w-10 text-lg" }) => {
  const [failed, setFailed] = useState(false);
  const base = "flex shrink-0 items-center justify-center rounded-full";

  if (isImageUrl(image) && !failed) {
    return (
      <span className={`${base} overflow-hidden border border-[#E5E5E0] bg-white ${className}`}>
        <img
          src={image}
          alt={alt}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  return (
    <span className={`${base} bg-blue-50 text-[#2196F3] ${className}`}>
      {!isImageUrl(image) && image ? (
        <span className="leading-none">{image}</span>
      ) : (
        <FiPackage />
      )}
    </span>
  );
};

const getOrderDate = (order) => {
  const date = new Date(order.createdAt || order.orderDate);
  return isNaN(date.getTime()) ? null : date;
};

const formatOrderDate = (order) => {
  if (order.orderDate) return order.orderDate;
  const date = getOrderDate(order);
  return date ? date.toLocaleDateString() : "Recent order";
};

const getMonthLabel = (date) =>
  date ? date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Earlier orders";

// Status badge colours: delivered = green, cancelled = red, everything
// in-progress (packing / shipping / on delivery) uses the brand blue.
const getStatusClass = (status) => {
  if (status === 'delivered') return 'text-green-700 bg-green-50';
  if (status === 'cancelled') return 'text-red-700 bg-red-50';
  return 'text-[#2196F3] bg-blue-50';
};

const matchesFilter = (status, filter) => {
  if (filter === 'delivered') return status === 'delivered';
  if (filter === 'cancelled') return status === 'cancelled';
  if (filter === 'active') return status !== 'delivered' && status !== 'cancelled';
  return true; // 'all'
};

const OrdersTab = ({ orders = [], onCancelOrder }) => {
  const [expandedOrderKey, setExpandedOrderKey] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(ORDERS_PER_PAGE);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const toggleDetails = (order, index) => {
    const orderKey = getOrderKey(order, index);
    setExpandedOrderKey((currentKey) => (currentKey === orderKey ? null : orderKey));
  };

  // Send the cancel request through the parent handler and surface the result
  // inline in the confirmation dialog.
  const confirmCancel = async () => {
    if (!cancelTarget || !onCancelOrder) return;
    setIsCancelling(true);
    setCancelError('');
    const result = await onCancelOrder(cancelTarget.order);
    setIsCancelling(false);
    if (result?.success) {
      setCancelTarget(null);
    } else {
      setCancelError(result?.message || 'Unable to cancel order. Please try again.');
    }
  };

  // Reset pagination back to the first page whenever the filter or search changes.
  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    setVisibleCount(ORDERS_PER_PAGE);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setVisibleCount(ORDERS_PER_PAGE);
  };

  // Enrich once with the computed live status + a real Date for grouping/sorting.
  const enrichedOrders = useMemo(
    () =>
      orders.map((order, index) => ({
        order,
        index,
        key: getOrderKey(order, index),
        status: getLiveOrderStatus(order),
        date: getOrderDate(order),
      })),
    [orders]
  );

  // Counts shown next to each filter pill (All / Active / Delivered / Cancelled).
  const filterCounts = useMemo(() => {
    const counts = { all: enrichedOrders.length, active: 0, delivered: 0, cancelled: 0 };
    enrichedOrders.forEach((entry) => {
      if (entry.status === 'delivered') counts.delivered += 1;
      else if (entry.status === 'cancelled') counts.cancelled += 1;
      else counts.active += 1;
    });
    return counts;
  }, [enrichedOrders]);

  // Apply the active tab + search box, newest first.
  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return enrichedOrders
      .filter((entry) => matchesFilter(entry.status, activeFilter))
      .filter((entry) => {
        if (!term) return true;
        const { order, key } = entry;
        const orderNumber = String(
          order.orderId || (order.id ? `ORD-${order.id}` : key)
        ).toLowerCase();
        const itemNames = getOrderItems(order).map((item) => getItemName(item).toLowerCase());
        return orderNumber.includes(term) || itemNames.some((name) => name.includes(term));
      })
      .sort((a, b) => (b.date ? b.date.getTime() : 0) - (a.date ? a.date.getTime() : 0));
  }, [enrichedOrders, activeFilter, searchTerm]);

  const visibleOrders = filteredOrders.slice(0, visibleCount);
  const hasMore = visibleCount < filteredOrders.length;

  // Group the visible orders by month (they are already sorted newest first,
  // so both the groups and their contents stay in descending date order).
  const groupedOrders = useMemo(() => {
    const groups = [];
    const groupMap = new Map();
    visibleOrders.forEach((entry) => {
      const label = getMonthLabel(entry.date);
      if (!groupMap.has(label)) {
        const group = { label, entries: [] };
        groupMap.set(label, group);
        groups.push(group);
      }
      groupMap.get(label).entries.push(entry);
    });
    return groups;
  }, [visibleOrders]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2 className={TAB_TITLE}>My Orders</h2>
          <p className={TAB_SUBTITLE}>Track, review and cancel the orders you have placed.</p>
        </div>
        <div className="relative w-full sm:w-64 shrink-0">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search orders..."
            className={`${FIELD_INPUT} pl-10 py-2.5`}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => handleFilterChange(filter.id)}
              aria-pressed={isActive}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#2196F3] text-white"
                  : "bg-white border border-[#E5E5E0] text-gray-600 hover:bg-[#F7F7F5] hover:text-[#22262A]"
              }`}
            >
              {filter.label}
              <span className={`ml-1.5 ${isActive ? "text-white/70" : "text-gray-400"}`}>
                {filterCounts[filter.id]}
              </span>
            </button>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className={`${CARD} text-center py-12`}>
          <span className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${SURFACE} text-gray-400`}>
            <FiPackage className="text-xl" />
          </span>
          <p className="text-gray-500 mb-4">No orders yet</p>
          <Link to="/store" className={BUTTON_PRIMARY}>
            Start Shopping
          </Link>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className={`${CARD} text-center py-12`}>
          <p className="text-gray-500">No orders match your search.</p>
        </div>
      ) : (
        <>
          {groupedOrders.map((group) => (
            <div key={group.label} className="mb-8">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-3">
                <FiCalendar className="text-base" />
                {group.label}
              </h3>

              <div className="space-y-3">
                {group.entries.map((entry) => {
                  const { order, index, key, status } = entry;
                  const orderItems = getOrderItems(order);
                  const firstItemName = orderItems.length > 0 ? getItemName(orderItems[0]) : "Order";
                  const firstItemImage = orderItems.length > 0 ? getItemImage(orderItems[0]) : "";
                  const extraItemsCount = Math.max(orderItems.length - 1, 0);
                  const isExpanded = expandedOrderKey === key;
                  const orderNumber = order.orderId || (order.id ? `ORD-${order.id}` : key);
                  const total = getOrderTotal(order);

                  return (
                    <div key={key} className={`${CARD} overflow-hidden`}>
                      <div className="px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <OrderThumbnail image={firstItemImage} alt={firstItemName} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#22262A] truncate">
                              Order #{orderNumber}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {firstItemName}
                              {extraItemsCount > 0 ? ` +${extraItemsCount} more` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-5 text-sm">
                          <span className="text-gray-500">{formatOrderDate(order)}</span>
                          <span className="font-semibold text-[#22262A]">${total} </span>
                          <span
                            className={`justify-self-start text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${getStatusClass(status)}`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleDetails(order, index)}
                            aria-expanded={isExpanded}
                            className={BUTTON_SECONDARY}
                          >
                            Details
                            <FiChevronDown
                              className={`text-base transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <>
                          <div className={`px-4 sm:px-6 py-6 ${SURFACE} border-t ${HAIRLINE}`}>
                            <h4 className="text-sm font-semibold text-[#22262A] mb-4">Products</h4>
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-[#E5E5E0]">
                                  <th className="text-left py-2 text-gray-600 font-medium">Product Name</th>
                                  <th className="text-center py-2 text-gray-600 font-medium">Qty</th>
                                  <th className="text-right py-2 text-gray-600 font-medium">Price</th>
                                </tr>
                              </thead>
                              <tbody>
                                {orderItems.map((item, itemIdx) => {
                                  const qty = getItemQty(item);
                                  const price = Number(item.price || 0) * qty;

                                  return (
                                    <tr key={itemIdx} className="border-b border-[#E5E5E0]">
                                      <td className="py-3 text-gray-700">
                                        <span className="flex items-center gap-3">
                                          <OrderThumbnail
                                            image={getItemImage(item)}
                                            alt={getItemName(item)}
                                            className="h-9 w-9 text-base"
                                          />
                                          <span>{getItemName(item)}</span>
                                        </span>
                                      </td>
                                      <td className="text-center py-3 text-gray-700">{qty}</td>
                                      <td className="text-right py-3 text-gray-700">
                                        {item.currency || "$"}{price}
                                      </td>
                                    </tr>
                                  );
                                })}
                                <tr className="font-semibold">
                                  <td className="py-3 text-[#22262A]" colSpan="2">Total</td>
                                  <td className="text-right py-3 text-[#22262A]">${total}</td>
                                </tr>
                              </tbody>
                            </table>

                            {(order.shippingAddress || order.address) && (
                              <div className="mt-5">
                                <h4 className="text-sm font-semibold text-[#22262A] mb-2">Shipping Details</h4>
                                <p className="text-sm text-gray-700">
                                  {order.shippingAddress || order.address}
                                  {order.city ? `, ${order.city}` : ""}
                                  {order.state ? `, ${order.state}` : ""}
                                  {order.zipCode ? ` ${order.zipCode}` : ""}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className={`px-4 sm:px-6 py-4 bg-white border-t ${HAIRLINE} flex flex-wrap items-center gap-3`}>
                            <Link
                              to="/track-order"
                              state={{ orderId: orderNumber }}
                              className={BUTTON_SECONDARY}
                            >
                              Track Order
                            </Link>
                            {status !== 'delivered' && status !== 'cancelled' && onCancelOrder && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCancelError('');
                                  setCancelTarget({ order, key });
                                }}
                                className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                              >
                                <FiXCircle className="text-base" />
                                Cancel Order
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + ORDERS_PER_PAGE)}
                className={BUTTON_SECONDARY}
              >
                Load More Orders
                <FiChevronDown className="text-base" />
              </button>
            </div>
          )}
        </>
      )}

      {cancelTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-order-title"
        >
          <div
            className="absolute inset-0 bg-black/40 transition-opacity"
            onClick={() => !isCancelling && setCancelTarget(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl border border-[#E5E5E0] p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <FiXCircle className="text-2xl" />
            </div>
            <h2 id="cancel-order-title" className="text-lg font-bold text-[#22262A]">
              Cancel this order?
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Order #{cancelTarget.order.orderId ||
                (cancelTarget.order.id ? `ORD-${cancelTarget.order.id}` : cancelTarget.key)}{" "}
              will be cancelled. This cannot be undone.
            </p>
            {cancelError && <p className="mt-3 text-sm text-red-600">{cancelError}</p>}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setCancelTarget(null)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={confirmCancel}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {isCancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;