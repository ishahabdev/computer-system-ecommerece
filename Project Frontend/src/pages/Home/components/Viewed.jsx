import React from "react";
import { Link } from "react-router-dom";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import img1 from "../../../assets/homePIc/homeview1.webp";
import img2 from "../../../assets/homePIc/homeview2.webp";
import img3 from "../../../assets/homePIc/homeview3.webp";
import Typography from "../../../components/common/Typography";
import { FaStar } from "react-icons/fa";
import { FaRegStarHalfStroke } from "react-icons/fa6";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useToast } from "../../../context/ToastContext";

const MAX_VIEWED_ITEMS = 8;

// Store perks — static (not product data), so they stay hardcoded, but with real
// copy instead of the Lorem ipsum that used to fill all three descriptions.
const PERKS = [
  {
    id: 1,
    img: img2,
    title: "FREE Shipping",
    disc: "Free delivery on every order over $50 — no codes, no minimums. Shipped fast and tracked all the way to your door.",
  },
  {
    id: 2,
    img: img1,
    title: "100% REFUND",
    disc: "Changed your mind? Return any item within 30 days for a full, no-questions-asked refund.",
  },
  {
    id: 3,
    img: img3,
    title: "SUPPORT 24/7",
    disc: "Our team is on hand around the clock by live chat and email to help with orders, setup, and returns.",
  },
];

function Viewed({ products = [], loading = false, error = "" }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const toast = useToast();

  // "Most Viewed" = the catalog ordered by how often each product's detail page
  // has been opened (viewCount, bumped server-side on every visit). Before
  // anything has been viewed the counts are all 0, so this simply shows the
  // newest products (the API already returns them newest-first).
  const mostViewed = [...products]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, MAX_VIEWED_ITEMS);

  const handleAddToCart = (e, card) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      // Real integer products-table id (dbId), not the "db-<id>" routing id, so
      // cart identity and backend POSTs match the Store / ProductDetail pages.
      id: card.dbId ?? card.id,
      title: card.title,
      price: card.price,
      currency: card.currency,
      image: card.img,
      imagePath: card.img,
      category: card.category,
    }, 1);
    toast.success(`${card.title} added to cart!`);
  };

  const handleToggleWishlist = (e, card) => {
    e.preventDefault();
    e.stopPropagation();
    const backendId = card.dbId ?? card.id;
    const isInList = isInWishlist(backendId);
    toggleWishlist({
      id: backendId,
      title: card.title,
      price: card.price,
      currency: card.currency,
      // Wishlist.jsx renders `imagePath` (falling back to the `image` emoji), so
      // save both — same shape as this file's cart payload and StoreProductCard.
      image: card.img,
      imagePath: card.img,
      category: card.category,
      brand: card.brand,
    });
    toast.success(isInList ? "Removed from wishlist" : "Added to wishlist!");
  };

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36">
      {/* Perks row (static) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 py-6 sm:py-8 lg:py-10">
        {PERKS.map((item) => (
          <div
            className="text-center grid grid-cols-1 gap-2 px-2 sm:px-6 lg:px-16"
            key={item.id}
          >
            <img
              src={item.img}
              alt={`${item.title} - Special offer icon`}
              className="w-[50px] h-[55px] mb-4 mx-auto object-contain"
            />

            <Typography varient="h4" style="font-semibold text-base sm:text-lg">
              {item.title}
            </Typography>

            <Typography varient="p" style="text-[#22262A] font-normal py-3 sm:py-4 lg:py-6 text-sm sm:text-base">
              {item.disc}
            </Typography>
          </div>
        ))}
      </div>

      {/* Section heading */}
      <div>
        <Typography varient="h3" style="font-semibold text-xl sm:text-2xl lg:text-3xl">
          Most Viewed Products
        </Typography>
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-10">
          {Array.from({ length: MAX_VIEWED_ITEMS }).map((_, i) => (
            <div
              key={i}
              className="my-4 sm:my-6 h-[260px] sm:h-[300px] lg:h-[330px] animate-pulse rounded-md bg-[#F1F3F5]"
            />
          ))}
        </div>
      ) : error ? (
        <p className="my-10 text-center text-gray-500">
          Couldn’t load products right now.
        </p>
      ) : mostViewed.length === 0 ? (
        <p className="my-10 text-center text-gray-500">
          No products to show yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-10">
          {mostViewed.map((card) => {
            const liked = isInWishlist(card.dbId ?? card.id);
            return (
              <Link
                key={card.id}
                to={`/store/product/${card.id}`}
                className="group relative my-4 sm:my-6 h-[260px] sm:h-[300px] lg:h-[330px] w-full content-center px-3 sm:px-4 bg-[#F8F8F8] rounded-md hover:shadow-lg transition-all"
              >
                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleToggleWishlist(e, card)}
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                    aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    {liked ? (
                      <FaHeart className="text-red-500 text-sm" />
                    ) : (
                      <FaRegHeart className="text-gray-600 text-sm" />
                    )}
                  </button>
                  <button
                    onClick={(e) => handleAddToCart(e, card)}
                    className="w-8 h-8 bg-[#2196F3] text-white rounded-full flex items-center justify-center shadow-sm hover:bg-[#1a7fd1] transition-colors"
                    aria-label="Add to cart"
                  >
                    <IoCartOutline className="text-base" />
                  </button>
                </div>

                <img
                  src={card.img}
                  className="block mx-auto my-1 h-[100px] w-[100px] sm:h-[130px] sm:w-[130px] lg:h-[150px] lg:w-[150px] object-contain group-hover:scale-105 transition-transform"
                  alt={`${card.title} - ${card.category} product`}
                />

                <Typography varient="p" style="my-1 text-sm sm:text-base">
                  {card.category}
                </Typography>
                <Typography varient="p" style="font-semibold my-1 text-sm sm:text-base">
                  {card.title}
                </Typography>

                <div className="flex my-1 text-[#FFC107] text-sm sm:text-base">
                  <FaStar /> <FaStar /> <FaStar /> <FaStar /> <FaRegStarHalfStroke />
                </div>
                <Typography varient="p" style="text-[#2196F3] font-semibold text-sm sm:text-base">
                  {card.currency}
                  {card.price}
                </Typography>
                {card.isNew && (
                  <Typography
                    style="absolute top-2 left-2 rounded-[10px] px-2 bg-[#2196F3] text-white"
                    varient="small"
                  >
                    New
                  </Typography>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Viewed;
