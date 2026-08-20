import { useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown, FiChevronUp, FiTrash2 } from "react-icons/fi";
import { getLiveOrderStatus } from "../dashboardStorage";

const getOrderKey = (order, index) => order.orderId || order.id || index;

const OrdersTab = ({ orders = [], onDeleteOrder }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const toggleOrder = (key) => {
    setExpandedOrder((current) => (current === key ? null : key));
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
            const key = getOrderKey(order, index);
            const isExpanded = expandedOrder === key;
            const orderDate =
              order.orderDate ||
              (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "");

            return (
              <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#22262A] truncate">
                      Order #{order.orderId || order.id}
                    </p>
                    <p className="text-xs text-gray-600">
                      {orderDate} · {order.items?.length || 0} product(s)
                    </p>
                  </div>

                  <p className="font-bold text-[#22262A] whitespace-nowrap">${order.total || 0}</p>

                  <span className="text-xs font-semibold uppercase tracking-wide text-[#2196F3] bg-blue-50 px-3 py-1 rounded whitespace-nowrap">
                    {getLiveOrderStatus(order)}
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleOrder(key)}
                    aria-expanded={isExpanded}
                    className="flex items-center gap-1 bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-sm font-semibold px-4 py-2 rounded transition-colors"
                  >
                    Details
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteOrder?.(order)}
                    aria-label={`Delete order ${order.orderId || order.id}`}
                    className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-4 py-2 rounded transition-colors"
                  >
                    <FiTrash2 />
                    Delete
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 px-4 py-5 bg-gray-50/60 space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-[#22262A] mb-3">Products</h4>
                      <div className="divide-y divide-gray-200 bg-white border border-gray-200 rounded">
                        {order.items?.map((item, itemIdx) => (
                          <div
                            key={`${item.id || item.title}-${itemIdx}`}
                            className="flex items-center justify-between gap-4 px-4 py-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded flex items-center justify-center shrink-0">
                                {item.imagePath ? (
                                  <img
                                    src={item.imagePath}
                                    alt={item.title}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                ) : (
                                  <span className="text-xl">{item.image || "P"}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-[#22262A] truncate">{item.title}</p>
                                <p className="text-xs text-gray-600">Qty: {item.qty || 1}</p>
                              </div>
                            </div>
                            <p className="font-semibold text-[#22262A] whitespace-nowrap">
                              {item.currency || "$"}
                              {(item.price || 0) * (item.qty || 1)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold text-[#22262A] mb-3">Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span>${order.subtotal || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Delivery</span>
                            <span>${order.shippingFee || 0}</span>
                          </div>
                          {order.couponDiscount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount</span>
                              <span>-${order.couponDiscount}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-[#22262A] pt-2 border-t border-gray-200">
                            <span>Total</span>
                            <span>${order.total || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-[#22262A] mb-3">Shipping</h4>
                        <p className="text-sm text-gray-700">
                          {order.shippingAddress}
                          {order.city ? `, ${order.city}` : ""}
                          {order.state ? `, ${order.state}` : ""} {order.zipCode || ""}
                        </p>
                        {order.estimatedDelivery && (
                          <p className="text-sm text-gray-700 mt-2">
                            Estimated: {order.estimatedDelivery}
                          </p>
                        )}
                        <Link
                          to="/track-order"
                          state={{ orderId: order.orderId || order.id }}
                          className="inline-block mt-3 text-sm font-semibold text-[#2196F3] hover:text-[#1a7fd1]"
                        >
                          Track order
                        </Link>
                      </div>
                    </div>
                  </div>
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
