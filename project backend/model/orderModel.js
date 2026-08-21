import { DataTypes } from "sequelize";

import { database } from "../config/database.js";
import User from "./userModel.js";

const Order = database.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  products: {
    // Stores an array of items, e.g:
    // [{ productId: 1, name: "Shoes", quantity: 2, price: 1500 }]
    type: DataTypes.JSON,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      "pending",
      "packing",
      "confirmed",
      "shipping",
      "shipped",
      "on delivery",
      "delivered",
      "cancelled"
    ),
    allowNull: false,
    defaultValue: "packing",
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Set when an admin changes the status by hand, or when the customer
  // cancels. The background scheduler skips these rows so the 10-minute
  // simulation can't overwrite a deliberate choice.
  // NOT NULL with a default matters: a nullable column would leave every
  // pre-existing row NULL, and `WHERE isManuallySet = false` never matches
  // NULL, so the scheduler would silently skip all existing orders.
  isManuallySet: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  timestamps: true,
});

// One user can have many orders
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

export default Order;
