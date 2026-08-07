import { Link } from 'react-router-dom'
import { menus } from '../assets/constants/menus'
import Typography from './common/Typography'
import { FaRegHeart, FaCaretDown } from "react-icons/fa";
import { BsTruck } from "react-icons/bs";
import { IoMdSearch } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import { FaRegUserCircle } from "react-icons/fa";
import { useState } from 'react'

const Header = () => {

  const [display, setDisplay] = useState(false);

  const language = ["EN", "UR", "JP", "ZH"]
  const currency = ["USD", "PKR", "YUAN", "INR"]

  return (
    <div className='bg-white'>

      {/* TOP BAR */}
      <div className='flex justify-between px-10 py-2 items-center'>

        {/* Language + Currency */}
        <div className='flex ml-20 gap-8 items-center'>

          <div className='flex items-center gap-1 text-gray-700 text-sm'>
            <select
              className='bg-transparent focus:outline-none cursor-pointer'
              defaultValue="EN"
            >
              {language.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <FaCaretDown className='text-gray-500 text-xs' />
          </div>

          <div className='flex items-center gap-1 text-gray-700 text-sm'>
            <select
              className='bg-transparent focus:outline-none cursor-pointer'
              defaultValue="USD"
            >
              {currency.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <FaCaretDown className='text-gray-500 text-xs' />
          </div>

        </div>

        {/* Track order + Wishlist */}
        <div className='flex px-10 gap-8 items-center'>

          <div className='flex items-center gap-1.5 text-gray-700 text-sm'>
            <BsTruck />
            <span>Track order</span>
          </div>

          <div className='flex items-center gap-1.5 text-gray-700 text-sm'>
            <FaRegHeart
              onClick={() => setDisplay(!display)}
              className={`cursor-pointer text-base ${display ? "text-red-500" : ""}`}
            />
            <span>Wishlist</span>
          </div>

        </div>

      </div>

      {/* MAIN ROW */}
      <div className='flex justify-between px-10 py-6 items-center'>

        {/* Logo */}
        <div className='ml-20'>
          <Typography varient="h3" style="font-black text-[#007BFF]">
            LOGO HERE
          </Typography>
        </div>

        {/* Search widget */}
        <div className='flex justify-center flex-1'>
          <div className='flex items-center w-full max-w-xl bg-[#F0F0F0] rounded-md overflow-hidden'>

            <div className='flex items-center gap-1 px-4 text-gray-700 text-sm cursor-pointer'>
              <span>All Categories</span>
              <FaCaretDown className='text-[#007BFF]' />
            </div>

            <input
              className='flex-1 bg-transparent px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none'
              type="text"
              placeholder='Search...'
            />

            <button className='bg-[#007BFF] text-white px-5 py-2.5'>
              <IoMdSearch className='text-lg' />
            </button>

          </div>
        </div>

        {/* Cart + User */}
        <div className='flex mr-20 gap-6 items-center text-gray-800 text-[26px]'>
          <IoCartOutline className='cursor-pointer' />
          <FaRegUserCircle className='cursor-pointer' />
        </div>

      </div>

      {/* NAVBAR */}
      <div className='flex justify-evenly px-20 text-white bg-[#007BFF] p-4'>

        {menus.map((menu) => (
          <Link
            key={menu.id}
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
