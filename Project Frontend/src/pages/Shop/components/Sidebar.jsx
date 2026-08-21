import React from "react";
import { FaCheckSquare, FaRegSquare } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";

const Sidebar = ({
  categories,
  activeCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  brands,
  selectedBrands,
  onBrandToggle,
  priceMin,
  priceMax,
}) => {
  const [min, max] = priceRange;
  const delta = priceMax - priceMin;

  const handleMinChange = (value) => {
    const next = Math.min(Number(value), max - 10);
    onPriceChange([next, max]);
  };

  const handleMaxChange = (value) => {
    const next = Math.max(Number(value), min + 10);
    onPriceChange([min, next]);
  };

  const minPercent = ((min - priceMin) / delta) * 100;
  const maxPercent = ((max - priceMin) / delta) * 100;

  return (
    <aside className="w-full lg:w-[260px] shrink-0 space-y-6">
      {/* All Categories */}
      <div className="border-b border-gray-200 pb-5">
        <h3 className="font-semibold text-[15px] mb-3">All Categories</h3>
        <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.label;
            return (
              <li key={cat.label}>
                <button
                  onClick={() => onCategoryChange(isActive ? null : cat.label)}
                  className="flex items-center gap-2 text-sm hover:text-blue-500 transition-colors w-full text-left group"
                >
                  <span className="text-blue-500 text-[15px] leading-none">
                    {isActive ? <FaCheckSquare /> : <FaRegSquare />}
                  </span>
                  <span
                    className={`flex-1 leading-snug ${
                      isActive ? "text-blue-500 font-medium" : "text-gray-700"
                    }`}
                  >
                    {cat.label}
                  </span>
                  <span className="text-gray-400 text-xs">{cat.count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Prices */}
      <div className="border-b border-gray-200 pb-5">
        <h3 className="font-semibold text-[15px] mb-4">PRICES</h3>
        <p className="text-xs text-gray-500 mb-3">
          Range:{" "}
          <span className="text-gray-800 font-medium">
            ${min} - ${max}
          </span>
        </p>

        <div className="range-slider relative h-5">
          <div className="absolute top-1/2 -translate-y-1/2 h-1 w-full bg-gray-200 rounded-full" />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-1 bg-[#006CE4] rounded-full"
            style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
          />
          <input
            type="range"
            min={priceMin}
            max={priceMax}
            value={min}
            onChange={(e) => handleMinChange(e.target.value)}
            aria-label="Min price"
            className="range-input range-input-min"
            style={{ "--range-progress": `${minPercent}%` }}
          />
          <input
            type="range"
            min={priceMin}
            max={priceMax}
            value={max}
            onChange={(e) => handleMaxChange(e.target.value)}
            aria-label="Max price"
            className="range-input range-input-max"
            style={{ "--range-progress": `${maxPercent}%` }}
          />
        </div>

        <style>{`
          .range-slider .range-input {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 100%;
            height: 20px;
            margin: 0;
            background: transparent;
            pointer-events: none;
            -webkit-appearance: none;
            appearance: none;
          }
          .range-slider .range-input::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            pointer-events: auto;
            width: 16px;
            height: 16px;
            border-radius: 9999px;
            background: #006CE4;
            border: 2px solid #fff;
            box-shadow: 0 1px 3px rgba(0,0,0,.25);
            cursor: pointer;
          }
          .range-slider .range-input::-moz-range-thumb {
            pointer-events: auto;
            width: 16px;
            height: 16px;
            border-radius: 9999px;
            background: #006CE4;
            border: 2px solid #fff;
            box-shadow: 0 1px 3px rgba(0,0,0,.25);
            cursor: pointer;
          }
          .range-input-min { z-index: 3; }
          .range-input-max { z-index: 4; }
        `}</style>
      </div>

      {/* Brand */}
      <div>
        <h3 className="font-semibold text-[15px] mb-3">BRAND</h3>
        <ul className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
          {brands.map((brand) => {
            const isSelected = selectedBrands.includes(brand.label);
            return (
              <li key={brand.label}>
                <button
                  onClick={() => onBrandToggle(brand.label)}
                  className="flex items-center gap-2 text-sm hover:text-blue-500 transition-colors w-full text-left group"
                >
                  <span className="text-blue-500 text-[15px] leading-none">
                    {isSelected ? <FaCheckSquare /> : <FaRegSquare />}
                  </span>
                  <span
                    className={`flex-1 leading-snug ${
                      isSelected ? "text-blue-500 font-medium" : "text-gray-700"
                    }`}
                  >
                    {brand.label}
                  </span>
                  <span className="text-gray-400 text-xs">{brand.count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      
      </div>
    </aside>
  );
};

export default Sidebar;
