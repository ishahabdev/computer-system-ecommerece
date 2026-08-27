import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import Typography from "../../../components/common/Typography";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useToast } from "../../../context/ToastContext";

const MAX_FLASH_ITEMS = 4;

// "2d 4h left" / "3h 12m left" / "8m left"; null once the deal has expired.
const formatCountdown = (endsAt, now) => {
  const ms = new Date(endsAt).getTime() - now;
  if (ms <= 0) return null;
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
};

// No `error` prop: on a load failure `products` is empty, so `deals` is empty and
// the whole (optional) section returns null below — same as an empty catalog.
const Flash = ({ products = [], loading = false }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const toast = useToast();

  // Re-evaluated once a minute so countdowns tick down and a deal drops off the
  // moment it expires, without a per-second re-render.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  // A flash deal = discounted AND (no end date, or the end date is still ahead).
  const deals = products
    .filter(
      (p) =>
        p.hasDeal &&
        (!p.saleEndsAt || new Date(p.saleEndsAt).getTime() > now),
    )
    .slice(0, MAX_FLASH_ITEMS);

  // Nothing on sale → drop the whole section (it's inherently optional). During
  // the initial load we keep it so the skeletons can show.
  if (!loading && deals.length === 0) return null;

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      // Real integer products-table id (dbId), not the "db-<id>" routing id, so
      // cart identity and backend POSTs match the Store / ProductDetail pages.
      id: product.dbId ?? product.id,
      title: product.title,
      // Charge the sale price — it's what the card advertises as the current price.
      price: product.salePrice,
      currency: product.currency,
      image: product.img,
      imagePath: product.img,
      category: product.category,
    }, 1);
    toast.success(`${product.title} added to cart!`);
  };

  const handleToggleWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const backendId = product.dbId ?? product.id;
    const isInList = isInWishlist(backendId);
    toggleWishlist({
      id: backendId,
      title: product.title,
      price: product.salePrice,
      currency: product.currency,
      // Wishlist.jsx renders `imagePath` (falling back to the `image` emoji), so
      // save both — same shape as this file's cart payload and StoreProductCard.
      image: product.img,
      imagePath: product.img,
      category: product.category,
      brand: product.brand
    });
    toast.success(isInList ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  return (
    <section className="w-full px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36">
      {/* Heading */}
      <Typography varient="h4" style="font-semibold text-lg sm:text-xl py-4 mt-4 sm:mt-6">
        Flash Sale on Products
      </Typography>

      {/* Top Product Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
          {Array.from({ length: MAX_FLASH_ITEMS }).map((_, i) => (
            <div
              key={i}
              className="h-[200px] sm:h-[220px] lg:h-[250px] animate-pulse rounded-md bg-[#F1F3F5]"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
          {deals.map((item) => {
            const liked = isInWishlist(item.dbId ?? item.id);
            const countdown = item.saleEndsAt
              ? formatCountdown(item.saleEndsAt, now)
              : null;
            return (
              <Link
                key={item.id}
                to={`/store/product/${item.id}`}
                className="group w-full max-w-full lg:max-w-[370px] h-[200px] sm:h-[220px] lg:h-[250px] rounded-md bg-[#F8F8F8] flex items-center justify-between overflow-hidden hover:shadow-lg transition-shadow relative"
              >
                {/* Discount badge */}
                <span className="absolute top-2 left-2 z-10 inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  -{item.discountPercent}%
                </span>

                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-2 z-10">
                  <button
                    type="button"
                    onClick={(e) => handleToggleWishlist(e, item)}
                    className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
                    aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    {liked ? (
                      <FaHeart size={14} className="text-red-500" />
                    ) : (
                      <FaRegHeart size={14} className="text-gray-600" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, item)}
                    className="flex items-center justify-center w-8 h-8 bg-[#2196F3] text-white rounded-full shadow-sm hover:bg-[#1a7fd1] transition-colors cursor-pointer"
                    aria-label="Add to cart"
                  >
                    <IoCartOutline size={16} />
                  </button>
                </div>

                {/* Left Content */}
                <div className="pl-4 sm:pl-5 flex flex-col justify-center min-w-[110px] sm:min-w-[130px]">
                  <Typography varient="h6" style="font-semibold mb-1 text-sm sm:text-base">
                    {item.title}
                  </Typography>

                  <div className="flex items-center gap-2">
                    <Typography varient="p" style="text-[#2196F3] font-semibold text-sm sm:text-base">
                      {item.currency}
                      {item.salePrice}
                    </Typography>

                    <Typography varient="p" style="text-gray-400 line-through text-sm sm:text-base">
                      {item.currency}
                      {item.price}
                    </Typography>
                  </div>

                  {/* Countdown, only when the deal has an end date */}
                  {countdown && (
                    <Typography varient="small" style="text-red-500 font-medium mt-1">
                      {countdown}
                    </Typography>
                  )}

                  {/* View Details */}
                  <div className="flex items-center gap-2 mt-3 cursor-pointer group-hover:text-[#2196F3] transition-colors">
                    <Typography varient="small" style="text-black group-hover:text-[#2196F3]">
                      View Details
                    </Typography>

                    <span className="text-xl leading-none">→</span>
                  </div>
                </div>

                {/* Product Image */}
                <div className="w-[110px] sm:w-[130px] lg:w-[155px] h-full flex items-center justify-center pr-2 sm:pr-3">
                  <img
                    src={item.img}
                    alt={`${item.title} - Flash sale computer product`}
                    className="max-w-full max-h-[110px] sm:max-h-[125px] lg:max-h-[145px] object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Bottom Banner — brand-neutral promo for the Laptops category */}
      <Link
        to="/store?category=Laptop"
        className="group mt-6 sm:mt-7 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden rounded-md bg-gradient-to-r from-[#2196F3] to-[#0d47a1] px-6 sm:px-10 py-8 sm:py-10 text-white"
      >
        <div className="text-center sm:text-left">
          <Typography varient="small" style="uppercase tracking-wide text-white/80">
            Laptops
          </Typography>
          <Typography varient="h3" style="font-bold text-2xl sm:text-3xl mt-1">
            Power that goes where you do
          </Typography>
          <Typography varient="p" style="text-white/90 mt-2 max-w-md">
            From ultralight everyday machines to high-performance rigs — explore the full lineup.
          </Typography>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#2196F3] whitespace-nowrap group-hover:bg-gray-100 transition-colors">
          Shop Laptops
          <span className="text-lg leading-none">→</span>
        </span>
      </Link>
    </section>
  );
};

export default Flash;