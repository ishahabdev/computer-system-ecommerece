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
            <div className="flex items-center justify-between w-full px-40 py-16">
              {/* TEXT SIDE */}
              <div className="max-w-xl">
                <Typography varient="p" style="text[#000000]">
                  {item.small}
                </Typography>

                <Typography varient="h1" style="font-proxima font-bold pb-4">
                  {item.titleLine1}
                  <br />
                  {item.titleLine2}
                </Typography>

                <Typography btn="primary" size="xl">
                  Explore
                </Typography>
              </div>

              {/* IMAGE SIDE */}
              <div>
                <img
                  src={item.img}
                  alt={`${item.titleLine1} ${item.titleLine2}`}
                  className="w-[700px] h-[450px] object-contain"
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
        className="absolute left-8 top-1/2  -translate-y-1/2 z-10  flex items-center justify-center "
      >
        <img src={arrowIcon} alt="Previous" className="w-14 h-8" />

      </button>

      {/* Next button */}
      <button
        ref={setNextEl}
        aria-label="Next slide"
        className="absolute right-8 top-1/2 -translate-y-1/2 z-10 w-20 flex items-center justify-center "
      >
        <img src={arrowIcon} alt="Next" className="w-14 h-8 rotate-180" />
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