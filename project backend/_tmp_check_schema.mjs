
import { database } from "./config/database.js";
const [rows] = await database.query("SHOW COLUMNS FROM Orders");
console.log("Orders columns:\n  " + rows.map(r => `${r.Field} (${r.Type}, null=${r.Null}, default=${r.Default})`).join("\n  "));
await database.close();
