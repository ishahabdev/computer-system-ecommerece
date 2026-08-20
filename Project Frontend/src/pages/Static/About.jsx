import React from "react";
import { usePageSEO } from "../../hooks/usePageSEO";
import { PAGE_SEO } from "../../utils/seo";
import banner from "../../assets/About us/banner.png";
import asus from "../../assets/About us/asus.png";
import dell from "../../assets/About us/dell.png";
import samsung from "../../assets/About us/samsung.png";
import lenovo from "../../assets/About us/lenovo.png";
import hp from "../../assets/About us/hp.png";
import apple from "../../assets/About us/apple.png";
import pic1 from "../../assets/About us/pic1.png";
import pic2 from "../../assets/About us/pic2.png";

const ABOUT_BULLETS = [
  "Lorem ipsum is placeholder text commonly used in the graphic, print, etc.",
  "Mempor incididunt ut labore et dolore magna aliqua.",
  "Minim veniam, quis nostrud exercitation ullamco laboris.",
  "Velit esse citum dolore eu fugiat nulla pariatur.",
  "Culpa qui officia deserunt mollit anim id est laborum.",
];

const BRANDS = [
  { name: "Samsung", logo: samsung },
  { name: "Dell", logo: dell },
  { name: "Lenovo", logo: lenovo },
  { name: "Apple", logo: apple },
  { name: "HP", logo: hp },
  { name: "Asus", logo: asus },
  { name: "Samsung", logo: samsung },
  { name: "Dell", logo: dell },
  { name: "Lenovo", logo: lenovo },
  { name: "Apple", logo: apple },
];

export default function About() {
  usePageSEO(PAGE_SEO.about.title, PAGE_SEO.about.description);
  
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero */}
      <div className="relative w-full h-[260px] sm:h-[320px] md:h-[380px] overflow-hidden bg-black">
        <img
          src={banner}
          alt="Backlit mechanical keyboard"
          className="w-full h-full object-cover opacity-90"
        />
      </div>

      {/* About Us */}
      <section className="px-6 sm:px-10 py-12 grid md:grid-cols-2 gap-10 items-start max-w-6xl mx-auto">
        <div>
          <h2 className="text-sky-500 text-xl font-bold mb-4">About Us</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Diam
            donec tincidunt augue interdum velit euismod. Diam donec
            tristique magna sit amet purus gravida quis. Praesent tristique
            magna sit amet purus gravida quis. Morbi quis commodo odio aenean
            sed. Nisl honcus mattis honcus urna neque. Potenti nullam ac
            tortor vitae purus. Volutpat ac tincidunt vitae semper. Sit amet
            cursus sit a.
          </p>
          <ul className="space-y-2">
            {ABOUT_BULLETS.map((bullet) => (
              <li key={bullet} className="flex gap-2 text-sm text-slate-600">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-800 flex-shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <img
            src={pic1}
            alt="Desk setup with monitor and speakers"
            className="col-span-2 w-full h-40 object-cover rounded shadow-sm"
          />
          <img
            src={pic1}
            alt="RGB dual monitor setup"
            className="w-full h-44 object-cover rounded shadow-sm"
          />
          <img
            src={pic2}
            alt="Desk workstation top view"
            className="w-full h-44 object-cover rounded shadow-sm"
          />
        </div>
      </section>

      {/* Our Techies */}
      <section className="bg-slate-100 py-10">
        <h3 className="text-center text-sky-500 font-bold text-lg mb-8">
          Our Techies
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 px-6">
          {BRANDS.map((brand, i) => (
            <img
              key={`${brand.name}-${i}`}
              src={brand.logo}
              alt={brand.name}
              className="h-8 sm:h-9 object-contain"
            />
          ))}
        </div>
      </section>
    </div>
  );
}