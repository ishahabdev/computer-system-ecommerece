import React, { createContext, useState, useContext, useCallback, useEffect } from "react";

// Create the Wishlist Context
const WishlistContext = createContext();

// Custom hook to use the Wishlist Context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

// Wishlist Provider Component
export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    // Initialize from localStorage if available
    const savedWishlist = localStorage.getItem("wishlist");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  // Add item to wishlist
  const addToWishlist = useCallback((product) => {
    setWishlistItems((prevItems) => {
      const exists = prevItems.find((item) => item.id === product.id);
      if (exists) {
        return prevItems;
      }
      return [...prevItems, { ...product, status: "available" }];
    });
  }, []);

  // Remove item from wishlist
  const removeFromWishlist = useCallback((productId) => {
    setWishlistItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  }, []);

  // Toggle wishlist item
  const toggleWishlist = useCallback((product) => {
    setWishlistItems((prevItems) => {
      const exists = prevItems.find((item) => item.id === product.id);
      if (exists) {
        return prevItems.filter((item) => item.id !== product.id);
      } else {
        return [...prevItems, { ...product, status: "available" }];
      }
    });
  }, []);

  // Check if item is in wishlist
  const isInWishlist = useCallback(
    (productId) => {
      return wishlistItems.some((item) => item.id === productId);
    },
    [wishlistItems]
  );

  // Clear entire wishlist
  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
  }, []);

  // Context value
  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
};

export default WishlistContext;
