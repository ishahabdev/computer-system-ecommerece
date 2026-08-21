import express from "express";
import { sendContactMessage } from "../controllers/contactController.js";

const router = express.Router();

// CONTACT ROUTES (public — visitors do not need an account to write in)
router.post("/contact", sendContactMessage);

export default router;
