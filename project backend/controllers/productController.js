import fs from "fs";

import Product from "../model/productModel.js";
import { MAX_IMAGES } from "../middleware/UploadMiddleware.js";

// Newest first, so a freshly added product appears at the top of both the admin
// Products table and the store grid without either side re-sorting.
const NEWEST_FIRST = [["created_at", "DESC"]];

// Multer writes each file to disk before this controller runs, so a submission
// rejected by validation would otherwise leave orphaned images in uploads/.
const discardUploads = (files) => {
  if (!Array.isArray(files)) return;
  files.forEach((file) => {
    if (file?.path) fs.unlink(file.path, () => {});
  });
};

// A gallery is built from uploaded files plus any http(s) URLs typed into the
// form (comma/newline separated). Only well-formed absolute URLs are kept.
const parseImageUrls = (raw) =>
  String(raw ?? "")
    .split(/[\n,]+/)
    .map((value) => value.trim())
    .filter((value) => /^https?:\/\//i.test(value));

// Number("") and Number(" ") are both 0, so an omitted field would silently pass
// a "must be a number" check. Blank is rejected before parsing.
const isBlank = (value) =>
  value === undefined || value === null || String(value).trim() === "";

const asTrimmedString = (value) =>
  typeof value === "string" ? value.trim() : "";

// A multipart form serializes everything as text, so a checkbox arrives as
// "true"/"false"/"on"; a JSON PATCH sends a real boolean. Treat the common
// truthy spellings as true and everything else as false.
const asBool = (value) => {
  if (typeof value === "boolean") return value;
  const v = String(value).trim().toLowerCase();
  return v === "true" || v === "1" || v === "on" || v === "yes";
};

// A deal's optional end date. Blank/absent means "no expiry" (null). Any other
// value must parse to a real date. Returns { value } on success, { error } on a
// malformed date so the caller can fold it into its validation errors.
const parseSaleEndsAt = (raw) => {
  if (isBlank(raw)) return { value: null };
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return { error: "Sale end date is not a valid date" };
  }
  return { value: date };
};

// The merchandising labels the add-product form offers. Anything else stores as
// null (no badge). Kept in step with BADGE_OPTIONS in AddProductModal.jsx.
const ALLOWED_BADGES = ["Best seller", "New arrival", "Limited stock"];
const SKU_MAX_LENGTH = 64;

// Optional SKU: a short admin/warehouse reference. Trimmed; blank -> null. Capped
// so a stray paste can't overflow the column.
const parseSku = (raw) => {
  const value = asTrimmedString(raw);
  if (!value) return { value: null };
  if (value.length > SKU_MAX_LENGTH) {
    return { error: `SKU must be ${SKU_MAX_LENGTH} characters or fewer` };
  }
  return { value };
};

// Optional badge: blank or "None" means no badge (null); otherwise it must be one
// of ALLOWED_BADGES. Matched case-insensitively but stored in its canonical spelling.
const parseBadge = (raw) => {
  const value = asTrimmedString(raw);
  if (!value || value.toLowerCase() === "none") return { value: null };
  const match = ALLOWED_BADGES.find((b) => b.toLowerCase() === value.toLowerCase());
  if (!match) {
    return { error: `Badge must be one of: ${ALLOWED_BADGES.join(", ")}` };
  }
  return { value: match };
};

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

    // Each detail-page visit bumps the view counter that drives the homepage
    // "Most Viewed" ordering. Atomic (UPDATE ... viewCount = viewCount + 1), so
    // concurrent views don't clobber each other. Fire-and-forget for the payload:
    // the detail page doesn't render the count, so the pre-increment value is fine.
    await product.increment("viewCount");

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

    // Optional. 0 (or blank) means "not a deal"; 1–100 lists it in Deals.
    let discountValue = 0;
    if (!isBlank(req.body.discountPercent)) {
      const parsed = Number(req.body.discountPercent);
      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
        errors.push("Discount must be a whole number from 0 to 100");
      } else {
        discountValue = parsed;
      }
    }

    // Optional homepage flags. `featured` surfaces the product under "Handpicked";
    // `saleEndsAt` bounds a deal's run on the Flash Sale section.
    const featuredValue = asBool(req.body.featured);

    let saleEndsAtValue = null;
    const parsedSaleEndsAt = parseSaleEndsAt(req.body.saleEndsAt);
    if (parsedSaleEndsAt.error) errors.push(parsedSaleEndsAt.error);
    else saleEndsAtValue = parsedSaleEndsAt.value;

    // Optional catalog metadata typed on the add-product form.
    const skuResult = parseSku(req.body.sku);
    if (skuResult.error) errors.push(skuResult.error);

    const badgeResult = parseBadge(req.body.badge);
    if (badgeResult.error) errors.push(badgeResult.error);

    if (errors.length > 0) {
      discardUploads(req.files);
      return res.status(400).json({
        success: false,
        message: errors.join(". "),
      });
    }

    // Gallery = uploaded files first, then any pasted http(s) URLs. `req.body.image`
    // is still read so an older single-image client keeps working. Deduped, order
    // preserved, capped at the upload limit. `image` mirrors the first for the
    // single-image consumers (cart, wishlist, admin thumb, store card).
    const uploadedPaths = Array.isArray(req.files)
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];
    const urlImages = [
      ...parseImageUrls(req.body.imageUrls),
      ...parseImageUrls(req.body.image),
    ];
    const images = [...new Set([...uploadedPaths, ...urlImages])].slice(
      0,
      MAX_IMAGES,
    );
    const image = images[0] || null;

    const product = await Product.create({
      name: productName,
      price: priceValue,
      description: asTrimmedString(description) || null,
      image,
      images: images.length > 0 ? images : null,
      category: productCategory,
      stock: stockValue,
      discountPercent: discountValue,
      featured: featuredValue,
      sku: skuResult.value,
      badge: badgeResult.value,
      saleEndsAt: saleEndsAtValue,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    discardUploads(req.files);
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

// UPDATE PRODUCT
// Admin action. The "Manage deal" control only sends discountPercent, but the
// endpoint accepts the same editable fields as create (except images) so a future
// edit form can reuse it. Only fields actually present in the body are touched.
export const updateProduct = async (req, res) => {
  try {
    const productId = Number(req.params.id);
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

    const errors = [];
    const updates = {};

    if ("name" in req.body) {
      const name = asTrimmedString(req.body.name);
      if (!name) errors.push("Name is required");
      else updates.name = name;
    }

    if ("category" in req.body) {
      const category = asTrimmedString(req.body.category);
      if (!category) errors.push("Category is required");
      else updates.category = category;
    }

    if ("price" in req.body) {
      const price = Number(req.body.price);
      if (isBlank(req.body.price) || !Number.isFinite(price) || price < 0) {
        errors.push("Price must be a number of 0 or more");
      } else {
        updates.price = price;
      }
    }

    if ("stock" in req.body) {
      const stock = Number(req.body.stock);
      if (isBlank(req.body.stock) || !Number.isInteger(stock) || stock < 0) {
        errors.push("Stock must be a whole number of 0 or more");
      } else {
        updates.stock = stock;
      }
    }

    if ("discountPercent" in req.body) {
      const pct = Number(req.body.discountPercent);
      if (
        isBlank(req.body.discountPercent) ||
        !Number.isInteger(pct) ||
        pct < 0 ||
        pct > 100
      ) {
        errors.push("Discount must be a whole number from 0 to 100");
      } else {
        updates.discountPercent = pct;
      }
    }

    if ("featured" in req.body) {
      updates.featured = asBool(req.body.featured);
    }

    if ("sku" in req.body) {
      const skuResult = parseSku(req.body.sku);
      if (skuResult.error) errors.push(skuResult.error);
      else updates.sku = skuResult.value;
    }

    if ("badge" in req.body) {
      const badgeResult = parseBadge(req.body.badge);
      if (badgeResult.error) errors.push(badgeResult.error);
      else updates.badge = badgeResult.value;
    }

    // Sent as an ISO string to set an expiry, or null to clear it.
    if ("saleEndsAt" in req.body) {
      const parsed = parseSaleEndsAt(req.body.saleEndsAt);
      if (parsed.error) errors.push(parsed.error);
      else updates.saleEndsAt = parsed.value;
    }

    if ("description" in req.body) {
      updates.description = asTrimmedString(req.body.description) || null;
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join(". "),
      });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    await product.update(updates);

    res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};
