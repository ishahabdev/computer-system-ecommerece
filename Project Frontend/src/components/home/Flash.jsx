import React from "react";
import img1 from "../../assets/homePIc/homeflash1.png";
import img2 from "../../assets/homePIc/homeflash2.png";
import img3 from "../../assets/homePIc/homeflash3.png";
import img4 from "../../assets/homePIc/homeflash4.png";
import Typography from './../common/Typography';

const Flash = () => {
  const produst = [
    {
      id: 1,
      title: "LCD",
      price: 200,
      sale:400,
      currency: "$",
      image: img1,
      check:"View Details"
    },
    {
      id: 2,
      title: "Laptop",
      price: 400,
      sale:600,
      currency: "$",
      image: img2,
      check:"View Details"
    },
    {
      id: 3,
      title: "Laptop",
      price: 200,
      sale:400,
      currency: "$",
      image: img3,
      check:"View Details"
    },
  ];
  return (
     <div>
        <Typography varient="h4" style="font-semibold p-4 mt-10 mx-24 ">Flash Sale on Products  </Typography>
   
      
        
        <div className="flex justify-between  mx-24" >
      
        {produst?.map((item) => {
            return (
                
                
             <div className="flex rounded-md w-[330px] h-[180px] bg-[#F8F8F8] " >
             <div className="m-4" >
              <Typography varient="h6" style="font-semibold" key={item.id}>{item.title} </Typography>
              <Typography varient="p" style="text-[#2196F3] font-semibold inline" > {item.price}{item.currency}</Typography> 
              <Typography varient="p" style="text-gray-500 px-1 line-through font-semibold inline pt-20">{item.currency}  {item.sale}</Typography>  <br />
                <Typography  varient="small" >{item.check} </Typography>
            </div>
            <div className="m-2">
                <img src={item.image} alt="" />
            </div>
           </div>
          
          );
        })}
      </div>
      <img src={img4} className="p-4 mx-20 w-[1110px]" alt="" />
       </div>
 
  );
};

export default Flash;
