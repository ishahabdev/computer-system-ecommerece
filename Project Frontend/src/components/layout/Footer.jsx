import React from "react";
import { Link } from "react-router-dom";
import { AiFillInstagram } from "react-icons/ai";
import { FaYoutube, FaFacebookF, FaTwitter } from "react-icons/fa";

const usefulLinks = [
  { id: 1, label: "Home", href: "/" },
  { id: 2, label: "Store", href: "/store" },
  { id: 3, label: "Accessories", href: "/accessories" },
  { id: 4, label: "About Us", href: "/about" },
];

const offerLinks = [
  { id: 1, label: "About Us", href: "/about" },
  { id: 2, label: "Information", href: "#" },
  { id: 3, label: "Privacy Policy", href: "#" },
  { id: 4, label: "Terms & Conditions", href: "#" },
];

const socials = [
  { id: 1, Icon: AiFillInstagram, href: "https://instagram.com", label: "Instagram" },
  { id: 2, Icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
  { id: 3, Icon: FaFacebookF, href: "https://facebook.com", label: "Facebook" },
  { id: 4, Icon: FaTwitter, href: "https://twitter.com", label: "Twitter" },
];

const Footer = () => {
  return (
    <footer className="bg-[#F8F8F8] w-full" role="contentinfo">
      <div className="mx-auto px-6 md:px-36 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Store info */}
        <section>
          <h2 className="text-[#2196F3] font-semibold text-lg mb-3">Computer System eCommerce</h2>
          <p className="text-sm text-[#000000] leading-relaxed">
            Your trusted destination for premium computer systems, gaming PCs, laptops, and accessories. We provide high-quality hardware at competitive prices with excellent customer service.
          </p>
        </section>

        {/* Useful links */}
        <nav>
          <h3 className="font-semibold text-lg mb-3">Useful Links</h3>
          <ul className="flex flex-col gap-2">
            {usefulLinks.map((item) => (
              <li key={item.id}>
                <Link 
                  to={item.href} 
                  className="text-sm text-[#000000] hover:text-[#2196F3] transition-colors"
                  title={`Go to ${item.label}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Our offers */}
        <nav>
          <h3 className="font-semibold text-lg mb-3">Our Policies</h3>
          <ul className="flex flex-col gap-2">
            {offerLinks.map((item) => (
              <li key={item.id}>
                <Link 
                  to={item.href} 
                  className="text-sm text-[#000000] hover:text-[#2196F3] transition-colors"
                  title={`Read our ${item.label}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Subscribe */}
        <section>
          <p className="text-[#2196F3] text-sm mb-1">Subscribe to our emails</p>
          <h3 className="font-semibold text-lg mb-4">For latest News & Updates</h3>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-xs"
          >
            <label htmlFor="email-subscribe" className="sr-only">Email address</label>
            <input
              id="email-subscribe"
              type="email"
              placeholder="Enter your Email"
              className="flex-1 min-w-0 border border-gray-300 rounded-l-sm px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#2196F3]"
              aria-label="Email address for subscription"
              required
            />
            <button
              type="submit"
              className="bg-[#2196F3] text-white text-sm px-4 py-2 rounded-r-sm hover:bg-[#1a7fd1] transition-colors whitespace-nowrap"
              title="Subscribe to our newsletter"
            >
              Subscribe
            </button>
          </form>
        </section>
      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 pb-6 flex flex-col-reverse md:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
        <p className="text-xs text-[#000000]">
          © {new Date().getFullYear()} Computer System eCommerce Inc. All rights reserved.
        </p>
        <nav className="flex items-center gap-5" aria-label="Social media links">
          {socials.map((social) => (
            <a 
              key={social.id} 
              href={social.href} 
              rel="noopener noreferrer"
              target="_blank"
              aria-label={`Visit our ${social.label} page`} 
              className="text-gray-800 hover:text-[#2196F3] transition-colors"
              title={`Follow us on ${social.label}`}
            >
              <social.Icon size={18} />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
