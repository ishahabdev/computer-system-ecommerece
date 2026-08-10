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

const Category = () => {
  // "match" batata hai ye button ProductDetails ke konsay "category" values ke sath match karega
  const categories = [
    { id: 1, title: "All", icon: <MdOutlineDevicesOther />, match: null },
    { id: 2, title: "Desktops", icon: <MdOutlineDesktopWindows />, match: ["Desktop"] },
    { id: 3, title: "Laptops", icon: <HiOutlineComputerDesktop />, match: ["Laptop"] },
    { id: 4, title: "Custom PCs", icon: <BsCpu />, match: ["Custom PC"] },
    { id: 5, title: "CPU", icon: <BsCpu />, match: ["CPU"] },
    { id: 6, title: "Accessories", icon: <LuHeadphones />, match: ["Keyboard", "Moniter", "Mouse"] },
  ];

  const [activeCategory, setActiveCategory] = useState(1);
  const [liked, setLiked] = useState({});

  const toggleLike = (id) => {
    setLiked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Active category object dhoond kar uske "match" list ke hisaab se products filter karein
  const activeCategoryObj = categories.find((c) => c.id === activeCategory);

  const filteredProducts =
    !activeCategoryObj?.match
      ? ProductDetails
      : ProductDetails.filter((card) => activeCategoryObj.match.includes(card.category));

  return (
    <div className="px-36 p-4 mt-10">
      <div className="flex items-center justify-between">
        <Typography style="font-semibold" varient="h3">
          Categories
        </Typography>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-8  mt-4  flex-wrap">
        {categories.map((item) => {
          const isActive = activeCategory === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveCategory(item.id)}
              className={`flex items-center gap-2 px-10 h-14 rounded-md border text-sm font-medium transition-colors ${
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

      {/* Product grid — ab filteredProducts use ho raha hai */}
      <div className="grid grid-cols-4 gap-6 w-full mt-10">
        {filteredProducts.map((card) => (
          <div
            key={card.id}
            className={`group rounded-lg p-3 relative transition-colors ${
              liked[card.id] ? "bg-[#EAF4FF]" : "bg-[#F8F8F8] hover:bg-[#EAF4FF]"
            }`}
          >
            {card.isNew && (
              <Typography
                varient="small"
                style="bg-[#2196F3] text-white px-2 rounded-[20px] absolute top-3 left-3 z-10"
              >
                New
              </Typography>
            )}

            <div
              className={`absolute top-3 right-3 flex flex-col gap-2 z-10 transition-opacity ${
                liked[card.id] ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              {liked[card.id] ? (
                <FaHeart
                  onClick={() => toggleLike(card.id)}
                  className="text-red-600 bg-white rounded-full text-[18px] p-1.5 w-8 h-8 cursor-pointer shadow-sm"
                />
              ) : (
                <FaRegHeart
                  onClick={() => toggleLike(card.id)}
                  className="text-[#2196F3] bg-white rounded-full text-[18px] p-1.5 w-8 h-8 cursor-pointer shadow-sm"
                />
              )}
              <IoCartOutline className="text-[#2196F3] bg-white rounded-full text-[18px] p-1.5 w-8 h-8 cursor-pointer shadow-sm" />
            </div>

            <div className="w-full h-[150px] flex items-center justify-center py-4">
              <img
                className="max-w-full max-h-full object-contain"
                src={card.img}
                alt={card.title}
              />
            </div>

            <Typography varient="small">{card.category}</Typography>
            <Typography varient="p" style="font-bold">
              {card.title}
            </Typography>

            <div className="flex text-[#FFC107] mt-2 text-sm">
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaRegStarHalfStroke />
            </div>

            <Typography varient="p" style="text-[#2196F3] font-semibold mt-1">
              {card.currency} {card.price}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Category;