import { DataTypes } from "sequelize";
import { database } from "../config/database.js";

const categoryModel = database.define("category", {
  
  CategoryName: {
    type: DataTypes.STRING,
    allowNull: false,
  },

});

export default categoryModel;