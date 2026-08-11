import React from "react";
import { AiFillInstagram } from "react-icons/ai";
import { FaYoutube, FaFacebookF, FaTwitter } from "react-icons/fa";

const usefulLinks = [
  { id: 1, label: "Home", href: "#" },
  { id: 2, label: "Store", href: "#" },
  { id: 3, label: "Accessories", href: "#" },
  { id: 4, label: "About Us", href: "#" },
];

const offerLinks = [
  { id: 1, label: "About Us", href: "#" },
  { id: 2, label: "Infomation", href: "#" },
  { id: 3, label: "Privacy Policy", href: "#" },
  { id: 4, label: "Terms & Conditions", href: "#" },
];

const socials = [
  { id: 1, Icon: AiFillInstagram, href: "#", label: "Instagram" },
  { id: 2, Icon: FaYoutube, href: "#", label: "YouTube" },
  { id: 3, Icon: FaFacebookF, href: "#", label: "Facebook" },
  { id: 4, Icon: FaTwitter, href: "#", label: "Twitter" },
];

const Footer = () => {
  return (
    <footer className="bg-[#F8F8F8] w-full">
      <div className=" mx-auto px-6 md:px-36 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Store info */}
        <div>
          <h3 className="text-[#2196F3] font-semibold text-lg mb-3">Store Name</h3>
          <p className="text-sm text-[#000000] leading-relaxed">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type.
          </p>
        </div>

        {/* Useful links */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Userful Links</h3>
          <ul className="flex flex-col gap-2">
            {usefulLinks.map((item) => (
              <li key={item.id}>
                <a href={item.href} className="text-sm text-[#000000] hover:text-[#2196F3]">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Our offers */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Our Offers</h3>
          <ul className="flex flex-col gap-2">
            {offerLinks.map((item) => (
              <li key={item.id}>
                <a href={item.href} className="text-sm text-[#000000] hover:text-[#2196F3]">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Subscribe */}
        <div>
          <p className="text-[#2196F3] text-sm mb-1">Subscribe to our emails</p>
          <h3 className="font-semibold text-lg mb-4">For latest News & Updates</h3>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-xs"
          >
            <input
              type="email"
              placeholder="Enter your Email"
              className="flex-1 min-w-0 border border-gray-300 rounded-l-sm px-3 py-2 text-sm bg-white focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#2196F3] text-white text-sm px-4 py-2 rounded-r-sm hover:bg-[#1a7fd1] transition-colors whitespace-nowrap"
            >
              Subcribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 pb-6 flex flex-col-reverse md:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
          <p className="text-xs text-[#000000]">
          © 2023 WQsoftwares Inc. All rights reserved.
        </p>
        <div className="flex items-center gap-5">
          {socials.map(({ id, Icon, href, label }) => (
            <a key={id} href={href} aria-label={label} className="text-gray-800 hover:text-[#2196F3]">
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;