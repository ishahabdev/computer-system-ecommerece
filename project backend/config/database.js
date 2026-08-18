  import { Sequelize } from "sequelize";

  const database = new Sequelize("navtech-db", "devuser", "root1234", {
    host: "localhost",
    dialect: "mysql",
    logging: false,
  });

  const connectDB = async (force = false) => {
    try {
      await database.authenticate();
      console.log("Connection has been established successfully.");

await database.sync({ alter: true });
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