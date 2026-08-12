import React, { useState, useMemo } from "react";
import StoreProductCard from "./StoreProductCard";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const PER_PAGE_OPTIONS = [12, 24, 48];
const MAX_PAGE_BUTTONS = 5;

const ProductGrid = ({ products }) => {
  const [sortBy, setSortBy] = useState("name");
  const [perPage, setPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  const sorted = useMemo(() => {
    const list = [...products];
    if (sortBy === "name") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "priceLow") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceHigh") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      list.sort((a, b) => b.createdAt - a.createdAt);
    }
    return list;
  }, [products, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const safePage = Math.min(currentPage, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, safePage, perPage]);

  const pageNumbers = useMemo(() => {
    const windowStart = Math.max(
      1,
      Math.min(safePage - 2, totalPages - MAX_PAGE_BUTTONS + 1)
    );
    const windowEnd = Math.min(totalPages, windowStart + MAX_PAGE_BUTTONS - 1);
    const pages = [];
    for (let i = windowStart; i <= windowEnd; i += 1) {
      pages.push(i);
    }
    return pages;
  }, [safePage, totalPages]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 min-w-0">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-sm text-gray-500">
          <span className="text-gray-900 font-semibold">{sorted.length}</span>{" "}
          Items
        </p>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            Sort By:
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="border border-gray-200 rounded-md text-sm px-2 py-1.5 bg-white focus:outline-none focus:border-blue-400 cursor-pointer"
            >
              <option value="name">Name</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            Show:
            <select
              value={perPage}
              onChange={handlePerPageChange}
              className="border border-gray-200 rounded-md text-sm px-2 py-1.5 bg-white focus:outline-none focus:border-blue-400 cursor-pointer"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-lg font-semibold text-gray-700 mb-2">No products found</p>
          <p className="text-sm text-gray-500 mb-6">
            Try adjusting your filters or search terms
          </p>
          <button
            onClick={() => window.location.href = '/store'}
            className="bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-sm font-semibold px-6 py-2.5 rounded-md transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {pageItems.map((product) => (
            <StoreProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            aria-label="Previous page"
            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <FiChevronLeft />
          </button>

          {pageNumbers[0] > 1 && (
            <button
              onClick={() => setCurrentPage(1)}
              className="w-8 h-8 rounded-md text-sm text-gray-600 hover:text-blue-500 transition"
            >
              1
            </button>
          )}
          {pageNumbers[0] > 2 && (
            <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">
              …
            </span>
          )}

          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-md text-sm font-medium transition ${
                page === safePage
                  ? "bg-[#006CE4] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">
              …
            </span>
          )}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <button
              onClick={() => setCurrentPage(totalPages)}
              className="w-8 h-8 rounded-md text-sm text-gray-600 hover:text-blue-500 transition"
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            aria-label="Next page"
            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
