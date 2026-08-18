import Cart from "../model/cartModel.js";

// ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required",
      });
    }

    // if product already in cart, just increase quantity instead of duplicating
    const existing = await Cart.findOne({
      where: { userId: req.user.id, productId },
    });

    if (existing) {
      existing.quantity += quantity || 1;
      await existing.save();

      return res.json({
        success: true,
        message: "Cart updated",
        data: existing,
      });
    }

    const item = await Cart.create({
      userId: req.user.id,
      productId,
      quantity: quantity || 1,
    });

    res.json({
      success: true,
      message: "Added to cart ",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

// GET MY CART
export const getMyCart = async (req, res) => {
  try {
    const items = await Cart.findAll({
      where: { userId: req.user.id },
    });

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

// UPDATE CART ITEM QUANTITY
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    await Cart.update(
      { quantity },
      { where: { id: req.params.id, userId: req.user.id } }
    );

    res.json({
      success: true,
      message: "Cart item updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

// REMOVE FROM CART
export const removeFromCart = async (req, res) => {
  try {
    await Cart.destroy({
      where: { id: req.params.id, userId: req.user.id },
    });

    res.json({
      success: true,
      message: "Removed from cart",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};