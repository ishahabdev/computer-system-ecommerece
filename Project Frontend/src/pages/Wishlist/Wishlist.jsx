import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaRegHeart } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const Wishlist = () => {
  const { addToCart } = useCart();
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const [addedIds, setAddedIds] = useState({});

  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      currency: item.currency,
      image: item.image || "🛍️",
      category: item.category,
    }, 1);
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(
      () => setAddedIds((prev) => ({ ...prev, [item.id]: false })),
      1500
    );
  };

  const handleRemoveItem = (id) => {
    removeFromWishlist(id);
  };

  const handleDeleteAll = () => {
    clearWishlist();
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 py-6 md:py-10">
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-2 text-sm text-gray-500 mb-6"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="hover:text-blue-500 transition-colors">
          Home
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">Wishlist</span>
      </nav>

      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FaRegHeart className="mx-auto text-gray-300 text-5xl mb-4" />
          <p className="text-gray-600 mb-2 font-semibold text-lg">Your wishlist is empty.</p>
          <p className="text-gray-500 mb-6">Add items by clicking the heart icon on products.</p>
          <Link
            to="/store"
            className="inline-block bg-gradient-to-r from-[#2196F3] to-[#1a7fd1] text-white text-sm font-semibold px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-[#22262A]">My Wishlist</h1>
            <p className="text-sm text-gray-500">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-gray-800 uppercase tracking-wide border-b border-gray-200">
                  <th className="py-3 pr-3 w-8"></th>
                  <th className="py-3 pr-4">Product</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {wishlistItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Remove */}
                    <td className="py-5 pr-3 align-middle">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        aria-label="Remove item"
                        className="w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors"
                      >
                        <IoClose size={14} />
                      </button>
                    </td>

                    {/* Product */}
                    <td className="py-5 pr-4 align-middle">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0 bg-[#F8F8F8] rounded border border-gray-100">
                          {item.imagePath ? (
                            <img
                              src={item.imagePath}
                              alt={item.title}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-2xl">{item.image || "🛍️"}</span>
                          )}
                        </div>
                        <Link
                          to={`/store/product/${item.id}`}
                          className="font-semibold text-sm sm:text-base text-[#22262A] leading-snug hover:text-[#2196F3] transition-colors"
                        >
                          {item.title}
                        </Link>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-5 px-4 align-middle text-sm sm:text-base font-semibold text-[#22262A] whitespace-nowrap">
                      {item.currency}
                      {item.price}
                    </td>

                    {/* Status */}
                    <td className="py-5 px-4 align-middle whitespace-nowrap">
                      <span className="text-sm font-semibold text-[#22262A]">
                        Available
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-5 px-4 align-middle whitespace-nowrap">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`text-sm font-semibold transition-all ${
                          addedIds[item.id]
                            ? "text-green-600"
                            : "text-[#2196F3] hover:text-[#1a7fd1]"
                        }`}
                      >
                        {addedIds[item.id] ? "Added ✓" : "Add to cart"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Delete all */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleDeleteAll}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105"
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