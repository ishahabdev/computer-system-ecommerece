import { Link } from "react-router-dom";

const OrderDetailsTab = ({ order, user, onBack }) => {
  if (!order) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-[#22262A] mb-6">Order Details</h2>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">Select an order to view details.</p>
          <button type="button" onClick={onBack} className="bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-sm font-semibold px-6 py-2 rounded transition-colors">
            Go to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#22262A]">Order Details</h2>
          <p className="text-sm text-gray-600 mt-1">Order #{order.orderId}</p>
        </div>
        <button type="button" onClick={onBack} className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold px-5 py-2.5 rounded transition-colors">
          Back to Orders
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-[#22262A]">Products</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {order.items?.map((item, index) => (
              <div key={`${item.id || item.title}-${index}`} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded flex items-center justify-center shrink-0">
                    {item.imagePath ? (
                      <img src={item.imagePath} alt={item.title} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-2xl">{item.image || "P"}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#22262A] truncate">{item.title}</p>
                    <p className="text-sm text-gray-600">Qty: {item.qty || 1}</p>
                  </div>
                </div>
                <p className="font-semibold text-[#22262A] whitespace-nowrap">
                  {item.currency || "$"}{(item.price || 0) * (item.qty || 1)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-[#22262A] mb-4">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${order.subtotal || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span>${order.shippingFee || 0}</span></div>
              {order.couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-${order.couponDiscount}</span></div>}
              <div className="flex justify-between font-bold text-[#22262A] pt-3 border-t border-gray-200"><span>Total</span><span>${order.total || 0}</span></div>
            </div>
          </section>

          <section className="border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-[#22262A] mb-4">Shipping</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>{user?.name || "Customer"}</p>
              <p>{user?.email || ""}</p>
              <p>{order.shippingAddress}{order.city ? `, ${order.city}` : ""}{order.state ? `, ${order.state}` : ""} {order.zipCode || ""}</p>
            </div>
          </section>

          <section className="border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-[#22262A] mb-4">Delivery</h3>
            <p className="text-sm text-gray-700">Status: <span className="font-semibold">{order.status || "pending"}</span></p>
            {order.estimatedDelivery && <p className="text-sm text-gray-700 mt-2">Estimated: {order.estimatedDelivery}</p>}
            <Link to="/track-order" state={{ orderId: order.orderId }} className="inline-block mt-4 text-sm font-semibold text-[#2196F3] hover:text-[#1a7fd1]">
              Track order
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default OrderDetailsTab;
