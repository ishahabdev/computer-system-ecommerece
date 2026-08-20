import React from 'react';
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { usePageSEO } from '../../hooks/usePageSEO';
import { PAGE_SEO } from '../../utils/seo';

const accessoryCategories = [
  {
    id: 1,
    name: "Keyboards",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800&auto=format&fit=crop",
    link: "/store?category=Keyboard",
    description: "Mechanical and membrane keyboards"
  },
  {
    id: 2,
    name: "Mice",
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?q=80&w=800&auto=format&fit=crop",
    link: "/store?category=Mouse",
    description: "Gaming and office mice"
  },
  {
    id: 3,
    name: "Headsets",
    image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop",
    link: "/store?category=Headset",
    description: "Audio solutions for gaming and work"
  },
  {
    id: 4,
    name: "Webcams",
    image: "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=800&auto=format&fit=crop",
    link: "/store?category=Webcam",
    description: "HD and 4K webcams"
  },
  {
    id: 5,
    name: "Monitors",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop",
    link: "/store?category=Monitor",
    description: "Gaming and professional displays"
  },
  {
    id: 6,
    name: "Cables & Adapters",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
    link: "/store",
    description: "USB, HDMI, and more"
  }
];

const Accessories = () => {
  usePageSEO(PAGE_SEO.accessories.title, PAGE_SEO.accessories.description);
  
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <nav
        className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 py-6 flex items-center gap-1.5 text-sm text-gray-500 border-b border-gray-200"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="hover:text-blue-500 transition-colors">
          Home
        </Link>
        <FiChevronRight className="text-xs" />
        <span className="text-gray-900 font-medium">Accessories</span>
      </nav>

      {/* Hero Section */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 py-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-[#22262A] mb-4">
          Computer Accessories
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Complete your setup with our wide range of computer accessories. From keyboards and mice
          to monitors and cables, we have everything you need.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessoryCategories.map((category) => (
            <Link
              key={category.id}
              to={category.link}
              className="group bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={category.image}
                  alt={`${category.name} - Computer accessories category`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#22262A] mb-2 group-hover:text-[#2196F3] transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600">{category.description}</p>
                <div className="mt-3 text-[#2196F3] text-sm font-medium flex items-center gap-1">
                  Shop Now
                  <FiChevronRight className="text-xs group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-12">
        <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 text-center">
          <h2 className="text-2xl font-bold text-[#22262A] mb-4">
            Looking for Complete Systems?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Browse our full collection of pre-built computers, laptops, and gaming systems.
          </p>
          <Link
            to="/store"
            className="inline-block bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-sm font-semibold px-8 py-3 rounded-md transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Accessories;
