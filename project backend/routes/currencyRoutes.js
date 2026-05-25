import express from "express";
import {
  createCurrency,
  getCurrencies,
  getCurrency,
  updateCurrency,
  deleteCurrency,
} from "../controllers/currencyController.js";

const router = express.Router();

router.post("/currency",createCurrency);
router.get("/currencies", getCurrencies);
router.get("/currencies/:id", getCurrency);
router.put("/currencies/:id", updateCurrency);
router.delete("/currencies/:id", deleteCurrency);

export default router;