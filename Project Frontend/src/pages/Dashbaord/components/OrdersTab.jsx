import { Link } from 'react-router-dom';

const OrdersTab = ({ orders = [] }) => {
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
        <div className="space-y-6">
          {orders.map((order, index) => (
            <div key={order.orderId || index} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#22262A]">
                    Order #{order.orderId}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.orderDate || new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="self-start sm:self-center text-xs font-semibold uppercase tracking-wide text-[#2196F3] bg-blue-50 px-3 py-1 rounded">
                  {order.status || "pending"}
                </span>
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
                    {order.items?.slice(0, 3).map((item, itemIdx) => (
                      <tr key={itemIdx} className="border-b border-gray-200">
                        <td className="py-3 text-gray-700">{item.title}</td>
                        <td className="text-right py-3 text-gray-700">
                          {item.currency || "$"}{item.price * item.qty}
                        </td>
                      </tr>
                    ))}
                    {(order.items?.length || 0) > 3 && (
                      <tr className="border-b border-gray-200">
                        <td className="py-3 text-gray-500" colSpan="2">
                          +{order.items.length - 3} more item(s)
                        </td>
                      </tr>
                    )}
                    <tr className="font-semibold">
                      <td className="py-3 text-[#22262A]">Total</td>
                      <td className="text-right py-3 text-[#22262A]">${order.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 bg-white border-t border-gray-200 flex flex-wrap gap-3">
                <Link
                  to="/track-order"
                  state={{ orderId: order.orderId }}
                  className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold px-6 py-2 rounded transition-colors"
                >
                  Track Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
