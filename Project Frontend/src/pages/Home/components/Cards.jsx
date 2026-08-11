import React from "react";
import { ProductDetails } from "../../../components/constants/constant";
import Typography from "../../../components/common/Typography";
import { FaStar } from "react-icons/fa";
import { FaRegStarHalfStroke } from "react-icons/fa6";

const ProductCard = ({
  product,
  imgSize = "w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] md:w-[150px] md:h-[150px]",
}) => (
  <div className="bg-[#F8F8F8] p-3 sm:p-4 relative">
    <Typography
      varient="h4"
      style="text-[#2196F3] font-semibold"
    >{`${product.currency}${product.price}`}</Typography>

    <div className={`mx-auto flex items-center justify-center ${imgSize}`}>
      <img
        src={product.img}
        className="max-w-full max-h-full object-contain"
        alt={product.title}
      />
    </div>

    <Typography varient="small">{product.category}</Typography>
    <Typography style="font-semibold" varient="p">
      {product.title}
    </Typography>
    <div className="flex text-[#FFC107] text-sm mt-1">
      <FaStar />
      <FaStar />
      <FaStar />
      <FaStar />
      <FaRegStarHalfStroke />
    </div>
  </div>
);

const Cards = () => {
  const [featured, top1, top2, bottom1, bottom2, bottom3] =
    ProductDetails || [];

  return (
    <div className="bg-white px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36">
      <Typography
        style="text-center flex justify-center mx-auto py-6 sm:py-8 md:py-10 font-semibold text-xl sm:text-2xl md:text-3xl"
        varient="h3"
      >
        Handpicked by our techies
      </Typography>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Big featured card, full height */}
        {featured && (
          <div className="bg-[#F8F8F8] p-4 relative w-full lg:w-[45%] xl:w-[700px] flex flex-col">
            <Typography
              varient="h4"
              style="text-[#2196F3] font-semibold"
            >{`${featured.currency}${featured.price}`}</Typography>

            <div className="flex-1 flex items-center justify-center py-4">
              <img
                src={featured.img}
                className="max-w-full max-h-[220px] sm:max-h-[260px] md:max-h-[300px] lg:max-h-[320px] object-contain"
                alt={featured.title}
              />
            </div>

            <Typography varient="small">{featured.category}</Typography>
            <Typography style="font-semibold" varient="p">
              {featured.title}
            </Typography>
            <div className="flex text-[#FFC107] text-sm mt-1">
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaRegStarHalfStroke />
            </div>
          </div>
        )}

        {/* Right side: top row (2 cards) + bottom row (3 cards) */}
        <div className="flex flex-col gap-6 flex-1">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {top1 && (
              <ProductCard
                product={top1}
                imgSize="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] md:w-[170px] md:h-[170px] lg:w-[180px] lg:h-[180px]"
              />
            )}
            {top2 && (
              <ProductCard
                product={top2}
                imgSize="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] md:w-[170px] md:h-[170px] lg:w-[180px] lg:h-[180px]"
              />
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {bottom1 && <ProductCard product={bottom1} />}
            {bottom2 && <ProductCard product={bottom2} />}
            {bottom3 && <ProductCard product={bottom3} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cards;