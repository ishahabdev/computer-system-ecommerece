import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { FaRegHeart } from "react-icons/fa6";
import { useCart } from "react-use-cart";
import { products } from "../Store/data";

const Wishlist = () => {
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState({});

  // Seed the wishlist with sample items (mouse + laptop) for the demo flow.
  const seed = [
    {
      ...products.find((p) => p.category === "Mouses"),
      brand: "Razer Inc",
      status: "available",
    },
    {
      ...products.find((p) => p.category === "Laptops"),
      brand: "Lenovo",
      status: "outofstock",
    },
  ].filter(Boolean);

  const [items, setItems] = useState(seed);

  const handleAddToCart = (item) => {
    addItem({
      id: item.id,
      name: item.title,
      price: item.price,
      image: item.img,
      category: item.category,
    });
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(
      () => setAddedIds((prev) => ({ ...prev, [item.id]: false })),
      1500
    );
  };

  const handleDeleteAll = () => {
    setItems([]);
  };

  return (
    <div className="bg-white px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 py-6 md:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-blue-500 transition-colors">
          Home
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">Wishlist</span>
      </nav>

      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#22262A] mb-6">
        Wishlist
      </h1>

      {items.length === 0 ? (
        <div className="bg-[#F8F8F8] rounded-lg p-12 text-center">
          <FaRegHeart className="mx-auto text-gray-300 text-5xl mb-4" />
          <p className="text-gray-500 mb-6">Your wishlist is empty.</p>
          <Link
            to="/store"
            className="inline-block bg-[#2196F3] text-white text-sm font-semibold px-8 py-3 rounded-md hover:bg-[#1a7fd1] transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#F8F8F8] text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  <th className="py-3.5 px-4 border border-gray-200 w-[55%]">
                    Product
                  </th>
                  <th className="py-3.5 px-4 border border-gray-200">
                    Price
                  </th>
                  <th className="py-3.5 px-4 border border-gray-200">
                    Status
                  </th>
                  <th className="py-3.5 px-4 border border-gray-200">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    {/* Product */}
                    <td className="py-4 px-4 border border-gray-200">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#F8F8F8] rounded-md flex items-center justify-center shrink-0 p-1.5">
                          <img
                            src={item.img}
                            alt={item.title}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/store/product/${item.id}`}
                            className="font-semibold text-sm sm:text-base text-[#22262A] leading-snug hover:text-[#2196F3] transition-colors block line-clamp-1"
                          >
                            {item.title}
                          </Link>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.brand}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 border border-gray-200 text-sm sm:text-base font-semibold text-[#22262A] whitespace-nowrap">
                      {item.currency}
                      {item.price}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 border border-gray-200">
                      <span
                        className={`inline-block text-xs font-medium px-2.5 py-1 rounded-md ${
                          item.status === "available"
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {item.status === "available"
                          ? "Available"
                          : "Out of stock"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 border border-gray-200">
                      {item.status === "available" ? (
                        <button
                          onClick={() => handleAddToCart(item)}
                          className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 rounded-md whitespace-nowrap transition-colors ${
                            addedIds[item.id]
                              ? "bg-green-600 text-white"
                              : "bg-[#2196F3] text-white hover:bg-[#1a7fd1]"
                          }`}
                        >
                          <FiShoppingCart />
                          {addedIds[item.id] ? "Added ✓" : "Add to cart"}
                        </button>
                      ) : (
                        <Link
                          to={`/store/product/${item.id}`}
                          className="inline-block text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:border-[#2196F3] hover:text-[#2196F3] transition-colors whitespace-nowrap"
                        >
                          View Product
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Delete all */}
          <div className="flex justify-end mt-5">
            <button
              onClick={handleDeleteAll}
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-6 py-2.5 rounded-md transition-colors"
            >
              Delete All Items
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist;
