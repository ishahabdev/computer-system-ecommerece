import express from "express";

import {
  createProduct,
  deleteProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
} from "../controllers/productController.js";
import { adminOnly, authMiddleware } from "../middleware/AuthMiddleware.js";
import { uploadProductImages } from "../middleware/UploadMiddleware.js";

const router = express.Router();

// Public catalog reads — the store grid and product detail page.
router.get("/products", getProducts);
router.get("/products/:id", getSingleProduct);

// Admin write. Auth runs BEFORE the upload middleware on purpose: rejecting an
// unauthorised request after multer had already written the files to disk would
// let anyone fill up uploads/ without being able to create a product.
router.post(
  "/admin/products",
  authMiddleware,
  adminOnly,
  uploadProductImages,
  createProduct,
);

// Admin update (currently the "Manage deal" discount control). JSON body, so no
// upload middleware — the global express.json() parser handles it.
router.patch("/admin/products/:id", authMiddleware, adminOnly, updateProduct);

// Admin delete — used by the Products table's bulk-selection toolbar. A
// multi-select delete calls this once per id from the client.
router.delete("/admin/products/:id", authMiddleware, adminOnly, deleteProduct);

export default router;
