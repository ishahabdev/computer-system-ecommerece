import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineLockClosed } from "react-icons/hi2";
import { IoInformationCircleOutline } from "react-icons/io5";
import { useCart } from "../../context/CartContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartSummary, clearCart } = useCart();

  // ---- Address form state ----
  const [address, setAddress] = useState("House no 7, Achini Payan, Ring Road");
  const [city, setCity] = useState("Peshawar");
  const [state, setState] = useState("KP");
  const [zipCode, setZipCode] = useState("25000");

  // ---- Card form state ----
  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiration, setExpiration] = useState("02/2028");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(true);

  // ---- Validation error state ----
  const [errors, setErrors] = useState({});

  // ---- Coupon state ----
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const cartSummary = getCartSummary();
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const hasItems = cartItems.length > 0;
  const total = subtotal + (cartSummary.shippingFee || 0) - couponDiscount;
  const currency = hasItems ? cartItems[0].currency : "$";
  const vat = Math.round(subtotal * 0.05); // 5% VAT

  const redeemCoupon = () => {
    if (couponCode.trim()) {
      setCouponApplied(true);
      setCouponDiscount(Math.round(subtotal * 0.1));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate address fields
    if (!address.trim()) newErrors.address = "Address is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!state.trim()) newErrors.state = "State is required";
    if (!zipCode.trim()) newErrors.zipCode = "Zip code is required";

    // Validate card fields
    if (!nameOnCard.trim()) newErrors.nameOnCard = "Name on card is required";
    if (!cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required";
    } else if (!/^\d{13,19}$/.test(cardNumber.replace(/\s/g, ""))) {
      newErrors.cardNumber = "Invalid card number";
    }
    if (!expiration.trim()) {
      newErrors.expiration = "Expiration date is required";
    } else if (!/^\d{2}\/\d{4}$/.test(expiration)) {
      newErrors.expiration = "Invalid format (MM/YYYY)";
    }
    if (!cvv.trim()) {
      newErrors.cvv = "CVV is required";
    } else if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = "Invalid CVV";
    }

    // Check if cart has items
    if (!hasItems) {
      newErrors.cart = "Cart is empty";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = () => {
    if (!validateForm()) {
      alert("Please fill all required fields correctly");
      return;
    }

    const orderData = {
      orderId: "ORD-2024-" + Math.random().toString(36).substring(7).toUpperCase(),
      orderDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(
        "en-US",
        { year: "numeric", month: "long", day: "numeric" }
      ),
      items: cartItems,
      subtotal,
      shippingFee: cartSummary.shippingFee,
      couponDiscount,
      total,
      shippingAddress: address,
      city,
      state,
      zipCode,
      status: "Confirmed",
    };

    // Clear the cart
    clearCart();
    
    // Navigate to confirmation page
    navigate("/order-confirmation", { state: { order: orderData } });
  };

  const inputClass =
    "w-full bg-gray-50 text-sm text-gray-600 placeholder-gray-400 rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#2196F3]/40 transition";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <main className="bg-white min-h-screen">
      {/* Breadcrumb bar */}
      <div className="bg-gray-50">
        <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 py-3">
          <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
            <Link to="/" className="text-[#2196F3] hover:underline transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">cart</span>
          </nav>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 py-8 md:py-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* ===== LEFT: ADDRESS + CARD FORM ===== */}
          <section className="flex-1 min-w-0">
            {/* Address */}
            <h1 className="text-2xl font-bold text-[#22262A] uppercase tracking-wide pb-4 border-b border-gray-200 mb-6">
              Address
            </h1>

            <div className="space-y-5 max-w-xl">
              <div>
                <label className={labelClass}>Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Zip Code</label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Credit Card Information */}
            <div className="flex items-center justify-between mt-10 mb-6 max-w-xl">
              <h2 className="text-lg font-bold text-[#22262A]">Credit Card Information</h2>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <HiOutlineLockClosed className="text-sm" />
                Secure server
              </span>
            </div>

            <div className="space-y-5 max-w-xl">
              <div>
                <label className={labelClass}>Name on Card</label>
                <input
                  type="text"
                  value={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value)}
                  placeholder="As shown on card"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="**** **** **** 1234"
                    className={`${inputClass} pr-12`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    <span className="relative w-6 h-6">
                      <span className="absolute left-0 w-4 h-4 rounded-full bg-red-500" />
                      <span className="absolute left-2 w-4 h-4 rounded-full bg-yellow-400 mix-blend-multiply opacity-90" />
                    </span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Expiration date</label>
                  <input
                    type="text"
                    value={expiration}
                    onChange={(e) => setExpiration(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`${labelClass} flex items-center gap-1`}>
                    CVV
                    <IoInformationCircleOutline className="text-gray-400 text-sm" />
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="max-w-xl border-b border-gray-200 mt-8 pt-2" />

            <label className="flex items-center gap-2 mt-5 text-sm text-gray-600 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                className="w-4 h-4 accent-[#2196F3] rounded"
              />
              Save Credit card information for next time.
            </label>
          </section>

          {/* ===== RIGHT: ORDER SUMMARY ===== */}
          <aside className="w-full lg:w-80 shrink-0">
            <h2 className="text-lg font-bold text-[#22262A] mb-4">Order Summary</h2>

            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-[#22262A]">Order Total</span>
              <span className="text-sm font-bold text-[#22262A]">
                {currency}
                {subtotal}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">VAT</span>
              <span className="text-sm font-medium text-[#22262A]">
                {currency}
                {vat}
              </span>
            </div>

            <div className="border-t border-gray-200 my-4" />

            <div className="space-y-3">
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
              {couponApplied && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Coupon Discount</span>
                  <span className="text-sm font-semibold text-green-600">
                    -{currency}
                    {couponDiscount}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Coupon</span>
                <span className="text-sm font-semibold text-[#22262A]">
                  {couponApplied ? `Applied (${couponCode})` : "No"}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4 mb-6 flex justify-between items-center">
              <span className="text-xl font-bold text-[#22262A]">Total</span>
              <span className="text-xl font-bold text-[#22262A]">
                {currency}
                {total}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={!hasItems}
              className="w-full bg-[#2196F3] hover:bg-[#1a7fd1] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-3.5 rounded-md transition-colors mb-4"
            >
              {hasItems ? "Check out" : "Cart is empty"}
            </button>

            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Coupon code"
                className="flex-1 bg-gray-50 text-sm text-gray-600 placeholder-gray-400 rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#2196F3]/40 transition"
              />
              <button
                onClick={redeemCoupon}
                className="bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-sm font-semibold px-5 rounded-md transition-colors whitespace-nowrap"
              >
                Redeem
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Checkout;