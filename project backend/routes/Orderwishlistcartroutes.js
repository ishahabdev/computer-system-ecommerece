import express from "express";
import { authMiddleware, adminOnly } from "../middleware/AuthMiddleware.js";

import {
  cancelOrder,
  createOrder,
  deleteOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  trackOrder,
  updateOrderStatus,
} from "../controllers/OrderController.js";

import {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
} from "../controllers/WhislistController.js";

import {
  addToCart,
  getMyCart,
  updateCartItem,
  removeFromCart,
} from "../controllers/CartController.js";

const router = express.Router();

// ORDER ROUTES
router.get("/track-order/:trackingId", trackOrder);
router.post("/orders", authMiddleware, createOrder);
router.get("/orders", authMiddleware, getMyOrders);
router.get("/orders/all", authMiddleware, adminOnly, getAllOrders);
router.get("/orders/track/:trackingId", trackOrder);
router.get("/orders/:id", authMiddleware, getOrderById);
router.delete("/orders/:id", authMiddleware, deleteOrder);
router.put("/orders/:id/cancel", authMiddleware, cancelOrder);
router.put("/orders/:id/status", authMiddleware, adminOnly, updateOrderStatus);

// WISHLIST ROUTES
router.post("/wishlist", authMiddleware, addToWishlist);
router.get("/wishlist", authMiddleware, getMyWishlist);
router.delete("/wishlist/:id", authMiddleware, removeFromWishlist);

// CART ROUTES
router.post("/cart", authMiddleware, addToCart);
router.get("/cart", authMiddleware, getMyCart);
router.put("/cart/:id", authMiddleware, updateCartItem);
router.delete("/cart/:id", authMiddleware, removeFromCart);

export default router;
