import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

const API_BASE_URL = "http://localhost:9000/v1";
const WISHLIST_STORAGE_RESOURCE = "wishlist";
const AUTH_TOKEN_KEY = "authToken";
const LEGACY_PRODUCT_IDS = {
  "flash-1": 10001,
  "flash-2": 10002,
  "flash-3": 10003,
  "flash-4": 10004,
  "viewed-1": 11001,
  "viewed-2": 11002,
  "viewed-3": 11003,
  "viewed-4": 11004,
  "viewed-5": 11005,
  "viewed-6": 11006,
  "viewed-7": 11007,
  "viewed-8": 11008,
};

const WishlistContext = createContext();

const getWishlistStorageKey = (user) => {
  const identifier = user?.id || user?._id || user?.email;
  return identifier ? `${WISHLIST_STORAGE_RESOURCE}:${String(identifier).toLowerCase()}` : WISHLIST_STORAGE_RESOURCE;
};

const getStoredWishlist = (user) => {
  try {
    return JSON.parse(localStorage.getItem(getWishlistStorageKey(user)) || "[]");
  } catch {
    return [];
  }
};

const getDatabaseProductId = (productId) => LEGACY_PRODUCT_IDS[productId] || productId;

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const request = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false || data.status === false) {
      throw new Error(data.message || "Wishlist request failed");
    }
    return data;
  }, []);

  useEffect(() => {
    setWishlistItems(getStoredWishlist(user));
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated || !localStorage.getItem(AUTH_TOKEN_KEY)) return;

    let cancelled = false;
    const loadWishlist = async () => {
      setIsWishlistLoading(true);
      try {
        const data = await request("/wishlist");
        const savedItems = getStoredWishlist(user);
        const databaseItems = Array.isArray(data.data) ? data.data : [];
        const mergedItems = databaseItems.map((databaseItem) => {
          const savedItem = savedItems.find(
            (item) => String(getDatabaseProductId(item.id)) === String(databaseItem.productId)
          );

          return {
            ...(savedItem || {
              id: databaseItem.productId,
              title: `Product #${databaseItem.productId}`,
              price: 0,
              currency: "$",
            }),
            id: databaseItem.productId,
            wishlistItemId: databaseItem.id,
            status: "available",
          };
        });

        if (!cancelled) setWishlistItems(mergedItems);
      } catch (error) {
        console.error("Wishlist database load failed:", error);
      } finally {
        if (!cancelled) setIsWishlistLoading(false);
      }
    };

    loadWishlist();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, request, user]);

  useEffect(() => {
    localStorage.setItem(getWishlistStorageKey(user), JSON.stringify(wishlistItems));
  }, [user, wishlistItems]);

  const addToWishlist = useCallback(
    async (product) => {
      const productId = getDatabaseProductId(product.id);
      const existingItem = wishlistItems.find((item) => item.id === productId);
      if (existingItem) return;

      setWishlistItems((items) => [
        ...items,
        { ...product, id: productId, status: "available" },
      ]);

      if (!isAuthenticated) return;
      try {
        const data = await request("/wishlist", {
          method: "POST",
          body: JSON.stringify({ productId }),
        });

        if (data.data?.id) {
          setWishlistItems((items) =>
            items.map((item) =>
              item.id === productId ? { ...item, wishlistItemId: data.data.id } : item
            )
          );
        }
      } catch (error) {
        console.error("Wishlist database save failed:", error);
      }
    },
    [isAuthenticated, request, wishlistItems]
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      const normalizedProductId = getDatabaseProductId(productId);
      const item = wishlistItems.find((wishlistItem) => wishlistItem.id === normalizedProductId);
      setWishlistItems((items) =>
        items.filter((wishlistItem) => wishlistItem.id !== normalizedProductId)
      );

      if (!isAuthenticated || !item?.wishlistItemId) return;
      try {
        await request(`/wishlist/${item.wishlistItemId}`, { method: "DELETE" });
      } catch (error) {
        console.error("Wishlist database delete failed:", error);
      }
    },
    [isAuthenticated, request, wishlistItems]
  );

  const toggleWishlist = useCallback(
    async (product) => {
      const productId = getDatabaseProductId(product.id);
      const exists = wishlistItems.some((item) => item.id === productId);
      if (exists) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist({ ...product, id: productId });
      }
    },
    [addToWishlist, removeFromWishlist, wishlistItems]
  );

  const isInWishlist = useCallback(
    (productId) =>
      wishlistItems.some((item) => item.id === getDatabaseProductId(productId)),
    [wishlistItems]
  );

  const clearWishlist = useCallback(async () => {
    const items = [...wishlistItems];
    setWishlistItems([]);
    if (!isAuthenticated) return;

    await Promise.all(
      items
        .filter((item) => item.wishlistItemId)
        .map((item) => request(`/wishlist/${item.wishlistItemId}`, { method: "DELETE" }))
    ).catch((error) => console.error("Wishlist database clear failed:", error));
  }, [isAuthenticated, request, wishlistItems]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isWishlistLoading,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;
