import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import storebanner from "../../assets/storepics/storebanner.webp";
import Sidebar from "./components/Sidebar";
import ProductGrid from "./components/ProductGrid";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import {
  products,
  categories,
  brandOptions,
  PRICE_MIN,
  PRICE_MAX,
} from "./data";
import { usePageSEO } from '../../hooks/usePageSEO';
import { PAGE_SEO } from '../../utils/seo';

const Store = () => {
  usePageSEO(PAGE_SEO.store.title, PAGE_SEO.store.description);
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(null);
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const queryCategory = searchParams.get("category");
  const querySearch = searchParams.get("search");

  // Reset filters when URL parameters change
  React.useEffect(() => {
    setActiveCategory(queryCategory);
    setSearchTerm(querySearch || "");
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setSelectedBrands([]);
  }, [queryCategory, querySearch]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (activeCategory && product.category !== activeCategory) return false;
      
      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1])
        return false;
      
      // Brand filter
      if (
        selectedBrands.length > 0 &&
        !selectedBrands.includes(product.brand)
      )
        return false;
      
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(search);
        const matchesCategory = product.category.toLowerCase().includes(search);
        const matchesBrand = product.brand.toLowerCase().includes(search);
        if (!matchesTitle && !matchesCategory && !matchesBrand) return false;
      }
      
      return true;
    });
  }, [activeCategory, priceRange, selectedBrands, searchTerm]);

  const handleBrandToggle = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((item) => item !== brand)
        : [...prev, brand]
    );
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero banner */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 py-6 md:py-10">
        <img
          src={storebanner}
          alt="Store Banner"
          className="w-full rounded-lg"
        />
      </div>

      {/* Breadcrumbs */}
      <nav
        className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 pb-6 flex items-center gap-1.5 text-sm text-gray-500"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="hover:text-blue-500 transition-colors">
          Home
        </Link>
        <FiChevronRight className="text-xs" />
        <span className="text-gray-900 font-medium">Store</span>
        {(activeCategory || searchTerm) && (
          <>
            <FiChevronRight className="text-xs" />
            <span className="text-gray-900 font-medium">
              {searchTerm ? `Search: "${searchTerm}"` : activeCategory}
            </span>
          </>
        )}
      </nav>

      {/* Main layout */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 pb-16 flex flex-col lg:flex-row gap-8 lg:gap-10">
        <Sidebar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          brands={brandOptions}
          selectedBrands={selectedBrands}
          onBrandToggle={handleBrandToggle}
          priceMin={PRICE_MIN}
          priceMax={PRICE_MAX}
        />

        <ProductGrid products={filteredProducts} />
      </div>
    </div>
  );
};

export default Store;
