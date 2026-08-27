import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight, FiZap } from "react-icons/fi";
import StoreProductCard from "../Shop/components/StoreProductCard";
import { fetchProducts, getErrorMessage } from "../Shop/productApi";
import { usePageSEO } from "../../hooks/usePageSEO";
import { PAGE_SEO } from "../../utils/seo";

// The store computes salePrice/hasDeal in mapProduct, so the Deals page just
// filters the same catalog down to discounted products and orders them by how
// deep the discount is — biggest savings first.
export default function Deals() {
  usePageSEO(PAGE_SEO.deals.title, PAGE_SEO.deals.description);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const deals = useMemo(
    () =>
      products
        .filter((product) => product.hasDeal)
        .sort((a, b) => b.discountPercent - a.discountPercent),
    [products]
  );

  // The single biggest discount, for the hero headline.
  const topDiscount = deals.length > 0 ? deals[0].discountPercent : 0;

  const renderBody = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-[#E11D48]" />
          <p className="mt-4 text-sm">Loading deals…</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <p className="mb-2 text-lg font-semibold text-gray-700">
            Couldn’t load deals
          </p>
          <p className="mb-6 text-sm text-gray-500">{error}</p>
          <button
            onClick={loadProducts}
            className="rounded-md bg-[#2196F3] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1a7fd1]"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (deals.length === 0) {
      return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <p className="mb-2 text-lg font-semibold text-gray-700">
            No deals right now
          </p>
          <p className="mb-6 text-sm text-gray-500">
            Check back soon — discounted products will show up here as they go on
            sale.
          </p>
          <Link
            to="/store"
            className="inline-block rounded-md bg-[#2196F3] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1a7fd1]"
          >
            Browse the Store
          </Link>
        </div>
      );
    }

    return (
      <>
        <p className="mb-5 text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{deals.length}</span>{" "}
          {deals.length === 1 ? "deal" : "deals"} live now
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {deals.map((product) => (
            <StoreProductCard key={product.id} product={product} />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="px-4 pt-6 sm:px-6 md:px-10 lg:px-20 xl:px-32 md:pt-10">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#E11D48] to-[#F97316] px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <FiZap /> Limited-time savings
            </span>
            <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
              Today’s Deals
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/90 sm:text-base">
              {topDiscount > 0
                ? `Save up to ${topDiscount}% on hand-picked computer systems, components and accessories.`
                : "Discounted computer systems, components and accessories — updated daily."}
            </p>
          </div>
          {/* Decorative discount tags */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 -top-6 hidden h-40 w-40 rotate-12 rounded-3xl border-[16px] border-white/10 sm:block"
          />
        </div>
      </div>

      {/* Breadcrumbs */}
      <nav
        className="flex items-center gap-1.5 px-4 py-6 text-sm text-gray-500 sm:px-6 md:px-10 lg:px-20 xl:px-32"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="transition-colors hover:text-blue-500">
          Home
        </Link>
        <FiChevronRight className="text-xs" />
        <span className="font-medium text-gray-900">Deals</span>
      </nav>

      {/* Body */}
      <div className="px-4 pb-16 sm:px-6 md:px-10 lg:px-20 xl:px-32">
        {renderBody()}
      </div>
    </div>
  );
}
