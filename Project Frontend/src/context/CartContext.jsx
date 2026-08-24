  import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
  } from "react";
  import { useAuth } from "./AuthContext";

  const API_BASE_URL = "http://localhost:9000/v1";
  const CART_STORAGE_KEY = "cart";
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
  const CartContext = createContext();

  const getStoredCart = () => {
    try {
      return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };
  };

  const getDatabaseProductId = (productId) =>
    LEGACY_PRODUCT_IDS[productId] || productId;

  export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
  };

  export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState(getStoredCart);
    const [isCartLoading, setIsCartLoading] = useState(false);

    const request = useCallback(async (path, options = {}) => {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: { ...getAuthHeaders(), ...options.headers },
      });
      const data = await response.json().catch(() => ({}));

      // A rejected token (expired) or a suspended account fails auth. Tell
      // AuthContext to end the session so a suspended user can't keep shopping.
      if (response.status === 401 || response.status === 403) {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }

      if (!response.ok || data.success === false || data.status === false) {
        throw new Error(data.message || "Cart request failed");
      }
      return data;
    }, []);

    // The API only stores productId and quantity. Keep product display details
    // from local storage and attach the database cart-item id for later updates.
    useEffect(() => {
      if (!isAuthenticated || !localStorage.getItem(AUTH_TOKEN_KEY)) return;

      let cancelled = false;
      const loadCart = async () => {
        setIsCartLoading(true);
        try {
          const data = await request("/cart");
          const storedItems = getStoredCart();
          const databaseItems = Array.isArray(data.data) ? data.data : [];
          const mergedItems = databaseItems.map((databaseItem) => {
            const savedItem = storedItems.find(
              (item) => String(item.id) === String(databaseItem.productId)
            );
            return {
              ...(savedItem || {
                id: databaseItem.productId,
                title: `Product #${databaseItem.productId}`,
                price: 0,
                currency: "$",
              }),
              qty: databaseItem.quantity,
              cartItemId: databaseItem.id,
            };
          });

          if (!cancelled) setCartItems(mergedItems);
        } catch (error) {
          console.error("Cart database load failed:", error);
        } finally {
          if (!cancelled) setIsCartLoading(false);
        }
      };

      loadCart();
      return () => {
        cancelled = true;
      };
    }, [isAuthenticated, request]);

    useEffect(() => {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = useCallback(
      async (product, quantity = 1) => {
        const productId = getDatabaseProductId(product.id);
        const cartProduct = { ...product, id: productId };
        const existingItem = cartItems.find((item) => item.id === productId);
        setCartItems((items) =>
          existingItem
            ? items.map((item) =>
                item.id === productId
                  ? { ...item, ...cartProduct, qty: item.qty + quantity }
                  : item
              )
            : [...items, { ...cartProduct, qty: quantity }]
        );

        if (!isAuthenticated) return;

        try {
          const data = await request("/cart", {
            method: "POST",
            body: JSON.stringify({ productId, quantity }),
          });
          const databaseItem = data.data;

          if (databaseItem?.id) {
            setCartItems((items) =>
              items.map((item) =>
              item.id === productId
                  ? { ...item, qty: databaseItem.quantity, cartItemId: databaseItem.id }
                  : item
              )
            );
          }
        } catch (error) {
          console.error("Cart database save failed:", error);
        }
      },
      [cartItems, isAuthenticated, request]
    );

    const removeFromCart = useCallback(
      async (productId) => {
        const item = cartItems.find((cartItem) => cartItem.id === productId);
        setCartItems((items) => items.filter((cartItem) => cartItem.id !== productId));

        if (!isAuthenticated || !item?.cartItemId) return;
        try {
          await request(`/cart/${item.cartItemId}`, { method: "DELETE" });
        } catch (error) {
          console.error("Cart database delete failed:", error);
        }
      },
      [cartItems, isAuthenticated, request]
    );

    const updateQuantity = useCallback(
      async (productId, quantity) => {
        if (quantity <= 0) {
          await removeFromCart(productId);
          return;
        }

        const item = cartItems.find((cartItem) => cartItem.id === productId);
        setCartItems((items) =>
          items.map((cartItem) =>
            cartItem.id === productId ? { ...cartItem, qty: quantity } : cartItem
          )
        );

        if (!isAuthenticated || !item?.cartItemId) return;
        try {
          await request(`/cart/${item.cartItemId}`, {
            method: "PUT",
            body: JSON.stringify({ quantity }),
          });
        } catch (error) {
          console.error("Cart database quantity update failed:", error);
        }
      },
      [cartItems, isAuthenticated, removeFromCart, request]
    );

    const clearCart = useCallback(async () => {
      const items = [...cartItems];
      setCartItems([]);
      if (!isAuthenticated) return;

      await Promise.all(
        items
          .filter((item) => item.cartItemId)
          .map((item) => request(`/cart/${item.cartItemId}`, { method: "DELETE" }))
      ).catch((error) => console.error("Cart database clear failed:", error));
    }, [cartItems, isAuthenticated, request]);

    const getCartSummary = useCallback(() => {
      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
      const shippingFee = subtotal > 50 ? 0 : 20;
      return {
        itemCount: cartItems.length,
        totalItems: cartItems.reduce((sum, item) => sum + item.qty, 0),
        subtotal: Math.round(subtotal * 100) / 100,
        shippingFee,
        total: Math.round((subtotal + shippingFee) * 100) / 100,
      };
    }, [cartItems]);

    return (
      <CartContext.Provider
        value={{
          cartItems,
          isCartLoading,
          addToCart,
          removeFromCart,
          updateQuantity,
          clearCart,
          getCartSummary,
        }}
      >
        {children}
      </CartContext.Provider>
    );
  };

  export default CartContext;
