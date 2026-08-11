import React, { useState } from "react";
import { FaStar, FaRegHeart, FaHeart } from "react-icons/fa";
import { FaRegStarHalfStroke } from "react-icons/fa6";
import { IoCartOutline } from "react-icons/io5";
import { useCart } from "react-use-cart";
import { Link } from "react-router-dom";

const DECIMAL_RATING = 4.5;

const StoreProductCard = ({ product }) => {
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.img,
      category: product.category,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const stars = [];
  for (let i = 0; i < 4; i += 1) {
    stars.push(<FaStar key={i} />);
  }
  const showsHalf =
    !Number.isInteger(product.rating) || product.rating < DECIMAL_RATING;

  return (
    <Link
      to={`/store/product/${product.id}`}
      className="group rounded-lg p-3 relative bg-[#F8F8F8] hover:bg-[#E6F2FF] hover:ring-1 hover:ring-[#006CE4]/40 transition-colors block"
    >
      {product.isNew && (
        <span className="bg-[#006CE4] text-white text-[10px] sm:text-xs px-2.5 rounded-[20px] absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
          New
        </span>
      )}

      <div
        className={`absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 z-10 ${
          liked ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            setLiked(!liked);
          }}
          aria-label="Toggle wishlist"
          className="bg-white rounded-full p-1.5 shadow-sm hover:scale-105 transition-transform"
        >
          {liked ? (
            <FaHeart className="text-red-600 text-sm sm:text-base" />
          ) : (
            <FaRegHeart className="text-[#2196F3] text-sm sm:text-base" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            handleAddToCart();
          }}
          aria-label="Add to cart"
          className="bg-white rounded-full p-1.5 shadow-sm hover:scale-105 transition-transform"
        >
          <IoCartOutline className="text-[#2196F3] text-sm sm:text-base" />
        </button>
      </div>

      <div className="w-full h-[110px] sm:h-[130px] md:h-[140px] flex items-center justify-center py-3 sm:py-2">
        <img
          src={product.img}
          alt={product.title}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
        {product.category}
      </p>
      <p className="font-semibold text-sm sm:text-base text-[#22262A] leading-snug mt-0.5 line-clamp-2">
        {product.title}
      </p>

      <div className="flex items-center text-[#FFC107] text-xs sm:text-sm mt-1.5">
        {stars}
        {showsHalf && <FaRegStarHalfStroke />}
      </div>

      <p className="text-[#006CE4] font-semibold text-sm sm:text-base mt-1.5">
        {product.currency}
        {product.price}
      </p>

      <button
        onClick={(e) => {
          e.preventDefault();
          handleAddToCart();
        }}
        className={`mt-2.5 w-full py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
          added
            ? "bg-green-600 text-white"
            : "bg-[#2196F3] text-white hover:bg-[#1a7fd1]"
        }`}
      >
        {added ? "Added ✓" : "Add to Cart"}
      </button>
    </Link>
  );
};

export default StoreProductCard;
