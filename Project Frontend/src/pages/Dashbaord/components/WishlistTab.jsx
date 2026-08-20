import { useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

const WishlistTab = () => {
  const { addToCart } = useCart();
  const { wishlistItems, isWishlistLoading, removeFromWishlist, clearWishlist } = useWishlist();
  const [addedIds, setAddedIds] = useState({});

  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      currency: item.currency,
      image: item.image || "P",
      imagePath: item.imagePath,
      category: item.category,
    }, 1);
    setAddedIds((currentIds) => ({ ...currentIds, [item.id]: true }));
    setTimeout(() => setAddedIds((currentIds) => ({ ...currentIds, [item.id]: false })), 1500);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-[#22262A]">Wishlist</h2>
        {wishlistItems.length > 0 && (
          <button type="button" onClick={clearWishlist} className="inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-4 py-2.5 rounded transition-colors">
            <FiTrash2 />
            Clear Wishlist
          </button>
        )}
      </div>

      {isWishlistLoading ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-600">Loading wishlist...</div>
      ) : wishlistItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FiHeart className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Your wishlist is empty.</p>
          <Link to="/store" className="inline-block bg-[#2196F3] hover:bg-[#1a7fd1] text-white px-6 py-2 rounded transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {wishlistItems.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex gap-4">
              <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded flex items-center justify-center shrink-0">
                {item.imagePath ? (
                  <img src={item.imagePath} alt={item.title} className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-3xl">{item.image || "P"}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link to={`/store/product/${item.id}`} className="font-semibold text-[#22262A] hover:text-[#2196F3] line-clamp-2">
                  {item.title}
                </Link>
                <p className="text-sm font-semibold text-[#22262A] mt-1">{item.currency || "$"}{item.price || 0}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <button type="button" onClick={() => handleAddToCart(item)} className="inline-flex items-center gap-2 bg-[#2196F3] hover:bg-[#1a7fd1] text-white text-sm font-semibold px-4 py-2 rounded transition-colors">
                    <FiShoppingCart />
                    {addedIds[item.id] ? "Added" : "Add to Cart"}
                  </button>
                  <button type="button" onClick={() => removeFromWishlist(item.id)} className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded transition-colors">
                    <FiTrash2 />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistTab;
