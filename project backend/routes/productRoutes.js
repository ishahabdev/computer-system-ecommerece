import express from "express";

import {
  createProduct,
  getProducts,
  getSingleProduct,
} from "../controllers/productController.js";
import { adminOnly, authMiddleware } from "../middleware/AuthMiddleware.js";
import { uploadProductImage } from "../middleware/UploadMiddleware.js";

const router = express.Router();

// Public catalog reads — the store grid and product detail page.
router.get("/products", getProducts);
router.get("/products/:id", getSingleProduct);

// Admin write. Auth runs BEFORE the upload middleware on purpose: rejecting an
// unauthorised request after multer had already written the file to disk would
// let anyone fill up uploads/ without being able to create a product.
router.post(
  "/admin/products",
  authMiddleware,
  adminOnly,
  uploadProductImage,
  createProduct,
);

export default router;
