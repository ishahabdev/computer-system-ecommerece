import fs from "fs";

import Product from "../model/productModel.js";

// Newest first, so a freshly added product appears at the top of both the admin
// Products table and the store grid without either side re-sorting.
const NEWEST_FIRST = [["created_at", "DESC"]];

// Multer writes the file to disk before this controller runs, so a submission
// rejected by validation would otherwise leave an orphaned image in uploads/.
const discardUpload = (file) => {
  if (!file) return;
  fs.unlink(file.path, () => {});
};

// Number("") and Number(" ") are both 0, so an omitted field would silently pass
// a "must be a number" check. Blank is rejected before parsing.
const isBlank = (value) =>
  value === undefined || value === null || String(value).trim() === "";

const asTrimmedString = (value) =>
  typeof value === "string" ? value.trim() : "";

// GET ALL PRODUCTS
// Public: the store grid reads this. Returns newest-first.
export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ order: NEWEST_FIRST });

    res.json({
      success: true,
      message: "Retrieved all products successfully",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

// GET SINGLE PRODUCT
// Public: the product detail page reads this for database-backed products.
export const getSingleProduct = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    // Guard before querying: a non-numeric id would otherwise reach MySQL and
    // come back as a 500 rather than an honest 404.
    if (!Number.isInteger(productId) || productId < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

// CREATE PRODUCT
// Admin action from the Products tab. Runs behind authMiddleware + adminOnly, and
// behind the multer middleware that turns an uploaded file into req.file.
//
// Every value reaches MySQL through Sequelize's bind parameters, so nothing here
// is interpolated into SQL text.
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock } = req.body;

    const errors = [];

    const productName = asTrimmedString(name);
    if (!productName) errors.push("Name is required");

    const productCategory = asTrimmedString(category);
    if (!productCategory) errors.push("Category is required");

    const priceValue = Number(price);
    if (isBlank(price) || !Number.isFinite(priceValue) || priceValue < 0) {
      errors.push("Price must be a number of 0 or more");
    }

    const stockValue = Number(stock);
    if (isBlank(stock) || !Number.isInteger(stockValue) || stockValue < 0) {
      errors.push("Stock must be a whole number of 0 or more");
    }

    if (errors.length > 0) {
      discardUpload(req.file);
      return res.status(400).json({
        success: false,
        message: errors.join(". "),
      });
    }

    // An uploaded file wins; otherwise accept an image URL typed into the form so
    // the admin can point at a remote image instead of uploading one.
    const image = req.file
      ? `/uploads/${req.file.filename}`
      : asTrimmedString(req.body.image) || null;

    const product = await Product.create({
      name: productName,
      price: priceValue,
      description: asTrimmedString(description) || null,
      image,
      category: productCategory,
      stock: stockValue,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    discardUpload(req.file);
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};
