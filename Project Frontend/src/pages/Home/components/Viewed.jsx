import React from "react";
import { Link } from "react-router-dom";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import img1 from "../../../assets/homePIc/homeview1.webp";
import img2 from "../../../assets/homePIc/homeview2.webp";
import img3 from "../../../assets/homePIc/homeview3.webp";
import Typography from "../../../components/common/Typography";
import img4 from "../../../assets/homePIc/home5.webp";
import img5 from "../../../assets/homePIc/home4.webp";
import img6 from "../../../assets/homePIc/home3.webp";
import img8 from "../../../assets/homePIc/homeview5.webp";
import img9 from "../../../assets/homePIc/homeview7.webp";
import img10 from "../../../assets/homePIc/homeview4.webp";
import img11 from "../../../assets/homePIc/homeview6.webp";
import { FaStar } from "react-icons/fa";
import { FaRegStarHalfStroke } from "react-icons/fa6";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useToast } from "../../../context/ToastContext";

function Viewed() {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const toast = useToast();

  let icon = <FaStar />;
  let viewArr = [
    {
      id: 1,
      img: img2,
      title: "FREE Shipping",
      disc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor minim veniam, quis nostrud reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur",
    },
    {
      id: 2,
      img: img1,
      title: "100% REFUND",
      disc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor minim veniam, quis nostrud reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur",
    },
    {
      id: 3,
      img: img3,
      title: "SUPPORT 24/7",
      disc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor minim veniam, quis nostrud reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur",
    },
  ];

  let viedCards = [
    { id: "viewed-1", image: img9, category: "AirBuds", title: "G502 wireless", price: 1800, currency: "$", pic: icon, tag: "New", brand: "Logitech" },
    { id: "viewed-2", image: img5, category: "Mouse", title: "Smooth cursor", price: 200, currency: "$", pic: icon, tag: "New", brand: "Razer" },
    { id: "viewed-3", image: img4, category: "Keyboard", title: "Smoot Buttons", price: 300, currency: "$", pic: icon, tag: "New", brand: "Corsair" },
    { id: "viewed-4", image: img10, category: "AirBuds", title: " Long battery", price: 99, currency: "$", pic: icon, tag: "New", brand: "Sony" },
    { id: "viewed-5", image: img8, category: "Laptop", title: "High speed", price: 999, currency: "$", pic: icon, tag: "New", brand: "Dell" },
    { id: "viewed-6", image: img11, category: "Speaker", title: " wireless Loud", price: 250, currency: "$", pic: icon, tag: "New", brand: "JBL" },
    { id: "viewed-7", image: img5, category: "Mouse", title: "Fast clicks", price: 150, currency: "$", pic: icon, tag: "New", brand: "Logitech" },
    { id: "viewed-8", image: img6, category: "Laptop", title: "  Slim design ", price: 850, currency: "$", pic: icon, tag: "New", brand: "HP" },
  ];

  const handleAddToCart = (e, card) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: card.id,
      title: card.title,
      price: card.price,
      currency: card.currency,
      image: card.image,
      imagePath: card.image,
      category: card.category,
    }, 1);
    toast.success(`${card.title} added to cart!`);
  };

  const handleToggleWishlist = (e, card) => {
    e.preventDefault();
    e.stopPropagation();
    const isInList = isInWishlist(card.id);
    toggleWishlist({
      id: card.id,
      title: card.title,
      price: card.price,
      currency: card.currency,
      img: card.image,
      category: card.category,
      brand: card.brand
    });
    toast.success(isInList ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36">
      {/* Perks row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 py-6 sm:py-8 lg:py-10">
        {viewArr?.map((item) => (
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-10">
        {viedCards?.map((card) => {
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
                  aria-label={isInWishlist(card.id) ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isInWishlist(card.id) ? (
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
                src={card.image}
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
                {card.pic} {card.pic} {card.pic} {card.pic} <FaRegStarHalfStroke />
              </div>
              <Typography varient="p" style="text-[#2196F3] font-semibold text-sm sm:text-base">
                {card.price} {card.currency}
              </Typography>
              <Typography
                style="absolute top-2 left-2 rounded-[10px] px-2 bg-[#2196F3] text-white"
                varient="small"
              >
                {card.tag}
              </Typography>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Viewed;