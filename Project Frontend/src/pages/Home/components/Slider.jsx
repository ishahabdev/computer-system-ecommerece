import React, { useState } from "react";
import Typography from "../../../components/common/Typography";
import { Navigation, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import img1 from "../../../assets/homePIc/home1.png";
import img2 from "../../../assets/homePIc/home2.png";
import img3 from "../../../assets/homePIc/home3.png";
import arrowIcon from "../../../assets/icons/arrowIcon.svg";

const data = [
  {
    id: 1,
    img: img1,
    small: "Hot Sale",
    titleLine1: "Gaming Pc",
    titleLine2: "Complete Setup",
  },
  {
    id: 2,
    img: img2,
    small: "New Arrival",
    titleLine1: "High Performance",
    titleLine2: "Laptop",
  },
  {
    id: 3,
    img: img3,
    small: "Best Deal",
    titleLine1: "Office Pc",
    titleLine2: "Bundle",
  },
];

const Slider = () => {
  const [prevEl, setPrevEl] = useState(null);
  const [nextEl, setNextEl] = useState(null);

  return (
    <div className="bg-[#F8F8F8] border-b border-gray-100 relative">
      <Swiper
        modules={[Navigation, A11y]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          prevEl,
          nextEl,
        }}
        loop
      >
        {data.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8 md:gap-4 px-6 sm:px-10 md:px-16 lg:px-28 xl:px-40 py-10 sm:py-12 md:py-14 lg:py-16 text-center md:text-left">
              {/* TEXT SIDE */}
              <div className="max-w-xl order-2 md:order-1">
                <Typography varient="p" style="text[#000000]">
                  {item.small}
                </Typography>

                <Typography
                  varient="h1"
                  style="font-proxima font-bold py-4 pb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                >
                  <span className="block leading-tight">{item.titleLine1}</span>
                  <span className="block mt-2 leading-tight">
                    {item.titleLine2}
                  </span>
                </Typography>

                <Typography btn="primary" size="xl">
                  Explore
                </Typography>
              </div>

              {/* IMAGE SIDE */}
              <div className="order-1 md:order-2 w-full md:w-auto flex justify-center">
                <img
                  src={item.img}
                  alt={`${item.titleLine1} ${item.titleLine2}`}
                  className="w-full max-w-[260px] sm:max-w-[360px] md:max-w-[420px] lg:max-w-[560px] xl:max-w-[700px] h-auto md:h-[300px] lg:h-[380px] xl:h-[450px] object-contain"
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Previous button */}
      <button
        ref={setPrevEl}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-2 md:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-10 items-center justify-center"
      >
        <img
          src={arrowIcon}
          alt="Previous"
          className="w-8 h-5 sm:w-10 sm:h-6 lg:w-14 lg:h-8"
        />
      </button>

      {/* Next button */}
      <button
        ref={setNextEl}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-2 md:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-10 items-center justify-center"
      >
        <img
          src={arrowIcon}
          alt="Next"
          className="w-8 h-5 sm:w-10 sm:h-6 lg:w-14 lg:h-8 rotate-180"
        />
      </button>

      {/* Default Swiper arrows hidden */}
      <style>{`
        .swiper-button-next,
        .swiper-button-prev {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Slider;
