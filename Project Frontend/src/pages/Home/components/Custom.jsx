import React from "react";
import Typography from "../../../components/common/Typography";
import Customimg from "../../../assets/homePIc/homeCustom1.webp";

function Custom() {
  return (
    <div className="bg-[#2196F3] w-full h-auto md:h-[400px] lg:h-[500px] flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 px-6 sm:px-8 md:px-0">
      <div className="p-4 sm:p-6 md:p-10 md:m-10 text-center md:text-left order-2 md:order-1">
        <Typography
          varient="h2"
          style="w-full max-w-[320px] sm:max-w-[420px] md:max-w-[500px] mx-auto md:mx-0 font-bold text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl p-0 md:p-10 md:pl-0"
        >
          Build your Customs Pc NOW
        </Typography>
        <Typography varient="small" btn="white" style="inline-block mt-4 md:mt-0 md:mx-10">
          View Details
        </Typography>
      </div>
      <div className="md:mr-16 lg:mr-36 order-1 md:order-2 w-full flex justify-center md:w-auto">
        <img
          className="w-full max-w-[280px] sm:max-w-[380px] md:max-w-[460px] lg:w-[558px] lg:max-w-none h-auto md:h-[300px] lg:h-[395px] my-4 md:my-10 object-contain"
          src={Customimg}
          alt="Build your custom gaming PC - Computer system configuration service"
        />
      </div>
    </div>
  );
}

export default Custom;