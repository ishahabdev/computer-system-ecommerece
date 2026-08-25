import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import storebanner from "../../assets/storepics/storebanner.webp";
import Sidebar from "./components/Sidebar";
import ProductGrid from "./components/ProductGrid";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { fetchProducts, getErrorMessage } from "./productApi";
import { usePageSEO } from '../../hooks/usePageSEO';
import { PAGE_SEO } from '../../utils/seo';

// Fallback price bounds before any product has loaded (and if the catalog is empty),
// so the sidebar's range slider always has a valid, non-zero range to render.
const DEFAULT_PRICE_MIN = 0;
const DEFAULT_PRICE_MAX = 1000;

const Store = () => {
  usePageSEO(PAGE_SEO.store.title, PAGE_SEO.store.description);
  const [searchParams] = useSearchParams();

  // Real catalog from the backend `products` table — the same rows the admin
  // Products tab creates. Replaces the old static demo array.
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeCategory, setActiveCategory] = useState(null);
  const [priceRange, setPriceRange] = useState([
    DEFAULT_PRICE_MIN,
    DEFAULT_PRICE_MAX,
  ]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const queryCategory = searchParams.get("category");
  const querySearch = searchParams.get("search");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setProducts(await fetchProducts());
    } catch (err) {
      setError(getErrorMessage(err));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Categories and their counts come from the real catalog now, not a fixed list.
  const categories = useMemo(() => {
    const counts = new Map();
    products.forEach((product) => {
      counts.set(product.category, (counts.get(product.category) || 0) + 1);
    });
    return [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [products]);

  // The products table has no brand column, so the store has no brand facet.
  // Passing an empty list makes the sidebar hide the section entirely.
  const brandOptions = [];

  // Price slider bounds track the actual catalog range.
  const { priceMin, priceMax } = useMemo(() => {
    if (products.length === 0) {
      return { priceMin: DEFAULT_PRICE_MIN, priceMax: DEFAULT_PRICE_MAX };
    }
    const prices = products.map((product) => product.price);
    const min = Math.floor(Math.min(...prices));
    let max = Math.ceil(Math.max(...prices));
    // A single product (or several at one price) would give a zero-width range,
    // which breaks the slider's percentage math — keep it non-zero.
    if (max <= min) max = min + 100;
    return { priceMin: min, priceMax: max };
  }, [products]);

  // Sync the category/search/brand filters to the URL when it changes.
  useEffect(() => {
    setActiveCategory(queryCategory);
    setSearchTerm(querySearch || "");
    setSelectedBrands([]);
  }, [queryCategory, querySearch]);

  // Snap the price range to the catalog bounds once products load, and reset it
  // whenever the query changes. Bounds are derived from the fetched products, so
  // this settles to the real range right after the data arrives.
  useEffect(() => {
    setPriceRange([priceMin, priceMax]);
  }, [priceMin, priceMax, queryCategory, querySearch]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (activeCategory && product.category !== activeCategory) return false;

      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1])
        return false;

      // Brand filter (inert while the catalog has no brands)
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
  }, [products, activeCategory, priceRange, selectedBrands, searchTerm]);

  const handleBrandToggle = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((item) => item !== brand)
        : [...prev, brand]
    );
  };

  const renderMain = () => {
    if (loading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-gray-500">
          <div className="w-9 h-9 rounded-full border-2 border-gray-200 border-t-[#006CE4] animate-spin" />
          <p className="mt-4 text-sm">Loading products…</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-lg font-semibold text-gray-700 mb-2">
            Couldn’t load products
          </p>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={loadProducts}
            className="bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-sm font-semibold px-6 py-2.5 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-lg font-semibold text-gray-700 mb-2">
            No products yet
          </p>
          <p className="text-sm text-gray-500">
            Products added from the admin dashboard will appear here.
          </p>
        </div>
      );
    }

    return (
      <>
        <Sidebar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          brands={brandOptions}
          selectedBrands={selectedBrands}
          onBrandToggle={handleBrandToggle}
          priceMin={priceMin}
          priceMax={priceMax}
        />

        <ProductGrid products={filteredProducts} />
      </>
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
        {renderMain()}
      </div>
    </div>
  );
};

export default Store;
