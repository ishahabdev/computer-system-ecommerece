import express from "express";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import currencyRoutes from "./routes/currencyRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

import { connectDB } from "./config/database.js";

const app = express();
const port = 9000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/v1", userRoutes);
app.use("/v1", currencyRoutes);
app.use("/v1", categoryRoutes);

async function initializeApp() {
  const dbConnected = await connectDB();

  if (!dbConnected) {
    console.error("DB connection failed");
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

initializeApp();