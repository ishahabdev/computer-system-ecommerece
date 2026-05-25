import express from "express";

import {
  createCategory,
  getCategories,
  getSingleCategory,
  UpdateCatogory,
  destroyCategory
} from "../controllers/categoryController.js";

const router = express.Router();

router.post("/category", createCategory);

router.get("/categories", getCategories);

router.get("/category/:id", getSingleCategory);
router.put("/category/:id", UpdateCatogory);
router.delete("/category/:id", destroyCategory);


export default router;