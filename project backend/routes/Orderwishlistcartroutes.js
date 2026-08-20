import express from "express";
import { authMiddleware, adminOnly } from "../middleware/AuthMiddleware.js";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
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
router.post("/orders", authMiddleware, createOrder);
router.get("/orders", authMiddleware, getMyOrders);
router.get("/orders/all", authMiddleware, adminOnly, getAllOrders);
router.get("/orders/:id", authMiddleware, getOrderById);
router.put("/orders/:id/status", authMiddleware, adminOnly, updateOrderStatus);
router.delete("/orders/:id", authMiddleware, deleteOrder);

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