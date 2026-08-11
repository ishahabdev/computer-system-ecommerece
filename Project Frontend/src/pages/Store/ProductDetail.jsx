import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { FaMinus, FaPlus, FaCheck } from "react-icons/fa6";
import { FiChevronRight } from "react-icons/fi";
import { FaFacebookF, FaTwitter, FaTruck } from "react-icons/fa";
import { useCart } from "react-use-cart";
import { getProductById, products } from "./data";
import adImage from "../../assets/homePIc/homeflash1.webp";

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("information");
  const [mainImage, setMainImage] = useState(0);
  const { addItem } = useCart();

  const product = getProductById(id);

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-6xl font-black text-[#2196F3]">404</p>
        <h1 className="text-xl font-bold mt-4">Product not found</h1>
        <Link
          to="/store"
          className="mt-6 bg-[#2196F3] text-white text-sm font-medium px-6 py-3 rounded-md hover:bg-[#1a7fd1] transition-colors"
        >
          Back to Store
        </Link>
      </div>
    );
  }

  // Gallery: product image + up to 3 others from same category
  const sameCategoryImages = Array.from(
    new Set(
      products.filter((p) => p.category === product.category).map((p) => p.img)
    )
  );
  const gallery = [product.img, ...sameCategoryImages]
    .filter((img, index, self) => self.indexOf(img) === index)
    .slice(0, 4);

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const bestSelling = products
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const oldPrice = Math.round(product.price * 1.2);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i += 1) {
      addItem({
        id: product.id,
        name: product.title,
        price: product.price,
        image: product.img,
        category: product.category,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const renderStars = (count = 5) => {
    const stars = [];
    for (let i = 0; i < count; i += 1) {
      stars.push(<FaStar key={i} className="text-xs sm:text-sm" />);
    }
    return stars;
  };

  return (
    <div className="bg-white px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 py-6 md:py-10">
      {/* Breadcrumbs */}
      <nav
        className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="hover:text-blue-500 transition-colors">
          Home
        </Link>
        <FiChevronRight className="text-xs" />
        <Link to="/store" className="hover:text-blue-500 transition-colors">
          Store
        </Link>
        <FiChevronRight className="text-xs" />
        <Link to="/store" className="hover:text-blue-500 transition-colors">
          {product.category}
        </Link>
        <FiChevronRight className="text-xs" />
        <span className="text-gray-900 font-medium">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_280px] gap-8 lg:gap-10">
        {/* ===== LEFT: GALLERY ===== */}
        <div>
          <div className="bg-[#F8F8F8] rounded-md flex items-center justify-center p-6 h-[260px] sm:h-[320px] lg:h-[380px]">
            <img
              src={gallery[mainImage]}
              alt={`${product.title} - Product image ${mainImage + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {gallery.map((img, index) => (
              <button
                key={`${img}-${index}`}
                onClick={() => setMainImage(index)}
                aria-label={`View image ${index + 1}`}
                className={`bg-[#F8F8F8] rounded-md h-[60px] sm:h-[70px] flex items-center justify-center p-1.5 transition ${
                  mainImage === index
                    ? "ring-2 ring-[#006CE4]"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`Product thumbnail - view option ${index + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>

        {/* ===== MIDDLE: INFO ===== */}
        <div className="min-w-0">
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            {product.brand}
          </p>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#22262A] mt-1 leading-tight">
            {product.title}
          </h1>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div className="flex text-[#FFC107]">{renderStars()}</div>
            <span className="text-gray-500 text-sm">0 reviews</span>
            <button className="text-[#006CE4] text-sm hover:underline ml-1">
              Submit a review
            </button>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mt-5">
            <span className="text-3xl font-bold text-[#006CE4]">
              {product.currency}
              {product.price}
            </span>
            <span className="text-xl text-gray-400 line-through">
              {product.currency}
              {oldPrice}
            </span>
          </div>

          {/* Facts */}
          <ul className="mt-5 space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="text-gray-400 w-24">Availability:</span>
              <span className="text-green-600 font-medium">In stock</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-gray-400 w-24">Category:</span>
              {product.category}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-gray-400 w-24">Shipping:</span>
              <span className="flex items-center gap-1.5 text-green-600">
                <FaTruck /> Free shipping
              </span>
            </li>
          </ul>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-9 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
              >
                <FaMinus className="text-xs" />
              </button>
              <span className="w-10 text-center font-medium text-sm">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                aria-label="Increase quantity"
                className="w-9 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
              >
                <FaPlus className="text-xs" />
              </button>
            </div>

            <button className="bg-[#006CE4] text-white text-sm font-semibold px-6 py-2.5 rounded-sm hover:bg-[#1a7fd1] transition-colors">
              Buy Now
            </button>

            <button
              onClick={handleAddToCart}
              className={`text-sm font-semibold px-6 py-2.5 rounded-sm border-2 transition-colors ${
                added
                  ? "border-green-600 text-green-600"
                  : "border-[#006CE4] text-[#006CE4] hover:bg-blue-50"
              }`}
            >
              {added ? "Added ✓" : "Add To Cart"}
            </button>
          </div>

          {/* Share */}
          <div className="flex items-center gap-3 mt-6">
            <span className="text-sm text-gray-600">Share it on</span>
            <div className="flex gap-2">
              <a
                href="#"
                aria-label="Facebook"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-white hover:bg-[#006CE4] hover:border-[#006CE4] transition-colors"
              >
                <FaFacebookF size={14} />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-white hover:bg-[#006CE4] hover:border-[#006CE4] transition-colors"
              >
                <FaTwitter size={14} />
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8">
            <div className="flex gap-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("information")}
                className={`pb-2.5 text-sm font-medium transition-colors ${
                  activeTab === "information"
                    ? "text-[#006CE4] border-b-2 border-[#006CE4]"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Product Information
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`pb-2.5 text-sm font-medium transition-colors ${
                  activeTab === "reviews"
                    ? "text-[#006CE4] border-b-2 border-[#006CE4]"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Reviews
              </button>
            </div>

            <div className="py-5 text-sm text-gray-600 leading-relaxed space-y-3">
              {activeTab === "information" ? (
                <>
                  <p>{product.description}</p>
                  <ul className="space-y-1.5">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <FaCheck className="text-[#006CE4] mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <p>There are no reviews yet. Be the first to review.</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ===== RIGHT: BEST SELLING + AD ===== */}
        <aside className="space-y-8">
          <div>
            <h3 className="font-bold text-base mb-4">Best selling</h3>
            <div className="space-y-4">
              {bestSelling.map((item) => (
                <Link
                  key={item.id}
                  to={`/store/product/${item.id}`}
                  className="flex gap-3 items-center group"
                >
                  <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] bg-[#F8F8F8] rounded-md flex items-center justify-center shrink-0 p-1.5">
                    <img
                      src={item.img}
                      alt={`${item.title} - Computer product thumbnail`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#22262A] leading-snug line-clamp-2 group-hover:text-[#006CE4] transition-colors">
                      {item.title}
                    </p>
                    <div className="flex text-[#FFC107] my-0.5">
                      {renderStars(4)}
                    </div>
                    <p className="text-sm">
                      <span className="text-[#006CE4] font-semibold">
                        {item.currency}
                        {item.price}
                      </span>{" "}
                      <span className="text-gray-400 line-through text-xs">
                        {item.currency}
                        {Math.round(item.price * 1.2)}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Ad box */}
          <div className="bg-[#F8F8F8] rounded-md p-5 text-center">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">
              Advertisement
            </p>
            <img
              src={adImage}
              alt="Featured computer equipment - Advertisement"
              className="h-24 mx-auto object-contain"
            />
            <p className="font-semibold text-sm mt-3">Product Name</p>
            <button className="mt-1.5 text-[#006CE4] text-xs font-medium hover:underline">
              Shop Now →
            </button>
          </div>
        </aside>
      </div>

      {/* ===== RELATED PRODUCTS ===== */}
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="text-lg sm:text-xl font-bold mb-5">
            Related Products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/store/product/${item.id}`}
                className="bg-[#F8F8F8] hover:bg-[#E6F2FF] rounded-md p-3 transition-colors"
              >
                <div className="h-[90px] sm:h-[110px] flex items-center justify-center">
                  <img
                    src={item.img}
                    alt={`${item.title} - Computer product`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-2">{item.category}</p>
                <p className="font-semibold text-sm text-[#22262A] leading-snug line-clamp-1">
                  {item.title}
                </p>
                <div className="flex text-[#FFC107] mt-1">{renderStars()}</div>
                <p className="text-[#006CE4] font-semibold text-sm mt-1">
                  {item.currency}
                  {item.price}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
