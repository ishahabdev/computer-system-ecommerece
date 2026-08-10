import React from "react";
import Typography from "../../../components/common/Typography";
import Customimg from "../../../assets/homePIc/homeCustom1.png";

function Custom() {
  return (
    <div className="bg-[#2196F3] w-full h-[500px] flex justify-between">
      <div className="p-10 m-10">
        <Typography varient="h2" style="w-[500px] font-bold text-white p-10">Build your Customs Pc NOW</Typography>
        <Typography varient="small" btn="white" style="inline-block mx-10">
          View Details
        </Typography>
      </div>
      <div className="mr-36">
        <img className="w-[558px] h-[395px] my-10 " src={Customimg} alt="not" />
      </div>
    </div>
  );
}

export default Custom;
