import React, { useState } from "react";
import Typography from "../common/Typography";
import { ProductDetails } from "../../assets/constants/constant";
import { FaStar } from "react-icons/fa";
import { FaRegStarHalfStroke } from "react-icons/fa6";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";

const Category = () => {
  const product = [
    { id: 1, title: "All" },
    { id: 2, title: "HeadPhone" },
    { id: 3, title: "Desktops" },
    { id: 4, title: "Laptop" },
    { id: 5, title: "Mouse" },
    { id: 6, title: "Keyboard" },
  ];

  const [liked, setLiked] = useState({});

  const toggleLike = (id) => {
    setLiked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="px-16 p-4 mt-10">

   
      <Typography style="font-semibold" varient="h3">
        Category
      </Typography>

   
      <div className="flex gap-6 mt-4 flex-wrap">
        {product.map((item) => (
          <Typography
            key={item.id}
            varient="p"
            btn="primary"
            style="inline-block h-10"
          >
            {item.title}
          </Typography>
        ))}
      </div>


      <div className="grid grid-cols-3 gap-10 w-full mt-10">

        {ProductDetails.map((card) => (
          <div
            key={card.id}
            className="bg-[#F8F8F8] rounded-lg p-3 w-[230px] h-[270px] relative"
          >

          
            <div className="w-[200px] h-[150px] py-4 mx-auto">
              <img
                className="py-6 px-10 mx-auto"
                src={card.img}
                alt={card.title}
              />
            </div>

         
            <Typography varient="small">{card.category}</Typography>
            <Typography varient="p" style="font-bold">
              {card.title}
            </Typography>

           
            <div className="absolute top-2 right-3 flex flex-col gap-2">

          
              {liked[card.id] ? (
                <FaHeart
                  onClick={() => toggleLike(card.id)}
                  className="text-red-600 bg-white rounded-full text-[22px] p-1 cursor-pointer"
                />
              ) : (
                <FaRegHeart
                  onClick={() => toggleLike(card.id)}
                  className="text-[#2196F3] bg-white rounded-full text-[22px] p-1 cursor-pointer"
                />
              )}

            
              <IoCartOutline className="text-[#2196F3] bg-white rounded-full text-[30px] p-1 cursor-pointer" />
            </div>

          
            <Typography
              varient="small"
              style="bg-[#2196F3] text-white px-2 rounded-[20px] absolute top-4 left-4"
            >
              New
            </Typography>

            <div className="flex text-[#FFC107] mt-2">
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaRegStarHalfStroke />
            </div>

            
            <Typography varient="p" style="text-[#2196F3] font-semibold">
              {card.currency} {card.price}
            </Typography>

          </div>
        ))}

      </div>
    </div>
  );
};

export default Category;