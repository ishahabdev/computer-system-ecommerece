import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaMinus, FaPlus } from "react-icons/fa6";

const SHIPPING_FEE = 20;

const Cart = () => {
  const [items, setItems] = useState([
    {
      id: 1,
      title: "Razer Mamba Tournament Edition",
      brand: "Razer Inc",
      price: 199,
      currency: "$",
      qty: 1,
    },
    {
      id: 2,
      title: "Lenovo Gaming Laptop",
      brand: "Lenovo",
      price: 899,
      currency: "$",
      qty: 2,
    },
  ]);

  const updateQty = (id, delta) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const hasItems = items.length > 0;
  const total = hasItems ? subtotal + SHIPPING_FEE : 0;
  const currency = hasItems ? items[0].currency : "$";

  const renderQty = (item) => (
    <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden w-fit">
      <button
        onClick={() => updateQty(item.id, -1)}
        aria-label="Decrease quantity"
        className="w-8 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
      >
        <FaMinus className="text-[10px]" />
      </button>
      <span className="w-9 text-center font-medium text-sm">{item.qty}</span>
      <button
        onClick={() => updateQty(item.id, 1)}
        aria-label="Increase quantity"
        className="w-8 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
      >
        <FaPlus className="text-[10px]" />
      </button>
    </div>
  );

  return (
    <div className="bg-white px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 py-6 md:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-blue-500 transition-colors">
          Home
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">Cart</span>
      </nav>

      {!hasItems ? (
        <div className="bg-[#F8F8F8] rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-6">Your cart is empty.</p>
          <Link
            to="/store"
            className="inline-block bg-[#2196F3] text-white text-sm font-semibold px-8 py-3 rounded-md hover:bg-[#1a7fd1] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* ===== LEFT: PRODUCTS TABLE ===== */}
          <div className="flex-1 min-w-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#F8F8F8] text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    <th className="py-3.5 px-4 border border-gray-200 w-[45%]">
                      Product
                    </th>
                    <th className="py-3.5 px-4 border border-gray-200">
                      Price
                    </th>
                    <th className="py-3.5 px-4 border border-gray-200">
                      QTY
                    </th>
                    <th className="py-3.5 px-4 border border-gray-200">
                      Total Price
                    </th>
                    <th className="py-3.5 px-4 border border-gray-200 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      {/* Product */}
                      <td className="py-4 px-4 border border-gray-200">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#F8F8F8] rounded-md flex items-center justify-center shrink-0">
                            <span className="text-[10px] text-gray-400 text-center px-1">
                              {item.category === "Mouses" ? "Mouse" : "Laptop"}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm sm:text-base text-[#22262A] leading-snug line-clamp-1">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {item.brand}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 border border-gray-200 text-sm sm:text-base font-semibold whitespace-nowrap">
                        {item.currency}
                        {item.price}
                      </td>

                      {/* Qty */}
                      <td className="py-4 px-4 border border-gray-200">
                        {renderQty(item)}
                      </td>

                      {/* Total */}
                      <td className="py-4 px-4 border border-gray-200 text-sm sm:text-base font-semibold whitespace-nowrap">
                        {item.currency}
                        {item.price * item.qty}
                      </td>

                      {/* Remove */}
                      <td className="py-4 px-4 border border-gray-200">
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.title}`}
                          className="text-gray-400 hover:text-red-500 text-lg leading-none transition-colors"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Delete all */}
            <div className="flex justify-end mt-5">
              <button
                onClick={clearCart}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-6 py-2.5 rounded-md transition-colors"
              >
                Delete All Items
              </button>
            </div>
          </div>

          {/* ===== RIGHT: SUMMARY ===== */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="bg-[#F8F8F8] rounded-md p-6">
              <h3 className="font-bold text-lg mb-5">Cart Total</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-[#22262A]">
                    {currency}
                    {subtotal}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping fee</span>
                  <span className="font-semibold text-[#22262A]">
                    {currency}
                    {SHIPPING_FEE}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Coupon</span>
                  <span className="font-semibold text-[#22262A]">No</span>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                <span className="font-bold text-base text-[#22262A]">TOTAL</span>
                <span className="font-bold text-lg text-[#22262A]">
                  {currency}
                  {total}
                </span>
              </div>

              <button className="w-full mt-6 bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-sm font-semibold py-3 rounded-md transition-colors">
                Check out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
