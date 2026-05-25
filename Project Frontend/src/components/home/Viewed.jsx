import React from "react";
import img1 from "../../assets/homePIc/homeview1.png";
import img2 from "../../assets/homePIc/homeview2.png";
import img3 from "../../assets/homePIc/homeview3.png";
import Typography from "./../common/Typography";
import img4 from "../../assets/homePIc/home5.png";
import img5 from "../../assets/homePIc/home4.png";
import img6 from "../../assets/homePIc/home3.png";
import img7 from "../../assets/homePIc/home2.png";
import img8 from "../../assets/homePIc/homeview5.png";
import img9 from "../../assets/homePIc/homeview7.png";
import img10 from "../../assets/homePIc/homeview4.png";
import img11 from "../../assets/homePIc/homeview6.png";
import { FaStar } from "react-icons/fa";
import { FaRegStarHalfStroke } from "react-icons/fa6";
function Viewed() {
    let icon = <FaStar />;
  let viewArr = [
    {
      id: 1,
      img: img1,
      title: "FREE SHIPPING",
      disc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor minim veniam, quis nostrud reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur",
    },
    {
      id: 2,
      img: img2,
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
    {
      id: 1,
      image: img9,
      category: "AirBuds",
      title: "G502 wireless",
      price: 1800,
      currency: "$",
      pic : icon,
      tag : "New"
    },
    {
      id: 2,
      image: img5,
      category: "Mouse",
      title: "Smooth cursor",
      price: 200,
      currency: "$",
      pic : icon,
      tag : "New"
    },
    {
      id: 3,
      image: img4,
      category: "Keyboard",
      title: "Smoot Buttons",
      price: 300,
      currency: "$",
      pic : icon,
      tag : "New"
    },
    {
      id: 4,
      image: img10,
      category: "AirBuds",
      title: " Long battery",
      price: 99,
      currency: "$",
      pic : icon,
      tag : "New"
    },
    {
      id: 5,
      image: img8,
      category: "Laptop",
      title: "High speed",
      price: 999,
      currency: "$",
      pic : icon,
      tag : "New"
    },

    {
      id: 6,
      image: img11,
      category: "Speaker",
      title: " wireless Loud",
      price: 250,
      currency: "$",
      pic : icon,
      tag : "New"
    },
    {
      id: 7,
      image: img5,
      category: "Mouse",
      title: "Fast clicks",
      price: 150,
      currency: "$",
      pic : icon,
      tag : "New"
    },
    {
      id: 8,
      image: img6,
      category: "Laptop",
      title: "  Slim design ",
      price: 850,
      currency: "$",
      pic : icon,
      tag : "New"
    },
  ];
  return (
    <div>
      <div className="flex justify-between ml-32 m-20 gap-10 w-[1000px]">
        {viewArr?.map((item) => {
          return (
            <div className="  text-center  w-[330px]">
              <img
                src={item.img}
                alt="image not found"
                className="w-[45.84px] h-[52.08px] mb-4 mx-auto "
              />
              <Typography varient="h4" style="font-semibold" key={item.id}>
                {item.title}
              </Typography>
              <Typography varient="small" >
                {" "}
                {item.disc}
              </Typography>
            </div>
          );
        })}
      </div>
      <div>
        <Typography varient="h3" style="font-semibold mx-28">Most Viewed Products</Typography>
      </div>
      <div className="grid grid-cols-4  ml-28 mx-20">
        {viedCards?.map((card) => {
          return (
            <div className="relative mx-2 my-6 h-[250px] w-[230px] content-center px-4 bg-[#F8F8F8]">
              <img src={card.image}className="block mx-auto my-1  h-[120px] w-[120px] object-contain"alt="" />

              <Typography varient="p" style="my-1 " key={card.id}>
                {card.category}
              </Typography>
              <Typography varient="p" style="font-semibold my-1 ">
                {card.title}
              </Typography>
              
              <div className="flex my-1  text-[#FFC107]"> {card.pic} {card.pic} {card.pic} {card.pic} <FaRegStarHalfStroke /></div>
              <Typography
                varient="p"
                style="text-[#2196F3] font-semibold"
               
              >
      
                {card.price} {card.currency}
              </Typography>
                      <Typography style="absolute top-2 left-2 rounded-[10px] px-2  bg-[#2196F3] text-white" varient="small" > {card.tag}</Typography>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Viewed;
