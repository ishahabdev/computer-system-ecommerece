import React from "react";
import img1 from "../../../assets/homePIc/homeview1.png";
import img2 from "../../../assets/homePIc/homeview2.png";
import img3 from "../../../assets/homePIc/homeview3.png";
import Typography from "../../../components/common/Typography";
import img4 from "../../../assets/homePIc/home5.png";
import img5 from "../../../assets/homePIc/home4.png";
import img6 from "../../../assets/homePIc/home3.png";
import img8 from "../../../assets/homePIc/homeview5.png";
import img9 from "../../../assets/homePIc/homeview7.png";
import img10 from "../../../assets/homePIc/homeview4.png";
import img11 from "../../../assets/homePIc/homeview6.png";
import { FaStar } from "react-icons/fa";
import { FaRegStarHalfStroke } from "react-icons/fa6";

function Viewed() {
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
    { id: 1, image: img9, category: "AirBuds", title: "G502 wireless", price: 1800, currency: "$", pic: icon, tag: "New" },
    { id: 2, image: img5, category: "Mouse", title: "Smooth cursor", price: 200, currency: "$", pic: icon, tag: "New" },
    { id: 3, image: img4, category: "Keyboard", title: "Smoot Buttons", price: 300, currency: "$", pic: icon, tag: "New" },
    { id: 4, image: img10, category: "AirBuds", title: " Long battery", price: 99, currency: "$", pic: icon, tag: "New" },
    { id: 5, image: img8, category: "Laptop", title: "High speed", price: 999, currency: "$", pic: icon, tag: "New" },
    { id: 6, image: img11, category: "Speaker", title: " wireless Loud", price: 250, currency: "$", pic: icon, tag: "New" },
    { id: 7, image: img5, category: "Mouse", title: "Fast clicks", price: 150, currency: "$", pic: icon, tag: "New" },
    { id: 8, image: img6, category: "Laptop", title: "  Slim design ", price: 850, currency: "$", pic: icon, tag: "New" },
  ];

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
              alt={item.title}
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
            <div
              key={card.id}
              className="relative my-4 sm:my-6 h-[260px] sm:h-[300px] lg:h-[330px] w-full content-center px-3 sm:px-4 bg-[#F8F8F8]"
            >
              <img
                src={card.image}
                className="block mx-auto my-1 h-[100px] w-[100px] sm:h-[130px] sm:w-[130px] lg:h-[150px] lg:w-[150px] object-contain"
                alt=""
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Viewed;