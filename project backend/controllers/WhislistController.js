import Wishlist from "../model/whislistModel.js";

// ADD TO WISHLIST
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required",
      });
    }

    const existing = await Wishlist.findOne({
      where: { userId: req.user.id, productId },
    });

    if (existing) {
      return res.json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    const item = await Wishlist.create({
      userId: req.user.id,
      productId,
    });

    res.json({
      success: true,
      message: "Added to wishlist",
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

// GET MY WISHLIST
export const getMyWishlist = async (req, res) => {
  try {
    const items = await Wishlist.findAll({
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

// REMOVE FROM WISHLIST
export const removeFromWishlist = async (req, res) => {
  try {
    await Wishlist.destroy({
      where: { id: req.params.id, userId: req.user.id },
    });

    res.json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};