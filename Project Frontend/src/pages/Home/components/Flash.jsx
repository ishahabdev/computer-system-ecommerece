import React from "react";
import img1 from "../../../assets/homePIc/homeflash1.png";
import img2 from "../../../assets/homePIc/homeflash2.png";
import img3 from "../../../assets/homePIc/homeflash3.png";
import img4 from "../../../assets/homePIc/homeflash4.png";
import Typography from "../../../components/common/Typography";

const Flash = () => {
  const products = [
    {
      id: 1,
      title: "Product Name",
      price: 200,
      sale: 400,
      currency: "$",
      image: img1,
    },
    {
      id: 2,
      title: "Product Name",
      price: 200,
      sale: 400,
      currency: "$",
      image: img2,
    },
    {
      id: 3,
      title: "Product Name",
      price: 200,
      sale: 400,
      currency: "$",
      image: img3,
    },
    {
      id: 4,
      title: "Product Name",
      price: 250,
      sale: 500,
      currency: "$",
      image: img2,
    },
  ];

  return (
    <section className="w-full px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36">
      {/* Heading */}
      <Typography varient="h4" style="font-semibold text-lg sm:text-xl py-4 mt-4 sm:mt-6">
        Flash Sale on Products
      </Typography>

      {/* Top Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
        {products.map((item) => (
          <div
            key={item.id}
            className="w-full max-w-full lg:max-w-[370px] h-[200px] sm:h-[220px] lg:h-[250px] rounded-md bg-[#F8F8F8] flex items-center justify-between overflow-hidden"
          >
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
              <div className="flex items-center gap-2 mt-3 cursor-pointer">
                <Typography varient="small" style="text-black">
                  View Details
                </Typography>

                <span className="text-xl leading-none">→</span>
              </div>
            </div>

            {/* Product Image */}
            <div className="w-[110px] sm:w-[130px] lg:w-[155px] h-full flex items-center justify-center pr-2 sm:pr-3">
              <img
                src={item.image}
                alt={item.title}
                className="max-w-full max-h-[110px] sm:max-h-[125px] lg:max-h-[145px] object-contain"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Banner */}
      <div className="w-full mt-6 sm:mt-7 rounded-md bg-[#F8F8F8] overflow-hidden">
        <img
          src={img4}
          alt="MacBook Pro"
          className="w-full h-auto object-cover"
        />
      </div>
    </section>
  );
};

export default Flash;