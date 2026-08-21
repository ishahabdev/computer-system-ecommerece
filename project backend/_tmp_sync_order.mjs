import { database } from "./config/database.js";
import Order from "./model/orderModel.js";

await database.authenticate();
await Order.sync({ alter: true });          // scoped to Orders only

const [rows] = await database.query("SHOW COLUMNS FROM Orders WHERE Field='isManuallySet'");
console.log("column now:", JSON.stringify(rows, null, 2));

const [counts] = await database.query(
  "SELECT isManuallySet, COUNT(*) AS n FROM Orders GROUP BY isManuallySet"
);
console.log("existing row values:", JSON.stringify(counts));
await database.close();
