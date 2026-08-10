import React from "react";
import Typography from "../../../components/common/Typography";
import { Navigation, Pagination, A11y, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import img1 from "../../../assets/homePIc/home1.png";
import img2 from "../../../assets/homePIc/home2.png";
import img3 from "../../../assets/homePIc/home3.png";

const data = [
  {
    id: 1,
    img: img1,
    small: "Hot Sale",
    title: "Gaming PC Complete Setup",
    desc: "Powerful performance with the latest components for the ultimate gaming experience.",
  },
  {
    id: 2,
    img: img2,
    small: "New Arrival",
    title: "High Performance Laptop",
    desc: "Slim, fast and ready for work or play — built for productivity on the go.",
  },
  {
    id: 3,
    img: img3,
    small: "Best Deal",
    title: "Office PC Bundle",
    desc: "Everything you need to get the job done, in one affordable bundle.",
  },
];

const Slider = () => {
  return (
    <div className="bg-white border-b border-gray-100">
      <Swiper
        modules={[Navigation, Pagination, A11y, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop
      >
        {data.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="flex items-center justify-between w-full px-40 py-16">
              {/* TEXT SIDE */}
              <div className="max-w-xl">
                <Typography
                  varient="small"
                  className="uppercase tracking-widest text-[#007BFF] font-semibold"
                >
                  {item.small}
                </Typography>

               <div className="w-46 bg-red-500">
                 <Typography
                  // varient="h1"
                  style="font-bold text-4xl text-gray-900 mt-3 leading-[55px] not-italic"
                >
                  {item.title}
                </Typography>

               </div>
                <Typography varient="p" className="text-gray-500 mt-4">
                  {item.desc}
                </Typography>

                <button className="mt-8 px-8 py-3 bg-[#007BFF] text-white font-semibold rounded-md hover:bg-[#0056b3] transition-colors">
                  Explore
                </button>
              </div>

              {/* IMAGE SIDE */}
              <div>
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-[500px] h-[350px] object-contain"
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* SWIPER THEME (MATCHES HEADER #007BFF) */}
      <style>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: #007BFF;
        }
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          color: #0056b3;
        }
        .swiper-pagination-bullet {
          background: #c9c9c9;
          opacity: 1;
          width: 30px;
          height: 4px;
          border-radius: 4px;
        }
        .swiper-pagination-bullet-active {
          background: #007BFF;
          width: 40px;
        }
        .swiper-pagination {
          bottom: 16px;
        }
      `}</style>
    </div>
  );
};

export default Slider;
