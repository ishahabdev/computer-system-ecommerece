import express from "express";
import {
  loginUser, creatUser, destroyUser, getSigleUsers, getUsers, updateUser,
  requestPasswordReset, resetPassword, verifyResetOtp, changePassword, getMe
} from "../controllers/userController.js";
import { authMiddleware, adminOnly } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/user", creatUser);
router.get("/me", authMiddleware, getMe);
router.post("/forgot-password", requestPasswordReset);
router.post("/verify-code", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.post("/change-password", authMiddleware, changePassword);
// Admin-only user management. authMiddleware verifies the JWT and re-reads the
// account each request; adminOnly rejects anyone whose role isn't "admin". Without
// these, a customer could list, suspend, promote, or delete any account by calling
// the API directly — regardless of what the admin UI hides.
router.get("/users", authMiddleware, adminOnly, getUsers);
router.get("/user/:id", authMiddleware, adminOnly, getSigleUsers);
router.put("/user/:id", authMiddleware, adminOnly, updateUser);
router.delete("/user/:id", authMiddleware, adminOnly, destroyUser);

export default router;