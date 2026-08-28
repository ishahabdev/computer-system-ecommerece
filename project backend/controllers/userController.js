import User from "../model/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import otpEmailTemplate from "../utils/otp-email-template.js";
import nodemailer from "nodemailer";
import {
  AUTH_COOKIE_NAME,
  JWT_EXPIRES_IN,
  JWT_SECRET,
  authCookieOptions,
} from "../config/auth.js";
// Temporary in-memory OTP store (production mein Redis/DB better hai)
const otpStore = {};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        status: false,
        message: "Password is required",
      });
    }

    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res.status(400).json({
        status: false,
        message: `User not register with this email:${email}`,
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.json({
        status: false,
        message: `Password is incorrect`,
      });
    }

    // A suspended account must not be able to obtain a fresh token.
    if (user.status === "Suspended") {
      return res.status(403).json({
        status: false,
        message: "Your account has been suspended. Please contact support.",
      });
    }

    const excludePassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(excludePassword, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // The token goes out as an httpOnly cookie for secure transmission, and also
    // in the response body so the frontend can store it in localStorage for
    // accessing protected routes (like the admin analytics dashboard).
    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);

    res.json({
      status: true,
      message: "Login successfully",
      data: excludePassword,
      token: token,
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

// CURRENT USER: re-validates a stored session. Runs behind authMiddleware, so
// reaching this handler already proves the account exists and is not suspended;
// the frontend calls it on load and logs out if it returns 401/403.
export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// CREATE USER (SIGNUP)
export const creatUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🚫 1. Check email already exists
    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.json({
        success: false,
        message: "Email already exists ",
      });
    }

    // 🔐 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 📦 3. Create user
    const user = await User.create({
      ...req.body,
      password: hashedPassword,
    });

    // Return the new account without its password hash.
    const { password: _password, ...safeUser } = user.toJSON();

    res.json({
      success: true,
      message: "User created successfully ",
      data: safeUser,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

// PASSWORD RECOVERY: verifies that an email belongs to a registered user.
// Sending an email/code can be added here when an email provider is configured.
// PASSWORD RECOVERY: verifies email exists, generates OTP, and emails it
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 min

 await transporter.sendMail({
  from: `"YourStore Support" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Your OTP Code",
  html: otpEmailTemplate(otp),   
});

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "internal server error", error: error.message });
  }
};
// PASSWORD RECOVERY: verifies the OTP sent to the user's email
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    const record = otpStore[email];

    if (!record) {
      return res.status(400).json({ success: false, message: "No code found, please resend" });
    }
    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ success: false, message: "Code expired, please resend" });
    }
    if (record.otp !== code) {
      return res.status(400).json({ success: false, message: "Invalid code" });
    }

    record.verified = true; // mark verified so resetPassword can check it
    res.json({ success: true, message: "Code verified" });
  } catch (error) {
    res.status(500).json({ success: false, message: "internal server error" });
  }
};
// PASSWORD RECOVERY: stores a newly hashed password after the client-side demo
// verification code has been checked. Replace that demo check with a server-side
// expiring reset token before using this flow in production.
export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const record = otpStore[email];
    if (!record || !record.verified) {
      return res.status(400).json({ success: false, message: "Please verify the code first" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    delete otpStore[email]; // cleanup
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "internal server error" });
  }
};
// LOGIN & SECURITY: lets a signed-in customer change their own password by
// confirming the current one. Runs behind authMiddleware so the account comes
// from the verified token, never from the request body.
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are both required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Passwords must be at least 8 characters long",
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from your current password",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "internal server error" });
  }
};
// GET ALL USERS
export const getUsers = async (req, res) => {
  try {
    // Never expose password hashes; newest registrations first so freshly
    // signed-up customers appear at the top of the admin Users table.
    const allUsers = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      message: "Retrieved all users successfully",
      data: allUsers,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "network error",
      error: error.message,
    });
  }
};
// GET SINGLE USER
export const getSigleUsers = async (req, res) => {
  try {
    // Never expose the password hash (this route is admin-only, but excluded regardless).
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
    });
  }
};
// UPDATE USER
// Admin action from the Users table (suspend / re-activate, role or name edits).
// Only a small whitelist of fields may change here, so a stray body key can never
// overwrite the password hash, email, or id. We re-read the row afterwards and
// return it, so the caller (and the Network tab) can confirm the change actually
// persisted — a silent no-op is what made suspensions appear to "revert" on refresh.
export const updateUser = async (req, res) => {
  try {
    const ALLOWED_FIELDS = ["name", "role", "status"];
    const ALLOWED_STATUSES = ["Active", "Suspended", "Invited"];

    const updates = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No updatable fields provided (name, role, status).",
      });
    }

    if (updates.status && !ALLOWED_STATUSES.includes(updates.status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status "${updates.status}". Use one of: ${ALLOWED_STATUSES.join(", ")}.`,
      });
    }

    const [affectedRows] = await User.update(updates, {
      where: { id: req.params.id },
    });

    // affectedRows can be 0 when the id doesn't exist OR when the row already
    // held these values. Only the former is an error, so confirm existence.
    if (affectedRows === 0) {
      const exists = await User.findByPk(req.params.id);
      if (!exists) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
    }

    // Return the freshly-read row so the client can trust the persisted status
    // instead of its optimistic guess.
    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
// DELETE USER
export const destroyUser = async (req, res) => {
  try {
    await User.destroy({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
    });
  }
};
