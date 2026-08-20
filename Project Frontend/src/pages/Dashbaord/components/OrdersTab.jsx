import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FiChevronDown, FiTrash2 } from 'react-icons/fi';
import { getLiveOrderStatus } from '../dashboardStorage';

const getOrderKey = (order, index) => order.orderId || order.databaseOrderId || order.id || index;

const getOrderItems = (order) => {
  if (Array.isArray(order.items)) return order.items;
  if (Array.isArray(order.products)) return order.products;
  return [];
};

const getItemName = (item) => item.title || item.name || "Product";
const getItemQty = (item) => item.qty || item.quantity || 1;
const getOrderTotal = (order) => order.total ?? order.totalAmount ?? 0;

const formatOrderDate = (order) => {
  if (order.orderDate) return order.orderDate;
  const date = new Date(order.createdAt);
  return isNaN(date.getTime()) ? "Recent order" : date.toLocaleDateString();
};

const OrdersTab = ({ orders = [], onDeleteOrder }) => {
  const [expandedOrderKey, setExpandedOrderKey] = useState(null);

  const toggleDetails = (order, index) => {
    const orderKey = getOrderKey(order, index);
    setExpandedOrderKey((currentKey) => (currentKey === orderKey ? null : orderKey));
  };

  return (
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
        <div className="space-y-3">
          {orders.map((order, index) => {
            const orderKey = getOrderKey(order, index);
            const orderItems = getOrderItems(order);
            const firstItemName = orderItems.length > 0 ? getItemName(orderItems[0]) : "Order";
            const extraItemsCount = Math.max(orderItems.length - 1, 0);
            const isExpanded = expandedOrderKey === orderKey;
            const orderNumber = order.orderId || (order.id ? `ORD-${order.id}` : orderKey);
            const total = getOrderTotal(order);
            const liveStatus = getLiveOrderStatus(order);

            return (
              <div key={orderKey} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-white px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#22262A] truncate">
                      Order #{orderNumber}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {firstItemName}
                      {extraItemsCount > 0 ? ` +${extraItemsCount} more` : ""}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-5 text-sm">
                    <span className="text-gray-600">{formatOrderDate(order)}</span>
                    <span className="font-semibold text-[#22262A]">${total}</span>
                    <span className="justify-self-start text-xs font-semibold uppercase tracking-wide text-[#2196F3] bg-blue-50 px-3 py-1 rounded">
                      {liveStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleDetails(order, index)}
                      className="inline-flex items-center gap-2 bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-sm font-semibold px-4 py-2 rounded transition-colors"
                    >
                      Details
                      <FiChevronDown
                        className={`text-base transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteOrder(order)}
                      className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-4 py-2 rounded transition-colors"
                    >
                      <FiTrash2 className="text-base" />
                      Delete
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <>
                    <div className="px-4 sm:px-6 py-6 bg-gray-50 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-[#22262A] mb-4">Products</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
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
                              <tr key={itemIdx} className="border-b border-gray-200">
                                <td className="py-3 text-gray-700">{getItemName(item)}</td>
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

                    <div className="px-4 sm:px-6 py-4 bg-white border-t border-gray-200">
                      <Link
                        to="/track-order"
                        state={{ orderId: orderNumber }}
                        className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold px-6 py-2 rounded transition-colors"
                      >
                        Track Order
                      </Link>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
