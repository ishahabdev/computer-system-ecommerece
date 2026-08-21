import React, { useState } from "react";
import Typography from "../../../components/common/Typography";
import { ProductDetails } from "../../../components/constants/constant";
import { FaStar, FaRegHeart, FaHeart } from "react-icons/fa";
import { FaRegStarHalfStroke } from "react-icons/fa6";
import { IoCartOutline } from "react-icons/io5";
import {
  MdOutlineDevicesOther,
  MdOutlineDesktopWindows,
} from "react-icons/md";
import { HiOutlineComputerDesktop } from "react-icons/hi2";
import { BsCpu } from "react-icons/bs";
import { LuHeadphones } from "react-icons/lu";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useToast } from "../../../context/ToastContext";
import { Link } from "react-router-dom";

const Category = () => {
  const categories = [
    { id: 1, title: "All", icon: <MdOutlineDevicesOther />, match: null },
    { id: 2, title: "Desktops", icon: <MdOutlineDesktopWindows />, match: ["Desktop"] },
    { id: 3, title: "Laptops", icon: <HiOutlineComputerDesktop />, match: ["Laptop"] },
    { id: 4, title: "Custom PCs", icon: <BsCpu />, match: ["Custom PC"] },
    { id: 5, title: "CPU", icon: <BsCpu />, match: ["CPU"] },
    { id: 6, title: "Accessories", icon: <LuHeadphones />, match: ["Keyboard", "Moniter", "Mouse"] },
  ];

  const [activeCategory, setActiveCategory] = useState(1);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const toast = useToast();

  const activeCategoryObj = categories.find((c) => c.id === activeCategory);

  const filteredProducts = !activeCategoryObj?.match
    ? ProductDetails
    : ProductDetails.filter((card) => activeCategoryObj.match.includes(card.category));

  const handleToggleWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const isInList = isInWishlist(product.id);
    toggleWishlist({
      id: product.id,
      title: product.title,
      price: product.price,
      currency: product.currency,
      img: product.image,
      category: product.category,
      brand: product.brand,
    });
    toast.success(isInList ? "Removed from wishlist" : "Added to wishlist!");
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        currency: product.currency,
        image: product.image,
        imagePath: product.image,
        category: product.category,
      },
      1
    );
    toast.success(`${product.title} added to cart!`);
  };

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 p-4 mt-6 sm:mt-8 md:mt-10">
      <div className="flex items-center justify-between">
        <Typography style="font-semibold text-xl sm:text-2xl md:text-3xl" varient="h3">
          Categories
        </Typography>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-3 sm:gap-4 md:gap-6 lg:gap-8 mt-4 flex-wrap">
        {categories.map((item) => {
          const isActive = activeCategory === item.id;
          return (
            <button
              onClick={() => setActiveCategory(item.id)}
              key={item.id}
              className={`flex items-center gap-2 px-4 sm:px-6 md:px-8 lg:px-10 h-10 sm:h-12 lg:h-14 rounded-md border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-[#2196F3] text-white border-[#2196F3]"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.title}
            </button>
          );
        })}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full mt-6 sm:mt-8 md:mt-10">
        {filteredProducts.map((card) => {
          const liked = isInWishlist(card.id);
          return (
            <Link
              to={`/store/product/${card.id}`}
              key={card.id}
              className={`group rounded-lg p-2.5 sm:p-3 relative transition-colors block ${
                liked ? "bg-[#EAF4FF]" : "bg-[#F8F8F8] hover:bg-[#EAF4FF]"
              }`}
            >
              {card.isNew && (
                <Typography
                  varient="small"
                  style="bg-[#2196F3] text-white px-2 rounded-[20px] absolute top-2 left-2 sm:top-3 sm:left-3 z-10"
                >
                  New
                </Typography>
              )}

              <div
                className={`absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 sm:gap-2 z-10 transition-opacity ${
                  liked ? "opacity-100" : "opacity-0 group-hover:opacity-100 md:opacity-0"
                }`}
              >
                {/* Fixed-size flex-centered wrapper so icon never overflows/clips the circle */}
                <button
                  type="button"
                  onClick={(e) => handleToggleWishlist(e, card)}
                  className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-sm cursor-pointer"
                  aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {liked ? (
                    <FaHeart size={14} className="text-red-600" />
                  ) : (
                    <FaRegHeart size={14} className="text-[#2196F3]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => handleAddToCart(e, card)}
                  className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-sm cursor-pointer"
                  aria-label="Add to cart"
                >
                  <IoCartOutline size={16} className="text-[#2196F3]" />
                </button>
              </div>

              <div className="w-full h-[110px] sm:h-[130px] md:h-[150px] flex items-center justify-center py-3 sm:py-4">
                <img
                  className="max-w-full max-h-full object-contain"
                  src={card.img}
                  alt={card.title}
                />
              </div>

              <Typography varient="small">{card.category}</Typography>
              <Typography varient="p" style="font-bold text-sm sm:text-base">
                {card.title}
              </Typography>

              <div className="flex text-[#FFC107] mt-2 text-xs sm:text-sm">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaRegStarHalfStroke />
              </div>

              <Typography varient="p" style="text-[#2196F3] font-semibold mt-1 text-sm sm:text-base">
                {card.currency} {card.price}
              </Typography>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Category;