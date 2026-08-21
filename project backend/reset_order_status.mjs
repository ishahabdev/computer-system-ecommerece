import Order from "./model/orderModel.js";
import { database } from "./config/database.js";

// Correct 10-minute-per-step rule (must match OrderController.getLiveOrderStatus).
const liveStatus = (createdAt) => {
  const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60));
  if (minutes >= 30) return "delivered";
  if (minutes >= 20) return "on delivery";
  if (minutes >= 10) return "shipping";
  return "packing";
};

await database.authenticate();

const orders = await Order.findAll({ order: [["id", "ASC"]] });
let changed = 0;

for (const order of orders) {
  // Never touch user-cancelled orders.
  if (order.status === "cancelled") continue;

  const correct = liveStatus(order.createdAt);
  if (order.status !== correct) {
    const minutes = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60));
    console.log(
      `Order #${order.id}: ${minutes} min old  |  '${order.status}' -> '${correct}'`
    );
    order.status = correct;
    await order.save();
    changed += 1;
  }
}

console.log(`\nDone. Re-synced ${changed} order(s) to the correct 10-min-per-step timeline.`);
process.exit(0);
