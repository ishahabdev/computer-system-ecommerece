import React from "react";
import { ProductDetails } from "../../../components/constants/constant";
import Typography from "../../../components/common/Typography";
import { FaStar } from "react-icons/fa";
import { FaRegStarHalfStroke } from "react-icons/fa6";

const Cards = () => {
  return (
    <div>
      <Typography style="text-center font-semibold pt-10" varient="h4">
        Handpicked by our techies
      </Typography>
      <div className="grid grid-cols-3 gap-6 mx-24 m-10 ml-32">
        {ProductDetails?.map((product) => {
          return (
            <div
              key={product.id}
              className="bg-[#F8F8F8]  p-4 w-[250px] relative"
            >
              <div className="w-[150px] mx-auto p-2 h-[150px]">
                <img
                  src={product.img}
                  className="mx-auto"
                  alt={product.title}
                />
              </div>
              <Typography varient="small">{product.category}</Typography>
              <Typography style="font-semibold"varient="p">{product.title}</Typography>
              <Typography
                varient="h4"
                style="text-[#2196F3] font-semibold absolute top-0 left-2"
              >{`${product.currency} ${product.price}`}</Typography>
              <div className="flex text-[#FFC107]">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaRegStarHalfStroke />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Cards;
