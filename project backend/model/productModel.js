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
    image: {
      type: DataTypes.STRING,
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
