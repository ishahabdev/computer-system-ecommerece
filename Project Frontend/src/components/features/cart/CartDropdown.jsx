import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { MdDeleteOutline } from "react-icons/md";
import { useCart } from "../../../context/CartContext";

const MAX_PREVIEW_ITEMS = 3;

const CartDropdown = ({ 
  isOpen, 
  onClose
}) => {
  const { cartItems, removeFromCart, getCartSummary } = useCart();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Close on Escape key
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const hasItems = cartItems.length > 0;
  const previewItems = cartItems.slice(0, MAX_PREVIEW_ITEMS);
  const remainingCount = Math.max(0, cartItems.length - MAX_PREVIEW_ITEMS);
  const cartSummary = getCartSummary();
  const subtotal = cartSummary.subtotal;
  const total = subtotal + cartSummary.shippingFee;
  const currency = hasItems ? cartItems[0].currency : "$";

  const handleViewCart = () => {
    onClose();
  };

  const handleContinueShopping = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop/Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Dropdown Panel */}
      <div
        ref={dropdownRef}
        className={`absolute right-0 top-full mt-2 w-screen max-w-sm bg-white rounded-xl shadow-2xl border border-gray-200 z-50 transition-all duration-300 transform origin-top-right ${
          isOpen 
            ? "opacity-100 scale-100 visible" 
            : "opacity-0 scale-95 invisible pointer-events-none"
        }`}
        role="dialog"
        aria-label="Shopping cart dropdown"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white rounded-t-xl">
          <h3 className="text-sm font-bold text-[#22262A]">Shopping Cart</h3>
          <p className="text-xs text-gray-500 mt-1">
            {hasItems 
              ? `${cartItems.length} item${cartItems.length !== 1 ? 's' : ''} in cart` 
              : 'Your cart is empty'}
          </p>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {!hasItems ? (
            // Empty State
            <div className="p-8 text-center">
              <p className="text-gray-600 text-sm font-medium mb-4">Your cart is empty</p>
              <Link
                to="/store"
                onClick={handleContinueShopping}
                className="inline-block text-[#2196F3] text-xs font-semibold hover:underline transition-colors"
                title="Continue shopping"
              >
                Start Shopping →
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items Preview */}
              <div className="divide-y divide-gray-200 p-4 space-y-3">
                {previewItems.map((item) => (
                  <div key={item.id} className="flex gap-3 py-3 group">
                    {/* Product Image */}
                    <div className="w-14 h-14 bg-[#F8F8F8] rounded-md flex items-center justify-center text-lg shrink-0 border border-gray-100 group-hover:border-[#2196F3] transition-colors">
                      {(() => {
                        const imageSrc = item.image || item.img || item.imagePath;
                        return typeof imageSrc === "string" &&
                          /^(https?:|\/|data:)/.test(imageSrc) ? (
                          <img
                            src={imageSrc}
                            alt={item.title}
                            className="w-full h-full rounded-md object-contain"
                          />
                        ) : (
                          "🛍️"
                        );
                      })()}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-[#22262A] line-clamp-1 mb-1">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#2196F3]">
                          {item.currency}{item.price * item.qty}
                        </span>
                        <span className="text-xs text-gray-500">x{item.qty}</span>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${item.title} from cart`}
                      title="Remove item"
                      className="text-gray-300 hover:text-red-500 text-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MdDeleteOutline />
                    </button>
                  </div>
                ))}

                {/* Show more indicator */}
                {remainingCount > 0 && (
                  <div className="py-3 text-center">
                    <p className="text-xs text-gray-500">
                      +{remainingCount} more item{remainingCount !== 1 ? 's' : ''} in cart
                    </p>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="px-4 h-px bg-gray-200" />

              {/* Order Summary */}
              <div className="px-4 py-4 space-y-2 bg-gradient-to-b from-white to-gray-50">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-[#22262A]">
                    {currency}{subtotal}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-semibold text-[#22262A]">
                    {currency}{cartSummary.shippingFee}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center">
                  <span className="font-semibold text-[#22262A] text-sm">Total:</span>
                  <span className="font-bold text-[#2196F3] text-lg">
                    {currency}{total}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {hasItems && (
          <div className="px-4 py-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-white rounded-b-xl space-y-2">
            <Link
              to="/cart"
              onClick={handleViewCart}
              className="block w-full text-center bg-gradient-to-r from-[#2196F3] to-[#1a7fd1] hover:shadow-lg text-white text-xs font-bold py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105"
              title="View full shopping cart"
            >
              View Full Cart
            </Link>

            <Link
              to="/store"
              onClick={handleContinueShopping}
              className="block text-center text-[#2196F3] text-xs font-semibold hover:underline transition-colors py-2"
              title="Continue shopping"
            >
              Continue Shopping
            </Link>
          </div>
        )}

        {!hasItems && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-white to-gray-50">
            <Link
              to="/store"
              onClick={handleContinueShopping}
              className="block text-center bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-xs font-bold py-2.5 rounded transition-colors duration-200"
              title="Continue shopping"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDropdown;
