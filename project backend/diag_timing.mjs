import Order from "./model/orderModel.js";
import User from "./model/userModel.js";
import { database } from "./config/database.js";

// Same logic as the controller's getLiveOrderStatus (10-min steps).
const compute = (createdAt) => {
  const orderDate = new Date(createdAt);
  const minutes = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60));
  let status = "packing";
  if (minutes >= 30) status = "delivered";
  else if (minutes >= 20) status = "on delivery";
  else if (minutes >= 10) status = "shipping";
  return { minutes, status };
};

await database.authenticate();

console.log("Node local time :", new Date().toString());
console.log("Node getTimezoneOffset(min):", new Date().getTimezoneOffset());

// --- Newest existing order ---
const newest = await Order.findOne({ order: [["createdAt", "DESC"]] });
if (newest) {
  const c = compute(newest.createdAt);
  console.log("\n=== Newest existing order ===");
  console.log({
    id: newest.id,
    storedStatus: newest.status,
    createdAtISO: new Date(newest.createdAt).toISOString(),
    minutesSinceOrder: c.minutes,
    computedStatus: c.status,
  });
}

// --- Fresh round-trip test: create now, read back, elapsed should be ~0 ---
const anyUser = await User.findOne();
if (!anyUser) {
  console.log("\nNo users found; skipping round-trip test.");
  process.exit(0);
}

const test = await Order.create({
  userId: anyUser.id,
  products: [{ name: "DIAG_TEST", quantity: 1, price: 1 }],
  totalAmount: 1,
  address: "DIAG_TEST",
  status: "packing",
});

const reread = await Order.findByPk(test.id);
const rt = compute(reread.createdAt);
console.log("\n=== Fresh round-trip (createdAt should read as 'now', minutes ~0) ===");
console.log({
  id: reread.id,
  createdAtISO: new Date(reread.createdAt).toISOString(),
  nowISO: new Date().toISOString(),
  minutesSinceOrder: rt.minutes,
  computedStatus: rt.status,
  VERDICT: rt.minutes === 0 ? "OK (no timezone offset)" : `OFFSET of ~${rt.minutes} min -> TIMEZONE BUG`,
});

// cleanup
await Order.destroy({ where: { id: test.id } });
console.log("\nCleaned up test order id", test.id);
process.exit(0);
