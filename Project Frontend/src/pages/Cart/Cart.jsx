import { Link, useNavigate } from "react-router-dom";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import Checkout from "../Checkout/Checkout.jsx"

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartSummary, clearCart } = useCart();
  const { isAuthenticated } = useAuth();


  const updateQty = (id, delta) => {
    const item = cartItems.find((i) => i.id === id);
    if (item) {
      updateQuantity(id, item.qty + delta);
    }
  };

  const removeItem = (id) => {
    removeFromCart(id);
  };

  const handleDeleteAll = () => {
    if (clearCart) {
      clearCart();
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Redirect to signin with intended destination
      navigate("/signin", { state: { from: "/checkout" } });
    } else {
      // User is authenticated, proceed to checkout
      navigate("/checkout");
    }
  };

  const cartSummary = getCartSummary();
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + (cartSummary.shippingFee || 0);
  const hasItems = cartItems.length > 0;
  const currency = hasItems ? cartItems[0].currency : "$";

  const renderQty = (item) => (
    <div className="flex items-center gap-3 bg-gray-100 rounded-md px-3 py-1.5 w-fit">
      <button
        onClick={() => updateQty(item.id, -1)}
        aria-label="Decrease quantity"
        title="Decrease quantity"
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <FaMinus className="text-[10px]" />
      </button>
      <span className="w-4 text-center font-semibold text-sm text-[#22262A]">
        {item.qty}
      </span>
      <button
        onClick={() => updateQty(item.id, 1)}
        aria-label="Increase quantity"
        title="Increase quantity"
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <FaPlus className="text-[10px]" />
      </button>
    </div>
  );

  return (
    <main className="bg-white min-h-screen">
      <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[#2196F3] transition-colors" title="Go to home">
            Home
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">Cart</span>
        </nav>

        {!hasItems ? (
          <section className="text-center py-16">
            <p className="text-gray-700 text-xl mb-2 font-semibold">Your cart is empty</p>
            <p className="text-gray-500 mb-8">Add some products to your cart and they will appear here.</p>
            <Link
              to="/store"
              className="inline-block bg-[#2196F3] text-white text-sm font-semibold px-8 py-3 rounded-md hover:bg-[#1a7fd1] transition-colors"
              title="Continue shopping"
            >
              Start Shopping Now
            </Link>
          </section>
        ) : (
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-8 lg:gap-10">
            {/* ===== LEFT: CART ITEMS ===== */}
            <section className="flex-1 min-w-0">
              {/* Cart Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-xs font-bold text-gray-800 uppercase tracking-wide border-b border-gray-200">
                      <th className="py-3 pr-3 w-8"></th>
                      <th className="text-left py-3 pr-4">Product</th>
                      <th className="text-center py-3 px-4">Price</th>
                      <th className="text-center py-3 px-4">Qty</th>
                      <th className="text-right py-3 px-4">Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors"
                      >
                        {/* Remove */}
                        <td className="py-5 pr-3 align-middle">
                          <button
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.title} from cart`}
                            title="Remove item"
                            className="w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors"
                          >
                            <IoClose size={14} />
                          </button>
                        </td>

                        {/* Product Info */}
                        <td className="py-5 pr-4 align-middle">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
                              {(() => {
                                const imageSrc = item.image || item.img || item.imagePath;
                                return typeof imageSrc === "string" &&
                                  /^(https?:|\/|data:)/.test(imageSrc) ? (
                                  <img
                                    src={imageSrc}
                                    alt={item.title}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                ) : (
                                  <span className="text-2xl">🛍️</span>
                                );
                              })()}
                            </div>
                            <p className="font-semibold text-sm sm:text-base text-[#22262A] leading-snug">
                              {item.title}
                            </p>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-5 px-4 align-middle text-center">
                          <span className="text-sm sm:text-base font-semibold text-[#22262A] whitespace-nowrap">
                            {item.currency}
                            {item.price}
                          </span>
                        </td>

                        {/* Quantity */}
                        <td className="py-5 px-4 align-middle">
                          <div className="flex justify-center">{renderQty(item)}</div>
                        </td>

                        {/* Total Price */}
                        <td className="py-5 px-4 align-middle text-right">
                          <span className="text-sm sm:text-base font-semibold text-[#22262A] whitespace-nowrap">
                            {item.currency}
                            {item.price * item.qty}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Delete All */}
              <div className="mt-6">
                <button
                  onClick={handleDeleteAll}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-6 py-2.5 rounded-md transition-colors"
                  title="Delete all items from cart"
                >
                  Delete All Items
                </button>
              </div>
            </section>

            {/* ===== RIGHT: ORDER SUMMARY ===== */}
            <aside className="w-full lg:w-72 shrink-0 flex flex-col justify-end">
              <div className="space-y-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-sm font-semibold text-[#22262A]">
                    {currency}
                    {subtotal}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Shipping fee</span>
                  <span className="text-sm font-semibold text-[#22262A]">
                    {currency}
                    {cartSummary.shippingFee}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-5 flex justify-between items-center">
                <span className="text-base font-bold text-[#22262A]">TOTAL</span>
                <span className="text-lg font-bold text-[#22262A]">
                  {currency}
                  {total}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-sm font-semibold py-3.5 rounded-md transition-colors"
                title="Proceed to checkout"
              >
                Check out
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;