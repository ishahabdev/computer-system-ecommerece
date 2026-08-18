import Order from "../model/orderModel.js";
import User from "../model/userModel.js";

// CREATE ORDER (customer places an order at checkout)
export const createOrder = async (req, res) => {
  try {
    const { products, totalAmount, address } = req.body;

    if (!products || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "products and totalAmount are required",
      });
    }

    const order = await Order.create({
      userId: req.user.id, // comes from the verified token, not from frontend
      products,
      totalAmount,
      address,
    });

    res.json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

// GET MY ORDERS (customer sees only their own orders - track order page)
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

// GET SINGLE ORDER (order confirm page) - only if it belongs to the logged-in user
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

// GET ALL ORDERS (admin only - sees every customer's orders with their name/email)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: {
        model: User,
        attributes: ["id", "name", "email"],
      },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

// UPDATE ORDER STATUS (admin only - pending -> confirmed -> shipped -> delivered)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    await Order.update(
      { status },
      { where: { id: req.params.id } }
    );

    res.json({
      success: true,
      message: "Order status updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};