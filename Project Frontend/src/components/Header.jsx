import { Link } from 'react-router-dom'
import { menus } from '../assets/constants/menus'
import Typography from './common/Typography'
import { FaRegHeart } from "react-icons/fa";
import { BsTruck } from "react-icons/bs";
import { IoMdSearch } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import { FaRegUserCircle } from "react-icons/fa";
import { useState } from 'react'

const Header = () => {

  const [display, setDisplay] = useState(false); // ✅ FIXED

  const language = ["Eng","Urdu","Jap","Chinese"]
  const currency = ["USD","PKR","YUAN","INR"]
  const searchArr = ["All Category","Pc","Laptop","Mouse"]

  return (
    <div>

      {/* TOP BAR */}
      <div className='flex justify-between px-10'>

        <div className='flex ml-20'>

          <select className='w-12'>
            {language.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select className='w-12 mx-10'>
            {currency.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>

        </div>

        <div className='flex px-10 gap-4'>

          <div className='flex gap-1'>
            <BsTruck className='m-1' />
            <Typography varient="small">Track Order</Typography>
          </div>

          <div className='flex gap-1'>

            <FaRegHeart
              onClick={() => setDisplay(!display)}
              className={`m-1 cursor-pointer ${display ? "text-red-500" : ""}`}
            />

            <Typography varient="small">Wishlist</Typography>

          </div>

        </div>

      </div>

      {/* SEARCH BAR */}
      <div className='flex justify-between p-6'>

        <div className='px-20 font-black text-[#2196F3]'>
          <Typography varient="h3">Logo Here</Typography>
        </div>

        <div className='flex'>

          <select className='w-24 mx-4 text-[14px] bg-[#F8F8F8]'>
            {searchArr.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            className='rounded-sm border px-2'
            type="text"
            placeholder='Search Here'
          />

          <div className='bg-[#2196F3] p-2 text-white rounded-sm'>
            <IoMdSearch />
          </div>

        </div>

        <div className='flex px-16 gap-4 text-[20px]'>
          <IoCartOutline />
          <FaRegUserCircle />
        </div>

      </div>

      {/* NAVBAR */}
      <div className='flex justify-evenly px-20 text-white bg-[#2196F3] p-4'>

        {menus.map((menu) => (
          <Link
            key={menu.id}   // ✅ FIXED
            to={menu.pathName}
          >
            {menu.pathValue}
          </Link>
        ))}

      </div>

    </div>
  )
}

export default Header