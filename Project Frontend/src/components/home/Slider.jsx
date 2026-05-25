import React from "react";
import Typography from "./../common/Typography";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import img1 from "../../assets/homePIc/home1.png";
import img2 from "../../assets/homePIc/home2.png";
import img3 from "../../assets/homePIc/home3.png";

const data = [
  {
    img: img1,
    small: "Hot Sale",
    title: "Gaming PC Complete Setup",
  },
  {
    img: img2,
    small: "New Arrival",
    title: "High Performance Laptop",
  },
  {
    img: img3,
    small: "Best Deal",
    title: "Office PC Bundle",
  },

];

const Slider = () => {
  return (
    <div className="bg-[#F8F8F8] mt-10">

      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        spaceBetween={50}
        slidesPerView={1}   
        navigation
        pagination={{ clickable: true }}
      >

        {data.map((item, index) => (
          <SwiperSlide key={index}>
            
            <div className="flex items-center justify-between px-20 py-10">

           
              <div className="max-w-lg">
                <Typography variant="small">
                  {item.small}
                </Typography>

                <Typography variant="h1" style="font-bold text-4xl">
                  {item.title}
                </Typography>

                <button className="mt-6 px-6 py-2 bg-black text-white rounded">
                  Explore
                </button>
              </div>

              {/* IMAGE SIDE */}
              <div>
                <img
                  src={item.img}
                  alt="slider"
                  className="w-[500px] h-[350px] object-contain"
                />
              </div>

            </div>

          </SwiperSlide>
        ))}

      </Swiper>

    </div>
  );
};

export default Slider;