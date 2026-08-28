import jwt from "jsonwebtoken";
import User from "../model/userModel.js";
// FIX: Previously this file hardcoded its own JWT_SECRET string, separate from
// the one loginUser (authController.js) imports from config/auth.js. Any drift
// between the two (a stale hardcoded copy vs. an updated/env-driven value)
// means every freshly-issued token fails verification here with "invalid
// signature" — which is exactly the "login succeeds, then instantly logs out"
// bug. Importing the single shared secret makes that class of bug impossible.
import { JWT_SECRET } from "../config/auth.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please login.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    // The token only proves who signed in; account state can change after it was
    // issued (suspended, deleted, role changed). Re-read the row every request so
    // a suspension takes effect immediately instead of when the 2-day token expires.
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        code: "ACCOUNT_NOT_FOUND",
        message: "Account no longer exists. Please login again.",
      });
    }

    if (user.status === "Suspended") {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_SUSPENDED",
        message: "Your account has been suspended. Please contact support.",
      });
    }

    // Fresh row so downstream (e.g. adminOnly) always reads the current role/status.
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please login again.",
      error: error.message,
    });
  }
};

// Use after authMiddleware on routes that only admin should access
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  }
  next();
};