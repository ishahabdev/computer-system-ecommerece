import React from "react";
import Typography from "./common/Typography";
import { AiFillInstagram } from "react-icons/ai";
import { FaYoutube, FaFacebookF, FaTwitter } from "react-icons/fa";
import { menus } from "./constants/menus";
import { Link } from "react-router-dom";

const Footer = () => {
  let footerArr = ["About Us", "Information", "Privacy Policy", "Terms & Condition"];

  return (
    <div className="bg-[#F8F8F8]">

      <div className="mx-24 flex justify-between">

        {/* LEFT */}
        <div className="w-[30%]">
          <Typography style="font-semibold text-[#2196F3]" varient="h6">
            Store Name
          </Typography>

          <Typography varient="small">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          </Typography>
        </div>

        {/* LINKS */}
        <div className="flex gap-10">

          <div>
            <Typography style="font-semibold" varient="h6">
              Useful Links
            </Typography>

            <div className="flex flex-col gap-2">
              {menus?.slice(0, 4).map((menu) => (
                <Link
                  key={menu.id}   // ✅ FIXED
                  className="text-[14px]"
                  to={menu.pathName}
                >
                  {menu.pathValue}
                </Link>
              ))}
            </div>
          </div>

          {/* OFFERS */}
          <div>
            <Typography style="font-semibold" varient="h6">
              Our Offers
            </Typography>

            {footerArr.map((item, index) => (
              <div key={index}>   {/* ✅ FIXED */}
                <Typography varient="small">
                  {item}
                </Typography>
              </div>
            ))}
          </div>

        </div>

        {/* SUBSCRIBE */}
        <div>
          <Typography style="text-[#2196F3]" varient="p">
            Subscribe to our emails
          </Typography>

          <Typography style="font-semibold" varient="h3">
            For latest News & Updates
          </Typography>

          <div className="flex justify-center">
            <input
              type="text"
              className="border-2 w-56 rounded-sm"
              placeholder="Enter your Email"
            />

            <Typography
              style="inline-block rounded-sm w-26 text-[10px] mr-6"
              varient="small"
              btn="primary"
            >
              Subscribe
            </Typography>
          </div>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="flex justify-between pt-10 mx-24 pb-6">
        <Typography varient="small">
          © 2023 WQsoftwares Inc. All rights reserved.
        </Typography>

        <div className="flex text-[20px] gap-6">
          <AiFillInstagram />
          <FaYoutube />
          <FaFacebookF />
          <FaTwitter />
        </div>
      </div>

    </div>
  );
};

export default Footer;
