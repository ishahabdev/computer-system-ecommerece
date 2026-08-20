import express from "express";
import {
  loginUser, creatUser, destroyUser, getSigleUsers, getUsers, updateUser,
  requestPasswordReset, resetPassword, verifyResetOtp
} from "../controllers/userController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/user", creatUser);
router.post("/forgot-password", requestPasswordReset);
router.post("/verify-code", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.get("/users", getUsers);
router.get("/user/:id", getSigleUsers);
router.put("/user/:id", updateUser);
router.delete("/user/:id", destroyUser);

export default router;