// One-off maintenance script: normalize existing product.category values onto the
// five canonical categories used across the storefront and admin form —
//   Mouse, Keyboard, Headphone, Desktop, Laptop
// (see Project Frontend/src/constants/categories.js).
//
// Run once, from the backend directory:
//
//     node scripts/normalizeCategories.js
//
// Safe to re-run: rows already on a canonical value are left alone, and any
// category it doesn't recognize is reported (never guessed at) so you can decide
// what to do with it by hand. Off-list categories (Monitor, Speaker, CPU, …) keep
// working in the dynamic Store; they just won't appear in the nav / home filters.

import { database } from "../config/database.js";
import Product from "../model/productModel.js";

// Conservative, case-insensitive aliases → canonical name. Only obvious synonyms,
// plurals and known typos are mapped; anything else is left for manual review.
const CANONICAL_MAP = {
  // Mouse
  mouse: "Mouse",
  mice: "Mouse",
  mouses: "Mouse",
  "gaming mouse": "Mouse",

  // Keyboard
  keyboard: "Keyboard",
  keyboards: "Keyboard",
  "gaming keyboard": "Keyboard",

  // Headphone
  headphone: "Headphone",
  headphones: "Headphone",
  headset: "Headphone",
  headsets: "Headphone",
  earphone: "Headphone",
  earphones: "Headphone",
  earbud: "Headphone",
  earbuds: "Headphone",
  airbuds: "Headphone",
  airpods: "Headphone",

  // Desktop
  desktop: "Desktop",
  desktops: "Desktop",
  "desktop computer": "Desktop",
  "desktop computers": "Desktop",
  disktop: "Desktop",
  "gaming pc": "Desktop",
  "gaming pcs": "Desktop",
  "custom pc": "Desktop",
  "custom pcs": "Desktop",

  // Laptop
  laptop: "Laptop",
  laptops: "Laptop",
  "gaming laptop": "Laptop",
  "gaming laptops": "Laptop",
  notebook: "Laptop",
  notebooks: "Laptop",
};

// "  Gaming   Laptops " → "gaming laptops" → "Laptop"; null when unrecognized.
const canonicalFor = (raw) => {
  if (typeof raw !== "string") return null;
  const key = raw.trim().toLowerCase().replace(/\s+/g, " ");
  return CANONICAL_MAP[key] || null;
};

const run = async () => {
  try {
    await database.authenticate();
    console.log("Connected to the database.\n");
  } catch (err) {
    console.error("Could not connect to the database:", err.message);
    process.exit(1);
  }

  // The distinct category values currently in the table.
  const rows = await Product.findAll({
    attributes: [
      [database.fn("DISTINCT", database.col("category")), "category"],
    ],
    raw: true,
  });
  const distinct = rows
    .map((row) => row.category)
    .filter((value) => typeof value === "string" && value.length > 0);

  const changes = []; // { from, to, count }
  const unmapped = []; // string[]

  for (const value of distinct) {
    const target = canonicalFor(value);

    if (!target) {
      unmapped.push(value);
      continue;
    }
    // Already exactly canonical — nothing to do.
    if (target === value) continue;

    const [count] = await Product.update(
      { category: target },
      { where: { category: value } },
    );
    changes.push({ from: value, to: target, count });
  }

  console.log("Category normalization complete.\n");

  if (changes.length === 0) {
    console.log("Nothing to change — every category was already canonical.");
  } else {
    console.log("Updated:");
    for (const change of changes) {
      const plural = change.count === 1 ? "row" : "rows";
      console.log(
        `  "${change.from}"  ->  "${change.to}"   (${change.count} ${plural})`,
      );
    }
  }

  if (unmapped.length > 0) {
    console.log(
      "\nLeft unchanged (no canonical match — review these manually):",
    );
    for (const value of unmapped) console.log(`  "${value}"`);
  }

  await database.close();
  process.exit(0);
};

run();
