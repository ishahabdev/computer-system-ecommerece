import User from "../model/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";




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

    const excludePassword = {
      id: user.id,
      name: user.name,
      
      email: user.email,
      
    };

    const token = await jwt.sign(
      excludePassword,
      "e9qV3fnYNfBA•••••••••••••••••••pQswM1SpBsJD",
      { expiresIn: "2d" },
    );

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

    res.json({
      success: true,
      message: "User created successfully ",
      data: user,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};
// GET ALL USERS
export const getUsers = async (req, res) => {
  try {
    const allUsers = await User.findAll();

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
    const user = await User.findByPk(req.params.id);

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
export const updateUser = async (req, res) => {
  try {
    await User.update(req.body, {
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: "User updated successfully",
    
    });
  } catch (error) {
    res.json({
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