import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaRegHeart, FaRegUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { BsTruck } from "react-icons/bs";
import { IoMdSearch } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import { IoChevronDown } from "react-icons/io5";

const menus = [
  { id: 1, pathName: "/", pathValue: "Home" },
  { id: 2, pathName: "/store", pathValue: "Store" },
  { id: 3, pathName: "/mouse", pathValue: "Mouse" },
  { id: 4, pathName: "/keyboard", pathValue: "Keyboard" },
  { id: 5, pathName: "/accessories", pathValue: "Accessories" },
  { id: 6, pathName: "/about-us", pathValue: "About Us" },
  { id: 7, pathName: "/contact-us", pathValue: "Contact Us" },
];

const language = ["EN", "UR", "JP", "ZH"];
const currency = ["USD", "PKR", "YUAN", "INR"];

const Header = () => {
  const [wishlisted, setWishlisted] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  return (
    <header className="bg-white w-full">
      {/* TOP BAR */}
      <div className="hidden md:flex justify-between items-center px-4 lg:px-10 xl:px-20 py-2 text-sm">
        <div className="flex gap-4 lg:gap-8 items-center">
          <div className="flex items-center gap-1 text-gray-700">
            <select className="bg-transparent focus:outline-none cursor-pointer" defaultValue="EN">
              {language.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1 text-gray-700">
            <select className="bg-transparent focus:outline-none cursor-pointer" defaultValue="USD">
              {currency.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-4 lg:gap-8 items-center">
          <div className="flex items-center gap-1.5 text-gray-700">
            <BsTruck />
            <span>Track order</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-700">
            <FaRegHeart
              onClick={() => setWishlisted(!wishlisted)}
              className={`cursor-pointer ${wishlisted ? "text-red-500" : ""}`}
            />
            <span>Wishlist</span>
          </div>
        </div>
      </div>

      {/* MAIN ROW */}
      <div className="flex justify-between items-center gap-3 px-4 lg:px-10 xl:px-20 py-4 md:py-6">
        <button
          className="md:hidden text-gray-800 text-2xl"
          onClick={() => setNavOpen(!navOpen)}
          aria-label="Toggle menu"
        >
          {navOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className="shrink-0">
          <h3 className="font-black text-[#007BFF] text-xl sm:text-2xl lg:text-3xl">
            LOGO HERE
          </h3>
        </div>

        <div className="hidden sm:flex justify-center flex-1">
          <div className="flex items-center w-full max-w-xl bg-white border border-gray-200 rounded-md overflow-hidden">
            <div className="hidden lg:flex items-center gap-1 px-4 text-gray-700 text-sm cursor-pointer whitespace-nowrap border-r border-gray-200">
              <span>All Categories</span>
              <IoChevronDown className="text-gray-500" />
            </div>
            <input
              className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none"
              type="text"
              placeholder="Search..."
            />
            <button className="bg-[#007BFF] text-white px-4 sm:px-5 py-2.5 shrink-0" aria-label="Search">
              <IoMdSearch className="text-lg" />
            </button>
          </div>
        </div>

        <div className="flex gap-3 sm:gap-6 items-center text-gray-800 text-xl sm:text-2xl lg:text-[26px]">
          <IoCartOutline className="cursor-pointer" />
          <FaRegUserCircle className="cursor-pointer" />
        </div>
      </div>

      {/* Mobile search */}
      <div className="sm:hidden px-4 pb-4">
        <div className="flex items-center w-full bg-white border border-gray-200 rounded-md overflow-hidden">
          <input
            className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none"
            type="text"
            placeholder="Search..."
          />
          <button className="bg-[#007BFF] text-white px-4 py-2.5 shrink-0" aria-label="Search">
            <IoMdSearch className="text-lg" />
          </button>
        </div>
      </div>

      {/* NAVBAR - desktop */}
      <nav className="hidden md:flex justify-evenly px-4 lg:px-20 text-white bg-[#2196F3] p-4">
        {menus.map((menu) => (
          <NavLink
            key={menu.id}
            to={menu.pathName}
            end={menu.pathName === "/"}
            className={({ isActive }) =>
              `relative hover:opacity-80 text-sm lg:text-base pb-2 ${
                isActive ? "font-semibold" : ""
              }`
            }
          >
            {({ isActive }) => (
              <>
                {menu.pathValue}
                {isActive && (
                  <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2.5 h-1 bg-white rounded-full"></span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* NAVBAR - mobile dropdown */}
      {navOpen && (
        <nav className="md:hidden flex flex-col text-white bg-[#2196F3] px-4 py-2">
          {menus.map((menu) => (
            <NavLink
              key={menu.id}
              to={menu.pathName}
              end={menu.pathName === "/"}
              className="relative flex items-center justify-between py-2 border-b border-white/20 last:border-none"
              onClick={() => setNavOpen(false)}
            >
              {({ isActive }) => (
                <>
                  {menu.pathValue}
                  {isActive && (
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;