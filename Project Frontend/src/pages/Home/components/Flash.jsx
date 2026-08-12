import React from "react";
import { Link } from "react-router-dom";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import img1 from "../../../assets/homePIc/homeflash1.webp";
import img2 from "../../../assets/homePIc/homeflash2.webp";
import img3 from "../../../assets/homePIc/homeflash3.webp";
import img4 from "../../../assets/homePIc/homeflash4.webp";
import Typography from "../../../components/common/Typography";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useToast } from "../../../context/ToastContext";

const Flash = () => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const toast = useToast();

  const products = [
    {
      id: "flash-1",
      title: "Gaming Headset Pro",
      price: 200,
      sale: 400,
      currency: "$",
      image: img1,
      category: "Headset",
      brand: "TechGear"
    },
    {
      id: "flash-2",
      title: "Wireless Mouse Elite",
      price: 200,
      sale: 400,
      currency: "$",
      image: img2,
      category: "Mouse",
      brand: "ProGaming"
    },
    {
      id: "flash-3",
      title: "RGB Keyboard Mechanical",
      price: 200,
      sale: 400,
      currency: "$",
      image: img3,
      category: "Keyboard",
      brand: "MechKeys"
    },
    {
      id: "flash-4",
      title: "Gaming Monitor 144Hz",
      price: 250,
      sale: 500,
      currency: "$",
      image: img2,
      category: "Monitor",
      brand: "ViewPro"
    },
  ];

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      currency: product.currency,
      image: product.image,
      imagePath: product.image,
      category: product.category,
    }, 1);
    toast.success(`${product.title} added to cart!`);
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
        {products.map((item) => (
          <Link
            key={item.id}
            to={`/store/product/${item.id}`}
            className="group w-full max-w-full lg:max-w-[370px] h-[200px] sm:h-[220px] lg:h-[250px] rounded-md bg-[#F8F8F8] flex items-center justify-between overflow-hidden hover:shadow-lg transition-shadow relative"
          >
            {/* Action buttons */}
            <div className="absolute top-2 right-2 flex gap-2 z-10">
              <button
                onClick={(e) => handleToggleWishlist(e, item)}
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                aria-label={isInWishlist(item.id) ? "Remove from wishlist" : "Add to wishlist"}
              >
                {isInWishlist(item.id) ? (
                  <FaHeart className="text-red-500 text-sm" />
                ) : (
                  <FaRegHeart className="text-gray-600 text-sm" />
                )}
              </button>
              <button
                onClick={(e) => handleAddToCart(e, item)}
                className="w-8 h-8 bg-[#2196F3] text-white rounded-full flex items-center justify-center shadow-sm hover:bg-[#1a7fd1] transition-colors"
                aria-label="Add to cart"
              >
                <IoCartOutline className="text-base" />
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
                  {item.price}
                </Typography>

                <Typography varient="p" style="text-gray-400 line-through text-sm sm:text-base">
                  {item.currency}
                  {item.sale}
                </Typography>
              </div>

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
                src={item.image}
                alt={`${item.title} - Flash sale computer product`}
                className="max-w-full max-h-[110px] sm:max-h-[125px] lg:max-h-[145px] object-contain group-hover:scale-105 transition-transform"
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom Banner */}
      <div className="w-full mt-6 sm:mt-7 rounded-md bg-[#F8F8F8] overflow-hidden">
        <img
          src={img4}
          alt="MacBook Pro and high-end computer equipment - Flash sale featured product"
          className="w-full h-auto object-cover"
        />
      </div>
    </section>
  );
};

export default Flash;