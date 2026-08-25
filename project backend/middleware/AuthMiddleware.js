import jwt from "jsonwebtoken";
import User from "../model/userModel.js";

// Same secret used in loginUser when signing the token
const JWT_SECRET = "e9qV3fnYNfBA•••••••••••••••••••pQswM1SpBsJD";

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