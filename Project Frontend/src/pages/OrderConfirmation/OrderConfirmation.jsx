import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoCartOutline } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Strictly gate this page behind real order data (e.g. coming from a
  // successful checkout/payment) — direct visits with no order get redirected.
  useEffect(() => {
    if (!location.state?.order) {
      navigate("/store");
    }
  }, [location.state, navigate]);

  const orderData = location.state?.order;

  if (!orderData) {
    return null;
  }

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

      {/* Content */}
      <div className="max-w-md mx-auto text-center px-4 py-16">
        <h1 className="text-2xl font-bold text-[#22262A] pb-4 border-b border-gray-200 mb-8 w-64 mx-auto">
          Your order has been placed
        </h1>

        {/* Cart + check icon */}
        <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
          <IoCartOutline className="w-16 h-16 text-[#22262A]" strokeWidth={12} />
          <span className="absolute top-1 right-1 w-8 h-8 rounded-full bg-[#2196F3] flex items-center justify-center ring-4 ring-white">
            <FaCheck className="text-white text-xs" />
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-3">
          Your order tracking ID: <span className="font-bold text-[#22262A]">{orderData.orderId}</span>
        </p>

        <p className="font-bold text-[#22262A] mb-2">
          Thank you for making us a part of your digital lifestyle!
        </p>

        <p className="text-sm text-gray-500 mb-8">
          You will receive confirmation email with order details shortly
        </p>

        <Link
          to="/store"
          className="block w-full bg-[#2196F3] hover:bg-[#1a7fd1] text-white font-semibold py-3 rounded-md transition-colors"
        >
          Continue
        </Link>
      </div>
    </main>
  );
};

export default OrderConfirmation;