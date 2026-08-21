import express from "express";
import cors from "cors";
import "dotenv/config";

// 👇 IMPORTANT: User model ko sync se pehle import karein
import userRoutes from "./routes/userRoutes.js";
import { connectDB } from "./config/database.js";
import orderWishlistCartRoutes from "./routes/Orderwishlistcartroutes.js"
import { syncActiveOrderStatuses } from "./controllers/OrderController.js";

const app = express();
const port = 9000;

// How often the server re-checks active orders and advances their status.
// Steps are 10 seconds apart, so a 5s tick keeps the stored status at most
// ~5s behind the frontend's live view.
const ORDER_STATUS_SYNC_INTERVAL_MS = 5000;

app.use(cors());
app.use(express.json());

app.get("/v1/debug-routes", (req, res) => {
  res.json({ success: true, message: "current backend code loaded" });
});

// Routes
app.use("/v1", userRoutes);
app.use("/v1", orderWishlistCartRoutes);


// Periodically advance order statuses (packing -> shipping -> on delivery ->
// delivered) so the database reflects the same 10-second-per-step timeline the
// frontend shows, without waiting for someone to fetch the orders.
function startOrderStatusScheduler() {
  let isSyncing = false;

  const runSync = async () => {
    if (isSyncing) return; // avoid overlapping runs if a tick is slow
    isSyncing = true;
    try {
      await syncActiveOrderStatuses();
    } catch (error) {
      console.error("Order status sync failed:", error.message);
    } finally {
      isSyncing = false;
    }
  };

  runSync(); // sync once on startup so stale orders are corrected immediately
  setInterval(runSync, ORDER_STATUS_SYNC_INTERVAL_MS);
}

async function initializeApp() {
  const dbConnected = await connectDB();
  if (!dbConnected) process.exit(1);

  app.listen(port, () => console.log(`Server running on port ${port}`));
  startOrderStatusScheduler();
}

initializeApp();
