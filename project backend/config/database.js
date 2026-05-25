import { Sequelize } from "sequelize";


// Create Sequelize instance
const database = new Sequelize("navtech-db", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

const connectDB = async (force = false) => {
  try {
    await database.authenticate();
    console.log("Connection has been established successfully.");

    await database.sync({ force: force });

    if (force) {
      console.log("Database synced with force: true - All tables recreated");
    } else {
      console.log("Database synced with force: false - Tables preserved");
    }

    return true;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    return false;
  }
};

export { database, connectDB };