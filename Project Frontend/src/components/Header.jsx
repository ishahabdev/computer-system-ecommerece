import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaRegHeart, FaRegUserCircle, FaBars, FaTimes, FaHeart } from "react-icons/fa";
import { BsTruck } from "react-icons/bs";
import { IoMdSearch } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import { IoChevronDown } from "react-icons/io5";
import CartDropdown from "./CartDropdown";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const menus = [
  { id: 1, pathName: "/", pathValue: "Home" },
  { id: 2, pathName: "/store", pathValue: "Store" },
  { id: 3, pathName: "/store?category=Mouses", pathValue: "Mouse" },
  { id: 4, pathName: "/store?category=Keyboards", pathValue: "Keyboard" },
  { id: 5, pathName: "/accessories", pathValue: "Accessories" },
  { id: 6, pathName: "/about", pathValue: "About Us" },
  { id: 7, pathName: "/contact", pathValue: "Contact Us" },
];

const language = ["EN", "UR", "JP", "ZH"];
const currency = ["USD", "PKR", "YUAN", "INR"];

const Header = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
  const { cartItems } = useCart();
  const { wishlistItems, toggleWishlist } = useWishlist();

  const handleCartIconClick = () => {
    setCartDropdownOpen(!cartDropdownOpen);
  };

  const handleCartDropdownClose = () => {
    setCartDropdownOpen(false);
  };

  return (
    <header className="bg-white w-full shadow-sm" role="banner">
      {/* TOP BAR */}
      <div className="hidden md:flex justify-between items-center px-4 lg:px-10 xl:px-20 py-2 text-sm">
        <div className="flex gap-4 lg:gap-8 items-center">
          <div className="flex items-center gap-1 text-gray-700">
            <label htmlFor="language-select" className="sr-only">Select Language</label>
            <select id="language-select" className="bg-transparent focus:outline-none cursor-pointer" defaultValue="EN">
              {language.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1 text-gray-700">
            <label htmlFor="currency-select" className="sr-only">Select Currency</label>
            <select id="currency-select" className="bg-transparent focus:outline-none cursor-pointer" defaultValue="USD">
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
          <Link
            to="/wishlist"
            className="flex items-center gap-1.5 text-gray-700 hover:text-red-500 transition-colors"
            title="View your wishlist"
          >
            {wishlistItems.length > 0 ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart />
            )}
            <span>Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}</span>
          </Link>
        </div>
      </div>

      {/* MAIN ROW */}
      <div className="flex justify-between items-center gap-3 px-4 lg:px-10 xl:px-20 py-4 md:py-6">
        <button
          className="md:hidden text-gray-800 text-2xl"
          onClick={() => setNavOpen(!navOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={navOpen}
        >
          {navOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className="shrink-0">
          <Link to="/" className="font-black text-[#2196F3] text-xl sm:text-2xl lg:text-3xl hover:opacity-80 transition-opacity" title="Go to homepage">
            LOGO HERE
          </Link>
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
              placeholder="Search products, computer systems..."
              aria-label="Search products"
            />
            <button className="bg-[#2196F3] text-white px-4 sm:px-5 py-2.5 shrink-0 hover:bg-[#1a7fd1] transition-all duration-200 rounded-r-md" title="Search">
              <IoMdSearch className="text-lg" />
              <span className="sr-only">Search</span>
            </button>
          </div>
        </div>

        <div className="flex gap-3 sm:gap-6 items-center text-gray-800 text-xl sm:text-2xl lg:text-[26px] relative">
          <button
            onClick={handleCartIconClick}
            title="Toggle shopping cart dropdown"
            aria-label="Shopping cart"
            aria-expanded={cartDropdownOpen}
            aria-haspopup="dialog"
            className="relative hover:text-[#007BFF] transition-colors"
          >
            <IoCartOutline className="cursor-pointer" />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </button>
          <CartDropdown
            isOpen={cartDropdownOpen}
            onClose={handleCartDropdownClose}
          />
          <Link to="/dashboard" title="View user account" aria-label="User account">
            <FaRegUserCircle className="cursor-pointer hover:text-[#007BFF] transition-colors" />
          </Link>
        </div>
      </div>

      {/* Mobile search */}
      <div className="sm:hidden px-4 pb-4">
        <div className="flex items-center w-full bg-white border border-gray-200 rounded-md overflow-hidden">
          <input
            className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none"
            type="text"
            placeholder="Search..."
            aria-label="Search products"
          />
          <button className="bg-[#2196F3] text-white px-4 py-2.5 shrink-0 hover:bg-[#1a7fd1] transition-all duration-200 rounded-r-md" title="Search">
            <IoMdSearch className="text-lg" />
            <span className="sr-only">Search</span>
          </button>
        </div>
      </div>

      {/* NAVBAR - desktop */}
      <nav className="hidden md:flex justify-evenly px-4 lg:px-20 text-white bg-[#2196F3] p-4" role="navigation" aria-label="Main navigation">
        {menus.map((menu) => (
          <NavLink
            key={menu.id}
            to={menu.pathName}
            end={menu.pathName === "/"}
            className={({ isActive }) =>
              `relative hover:opacity-80 text-sm lg:text-base pb-2 transition-opacity ${
                isActive ? "font-semibold" : ""
              }`
            }
            title={`Go to ${menu.pathValue}`}
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
        <nav className="md:hidden flex flex-col text-white bg-[#2196F3] px-4 py-2" role="navigation" aria-label="Mobile navigation">
          {menus.map((menu) => (
            <NavLink
              key={menu.id}
              to={menu.pathName}
              end={menu.pathName === "/"}
              className="relative flex items-center justify-between py-2 border-b border-white/20 last:border-none hover:opacity-80 transition-opacity"
              onClick={() => setNavOpen(false)}
              title={`Go to ${menu.pathValue}`}
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
