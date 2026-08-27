import { useState, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaRegHeart,
  FaRegUserCircle,
  FaBars,
  FaTimes,
  FaHeart,
} from "react-icons/fa";
import {
  BsTruck,
  BsMouse,
  BsKeyboard,
  BsHeadphones,
  BsPcDisplay,
  BsLaptop,
} from "react-icons/bs";
import { MdOutlineDevicesOther } from "react-icons/md";
import { IoMdSearch } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import { IoChevronDown } from "react-icons/io5";
import CartDropdown from "../features/cart/CartDropdown";
import ProfileDropdown from "../features/account/ProfileDropdown";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { PRODUCT_CATEGORIES } from "../../constants/categories";

// Store-dropdown icons, keyed by canonical category name. Icons live here (not in
// the shared PRODUCT_CATEGORIES constant) because they're JSX; a category with no
// entry falls back to a generic device icon, so adding a new category to
// PRODUCT_CATEGORIES needs no change here.
const CATEGORY_ICONS = {
  Mouse: <BsMouse />,
  Keyboard: <BsKeyboard />,
  Headphone: <BsHeadphones />,
  Desktop: <BsPcDisplay />,
  Laptop: <BsLaptop />,
};
const categoryIcon = (name) => CATEGORY_ICONS[name] || <MdOutlineDevicesOther />;

// Top-level nav = Home, Store, then the static pages. The Store item carries the
// shared PRODUCT_CATEGORIES as a dropdown (rendered below); every other item is a
// plain link. Adding a category is a one-line edit to PRODUCT_CATEGORIES — the
// navbar structure never changes.
const menus = [
  { id: 1, pathName: "/", pathValue: "Home" },
  { id: 2, pathName: "/store", pathValue: "Store", categories: PRODUCT_CATEGORIES },
  { id: 3, pathName: "/accessories", pathValue: "Accessories" },
  { id: 6, pathName: "/deals", pathValue: "Deals" },
  { id: 4, pathName: "/about", pathValue: "About Us" },
  { id: 5, pathName: "/contact", pathValue: "Contact Us" },
];

const language = ["EN", "UR", "JP", "ZH"];
// FIX: "YUAN" is a currency name, not an ISO 4217 code. The correct code is "CNY".
const currency = ["USD", "PKR", "CNY", "INR"];

// Search-bar category filter — the same five canonical categories the nav uses,
// plus an explicit "All Categories" option that clears the filter.
const searchCategories = ["All Categories", ...PRODUCT_CATEGORIES];

// Top-level active state: Home matches "/" exactly; Store lights up for the whole
// /store section (including ?category= views) so it stays highlighted while a
// category is open; every other item is a straight pathname match.
const isMenuActive = (menu, location) =>
  menu.pathName === "/"
    ? location.pathname === "/"
    : location.pathname === menu.pathName;

// A category inside the Store dropdown is active when we're on /store filtered by
// exactly that category.
const isCategoryActive = (category, location) =>
  location.pathname === "/store" &&
  new URLSearchParams(location.search).get("category") === category;

const Header = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileTriggerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("All Categories");
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [storeMenuOpen, setStoreMenuOpen] = useState(false);
  const [mobileStoreOpen, setMobileStoreOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("EN");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // FIX: toggleWishlist and logout were destructured but never used
  // (eslint no-unused-vars). Only pull out what this component reads.
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userName = typeof user?.name === "string" ? user.name.trim() : "";
  const userInitials =
    userName
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => name[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "U";

  // The cart and profile menus share the top-right corner, so opening one closes
  // the other rather than stacking two panels on top of each other.
  const handleCartIconClick = () => {
    setCartDropdownOpen((open) => !open);
    setProfileDropdownOpen(false);
  };

  const handleCartDropdownClose = () => {
    setCartDropdownOpen(false);
  };

  const handleProfileIconClick = () => {
    setProfileDropdownOpen((open) => !open);
    setCartDropdownOpen(false);
  };

  const handleProfileDropdownClose = () => {
    setProfileDropdownOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (searchCategory !== "All Categories") params.set("category", searchCategory);

    if (params.toString()) {
      navigate(`/store?${params.toString()}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="bg-white shadow-sm" role="banner">
      {/* TOP BAR */}
      <div className="hidden md:flex justify-between items-center px-4 lg:px-10 xl:px-20 py-2 text-sm">
        <div className="flex gap-4 lg:gap-8 items-center">
          <div className="flex items-center gap-1 text-gray-700">
            <label htmlFor="language-select" className="sr-only">
              Select Language
            </label>
            <select
              id="language-select"
              className="bg-transparent focus:outline-none cursor-pointer"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {language.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1 text-gray-700">
            <label htmlFor="currency-select" className="sr-only">
              Select Currency
            </label>
            <select
              id="currency-select"
              className="bg-transparent focus:outline-none cursor-pointer"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              {currency.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-4 lg:gap-8 items-center">
          <Link
            to="/track-order"
            className="flex items-center gap-1.5 text-gray-700 hover:text-[#2196F3] transition-colors"
            title="Track your order"
          >
            <BsTruck />
            <span>Track order</span>
          </Link>
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
            <span>
              Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
            </span>
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
          {/* NOTE: replace with the real logo (image or brand name) before shipping */}
          <Link
            to="/"
            className="font-black text-[#2196F3] text-xl sm:text-2xl lg:text-3xl hover:opacity-80 transition-opacity"
            title="Go to homepage"
          >
           NexTech Store
          </Link>
        </div>

        <div className="hidden sm:flex justify-center flex-1">
          <form
            onSubmit={handleSearch}
            className="relative flex items-center h-14 w-full max-w-xl border-2 border-gray-100 rounded-xl overflow-hidden"
          >
            <div className="relative hidden lg:block h-full border-r border-gray-200">
              <button
                type="button"
                onClick={() => setCategoryMenuOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={categoryMenuOpen}
                // FIX: "color-black" is not a real Tailwind class (silently
                // ignored); text color was already carried by text-gray-700.
                className="flex items-center h-full bg-[#F8F8F8] gap-1 px-4 text-gray-700 text-sm cursor-pointer whitespace-nowrap"
              >
                <span>{searchCategory}</span>
                <IoChevronDown className="text-[#2196F3] text-xl mt-1" />
              </button>

              {categoryMenuOpen && (
                <ul
                  role="listbox"
                  className="absolute left-0 top-full z-20 mt-1 w-40 rounded-md border border-gray-100 bg-white py-1 shadow-lg"
                >
                  {searchCategories.map((cat) => (
                    <li key={cat}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={searchCategory === cat}
                        onClick={() => {
                          setSearchCategory(cat);
                          setCategoryMenuOpen(false);
                        }}
                        className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 ${
                          searchCategory === cat ? "font-semibold text-[#2196F3]" : "text-gray-700"
                        }`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <input
              className="flex-1 min-w-0 bg-white px-3 py-2.5 text-md placeholder-[#C2C2C2] focus:outline-none"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              aria-label="Search products"
            />
            <button
              type="submit"
              className="bg-[#2196F3] text-white h-full px-2 sm:px-3 shrink-0 hover:bg-[#1a7fd1] transition-all duration-200 rounded-md"
              title="Search"
            >
              <IoMdSearch className="text-3xl" />
              <span className="sr-only">Search</span>
            </button>
          </form>
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
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                ref={profileTriggerRef}
                type="button"
                onClick={handleProfileIconClick}
                title="Account menu"
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={profileDropdownOpen}
                className="flex items-center"
              >
                {user.profilePicture ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#2196F3] hover:opacity-80 transition-opacity">
                    <img
                      src={user.profilePicture}
                      alt={userName || "Account"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#2196F3] text-white text-sm font-bold flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer">
                    {userInitials}
                  </div>
                )}
              </button>
              <ProfileDropdown
                isOpen={profileDropdownOpen}
                onClose={handleProfileDropdownClose}
                triggerRef={profileTriggerRef}
              />
            </div>
          ) : (
            <Link
              to="/signin"
              title="Sign in"
              aria-label="Sign in"
              className="relative flex items-center"
            >
              <FaRegUserCircle className="cursor-pointer hover:text-[#007BFF] transition-colors" />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile search */}
      <div className="sm:hidden px-4 pb-4">
        <form
          onSubmit={handleSearch}
          className="flex items-center w-full bg-white border border-gray-200 rounded-md overflow-hidden"
        >
          <input
            className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            aria-label="Search products"
          />
          <button
            type="submit"
            className="bg-[#2196F3] text-white px-4 py-2.5 shrink-0 hover:bg-[#1a7fd1] transition-all duration-200 rounded-r-md"
            title="Search"
          >
            <IoMdSearch className="text-lg" />
            <span className="sr-only">Search</span>
          </button>
        </form>
      </div>

      {/* NAVBAR - desktop */}
      <nav
        className="hidden md:flex justify-evenly px-4 lg:px-20 text-white bg-[#2196F3] p-4 sticky top-0 z-20"
        role="navigation"
        aria-label="Main navigation"
      >
        {menus.map((menu) => {
          const active = isMenuActive(menu, location);

          // Store: a dropdown of categories. Opens on hover (and keyboard focus,
          // via focus-within on the wrapper) and toggles on click.
          if (menu.categories) {
            return (
              <div
                key={menu.id}
                className="relative"
                onMouseEnter={() => setStoreMenuOpen(true)}
                onMouseLeave={() => setStoreMenuOpen(false)}
                onFocus={() => setStoreMenuOpen(true)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setStoreMenuOpen(false);
                  }
                }}
              >
                <button
                  type="button"
                  onClick={() => setStoreMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={storeMenuOpen}
                  className={`relative flex items-center gap-1 hover:opacity-80 text-sm lg:text-base pb-2 transition-opacity ${
                    active ? "font-semibold" : ""
                  }`}
                >
                  {menu.pathValue}
                  <IoChevronDown
                    className={`text-base transition-transform duration-200 ${
                      storeMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                  {active && (
                    <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2.5 h-1 bg-white rounded-full"></span>
                  )}
                </button>

                {/* UPGRADED: icon-circle rows + soft hover highlight, wider
                    touch targets, rounded-2xl card, subtle divider before the
                    "Shop all products" shortcut. Behavior is unchanged. */}
                {storeMenuOpen && (
                  <div
                    role="menu"
                    aria-label="Product categories"
                    className="absolute left-1/2 -translate-x-1/2 top-full z-30 w-64 rounded-2xl border border-gray-100 bg-white p-2 text-gray-800 shadow-xl"
                  >
                    {menu.categories.map((category) => {
                      const catActive = isCategoryActive(category, location);
                      return (
                        <NavLink
                          key={category}
                          to={`/store?category=${encodeURIComponent(category)}`}
                          role="menuitem"
                          onClick={() => setStoreMenuOpen(false)}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-[#EAF4FF] ${
                            catActive ? "bg-[#EAF4FF] text-[#2196F3] font-semibold" : ""
                          }`}
                        >
                          <span
                            className={`flex items-center justify-center w-9 h-9 rounded-full text-lg shrink-0 ${
                              catActive
                                ? "bg-[#2196F3] text-white"
                                : "bg-[#F1F6FC] text-[#2196F3]"
                            }`}
                          >
                            {categoryIcon(category)}
                          </span>
                          {category}
                        </NavLink>
                      );
                    })}

                    {/* Not a category — a shortcut to the full catalog. */}
                    <div className="my-2 border-t border-gray-100"></div>
                    <NavLink
                      to="/store"
                      role="menuitem"
                      onClick={() => setStoreMenuOpen(false)}
                      className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-[#2196F3] hover:bg-[#EAF4FF]"
                    >
                      Shop all products
                    </NavLink>
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={menu.id}
              to={menu.pathName}
              className={`relative hover:opacity-80 text-sm lg:text-base pb-2 transition-opacity ${
                active ? "font-semibold" : ""
              }`}
              title={`Go to ${menu.pathValue}`}
            >
              {menu.pathValue}
              {active && (
                <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2.5 h-1 bg-white rounded-full"></span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* NAVBAR - mobile dropdown */}
      {navOpen && (
        <nav
          className="md:hidden flex flex-col text-white bg-[#2196F3] px-4 py-2"
          role="navigation"
          aria-label="Mobile navigation"
        >
          {menus.map((menu) => {
            const active = isMenuActive(menu, location);

            // Store: a collapsible section. Tapping the row expands the category
            // list inline instead of navigating away.
            if (menu.categories) {
              return (
                <div
                  key={menu.id}
                  className="border-b border-white/20 last:border-none"
                >
                  <button
                    type="button"
                    onClick={() => setMobileStoreOpen((v) => !v)}
                    aria-expanded={mobileStoreOpen}
                    aria-controls="mobile-store-submenu"
                    className="flex w-full items-center justify-between py-2 hover:opacity-80 transition-opacity"
                  >
                    <span className={active ? "font-semibold" : ""}>
                      {menu.pathValue}
                    </span>
                    <IoChevronDown
                      className={`transition-transform duration-200 ${
                        mobileStoreOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* UPGRADED: same icon-circle treatment as desktop, so the
                      mobile submenu looks consistent with the dropdown above. */}
                  {mobileStoreOpen && (
                    <div
                      id="mobile-store-submenu"
                      className="flex flex-col gap-1 pb-2"
                    >
                      {menu.categories.map((category) => {
                        const catActive = isCategoryActive(category, location);
                        return (
                          <NavLink
                            key={category}
                            to={`/store?category=${encodeURIComponent(category)}`}
                            onClick={() => {
                              setNavOpen(false);
                              setMobileStoreOpen(false);
                            }}
                            className={`flex items-center gap-3 rounded-lg py-2 pl-2 pr-3 text-sm hover:bg-white/10 ${
                              catActive ? "font-semibold bg-white/10" : ""
                            }`}
                          >
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 text-base shrink-0">
                              {categoryIcon(category)}
                            </span>
                            {category}
                          </NavLink>
                        );
                      })}
                      <NavLink
                        to="/store"
                        onClick={() => {
                          setNavOpen(false);
                          setMobileStoreOpen(false);
                        }}
                        className="py-2 pl-2 text-sm font-medium hover:opacity-80"
                      >
                        Shop all products
                      </NavLink>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={menu.id}
                to={menu.pathName}
                onClick={() => setNavOpen(false)}
                className="relative flex items-center justify-between py-2 border-b border-white/20 last:border-none hover:opacity-80 transition-opacity"
                title={`Go to ${menu.pathValue}`}
              >
                {menu.pathValue}
                {active && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
              </NavLink>
            );
          })}
        </nav>
      )}
    </header>
  );
};

export default Header;