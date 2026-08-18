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
    type: DataTypes.ENUM("pending", "confirmed", "shipped", "delivered", "cancelled"),
    allowNull: false,
    defaultValue: "pending",
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

// One user can have many orders
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

export default Order;