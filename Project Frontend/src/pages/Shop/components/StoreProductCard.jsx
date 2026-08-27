import React, { useState } from "react";
import { FaStar, FaRegHeart, FaHeart } from "react-icons/fa";
import { FaRegStarHalfStroke } from "react-icons/fa6";
import { IoCartOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { formatPrice } from "../productApi";

const DECIMAL_RATING = 4.5;
const LOW_STOCK_AT = 5;

const StoreProductCard = ({ product }) => {
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // The cart/wishlist POST this id to the backend as productId, so it must be the
  // real integer products-table id (dbId) — not the "db-<id>" routing id.
  const backendId = product.dbId ?? product.id;

  // Deal-aware pricing. salePrice is what the customer actually pays; both fall
  // back gracefully for products that never went through the deal-aware mapper
  // (the Home page's demo data reuses this card).
  const salePrice = product.salePrice ?? product.price;
  const hasDeal = Boolean(product.hasDeal) && product.discountPercent > 0;

  // A stock indicator only makes sense when we actually know the count (real
  // catalog products). Demo products carry no stock, so it's hidden for them.
  const knowsStock = typeof product.stock === "number";
  const outOfStock = knowsStock && product.stock === 0;
  const lowStock = knowsStock && product.stock > 0 && product.stock <= LOW_STOCK_AT;

  // The charged price and a display image both flow from here into the cart, so
  // a deal is honored at checkout and the line item shows the right thumbnail.
  const cartPayload = {
    id: backendId,
    title: product.title,
    price: salePrice,
    currency: product.currency,
    image: product.img || "🛍️",
    imagePath: product.img,
    category: product.category,
  };

  const handleAddToCart = (e) => {
    e?.preventDefault();
    if (outOfStock) return;
    addToCart(cartPayload, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleWishlist = (e) => {
    e?.preventDefault();
    toggleWishlist(cartPayload);
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
      className="group flex h-full flex-col rounded-lg p-3 relative bg-[#F8F8F8] hover:bg-[#E6F2FF] hover:ring-1 hover:ring-[#006CE4]/40 transition-colors"
    >
      {/* Top-left badge — a deal takes precedence over the "New" flag to avoid
          stacking two badges in the same corner. */}
      {hasDeal ? (
        <span className="bg-[#E11D48] text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md absolute top-2 left-2 sm:top-3 sm:left-3 z-10 shadow-sm">
          -{product.discountPercent}%
        </span>
      ) : product.isNew ? (
        <span className="bg-[#006CE4] text-white text-[10px] sm:text-xs px-2.5 rounded-[20px] absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
          New
        </span>
      ) : null}

      <div
        className={`absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 z-10 ${
          isInWishlist(backendId) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            handleToggleWishlist(e);
          }}
          aria-label="Toggle wishlist"
          className="bg-white rounded-full p-1.5 shadow-sm hover:scale-105 transition-transform"
        >
          {isInWishlist(backendId) ? (
            <FaHeart className="text-red-600 text-sm sm:text-base" />
          ) : (
            <FaRegHeart className="text-[#2196F3] text-sm sm:text-base" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            handleAddToCart(e);
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
          loading="lazy"
          className="max-w-full max-h-full object-contain"
        />
      </div>

      <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
        {product.category}
      </p>
      <p className="font-semibold text-sm sm:text-base text-[#22262A] leading-snug mt-0.5 line-clamp-2 min-h-[2.5em]">
        {product.title}
      </p>

      <div className="flex items-center text-[#FFC107] text-xs sm:text-sm mt-1.5">
        {stars}
        {showsHalf && <FaRegStarHalfStroke />}
      </div>

      {/* Price — sale price large, original struck through when discounted. */}
      <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
        <span className="text-[#006CE4] font-bold text-sm sm:text-base">
          {product.currency}
          {formatPrice(salePrice)}
        </span>
        {hasDeal && (
          <span className="text-gray-400 line-through text-xs">
            {product.currency}
            {formatPrice(product.price)}
          </span>
        )}
      </div>

      {/* Stock indicator — only when the count is known. */}
      {knowsStock && (
        <p
          className={`mt-1 text-[10px] sm:text-xs font-medium ${
            outOfStock
              ? "text-red-600"
              : lowStock
                ? "text-orange-500"
                : "text-green-600"
          }`}
        >
          {outOfStock
            ? "Out of stock"
            : lowStock
              ? `Only ${product.stock} left`
              : "In stock"}
        </p>
      )}

      {/* Pushed to the bottom so cards in a row keep their buttons aligned. */}
      <button
        onClick={(e) => {
          e.preventDefault();
          handleAddToCart(e);
        }}
        disabled={outOfStock}
        className="mt-auto pt-2.5 w-full"
      >
        <span
          className={`block w-full py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
            outOfStock
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : added
                ? "bg-green-600 text-white"
                : "bg-[#2196F3] text-white hover:bg-[#1a7fd1]"
          }`}
        >
          {outOfStock ? "Out of Stock" : added ? "Added ✓" : "Add to Cart"}
        </span>
      </button>
    </Link>
  );
};

export default StoreProductCard;
