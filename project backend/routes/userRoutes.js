import express from "express";
import {
  loginUser, creatUser, destroyUser, getSigleUsers, getUsers, updateUser,
  requestPasswordReset, resetPassword, verifyResetOtp, changePassword
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/user", creatUser);
router.post("/forgot-password", requestPasswordReset);
router.post("/verify-code", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.post("/change-password", authMiddleware, changePassword);
router.get("/users", getUsers);
router.get("/user/:id", getSigleUsers);
router.put("/user/:id", updateUser);
router.delete("/user/:id", destroyUser);

export default router;