import { DataTypes } from "sequelize";

import { database } from "../config/database.js";

const User = database.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Account role and lifecycle state, shown in the admin Users table. New
  // signups default to a standard active customer account.
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "User",
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Active",
  },

}, {
  timestamps: true,
});

export default User;