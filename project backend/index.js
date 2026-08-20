import express from "express";
import cors from "cors";
import "dotenv/config";

// 👇 IMPORTANT: User model ko sync se pehle import karein
import userRoutes from "./routes/userRoutes.js";
import { connectDB } from "./config/database.js";
import orderWishlistCartRoutes from "./routes/Orderwishlistcartroutes.js"

const app = express();
const port = 9000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/v1", userRoutes);
app.use("/v1", orderWishlistCartRoutes);


async function initializeApp() {
  const dbConnected = await connectDB();
  if (!dbConnected) process.exit(1);

  app.listen(port, () => console.log(`Server running on port ${port}`));
}

initializeApp();
