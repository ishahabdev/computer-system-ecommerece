import { DataTypes } from "sequelize";

import { database } from "../config/database.js";

// Catalog products added from the admin dashboard. The table is named `products`
// and its timestamp column `created_at` so the ORDER BY that puts new products at
// the top of the store reads the same in phpMyAdmin as it does here.
const Product = database.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // DECIMAL rather than FLOAT: money must not accumulate binary rounding error.
    // Note mysql2 hands DECIMAL back as a string, so callers parse before doing math.
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Stores a path such as "/uploads/product-123.webp" for an uploaded file, or a
    // full remote URL when the admin pastes one instead. Never the image bytes.
    // This is the PRIMARY image (images[0]); kept as its own column so the single
    // consumers (admin thumb, cart, wishlist, store card) don't have to parse JSON.
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // The full ordered gallery: an array of the same path/URL strings as `image`.
    // The product detail page reads this; `image` mirrors images[0]. Nullable so
    // rows created before this column existed simply fall back to [image].
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    // 0 means "not a deal". Anything 1–100 lists the product in the Deals page and
    // drives the struck-through original price / "-N%" badge. `price` stays the
    // list price; the store computes the sale price from this percentage.
    discountPercent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0, max: 100 },
    },
    // Marks a product for the homepage "Handpicked by our techies" section, set
    // from the admin Products table. The store grid and Deals page ignore it.
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // Optional stock-keeping unit — a human/warehouse reference (e.g. "HP-BT-001")
    // typed on the add-product form. Free text and nullable: not every product has
    // one, and the store never looks a product up by it, so it isn't unique-constrained.
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Optional merchandising label shown on the product card — one of a small fixed
    // set ("Best seller" / "New arrival" / "Limited stock"). null = no badge. Kept as
    // free text (the allowed set is enforced in the controller) so adding another
    // label later doesn't need a migration.
    badge: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Optional expiry for a deal (paired with discountPercent). null = the deal
    // has no end date. The homepage Flash Sale shows a deal only while this is
    // null or still in the future; the Deals page itself ignores it.
    saleEndsAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Incremented on each product-detail fetch; drives the homepage "Most Viewed"
    // ordering. Not shown on the product page itself.
    viewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "products",
    // Only a creation timestamp is meaningful for the catalog ordering, so the
    // default updatedAt column is turned off rather than left unused.
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

export default Product;
