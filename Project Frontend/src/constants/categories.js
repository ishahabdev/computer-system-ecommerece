// The single, canonical product taxonomy for the whole storefront.
//
// Before this existed, categories were hardcoded independently in the navbar, the
// search-bar filter, the homepage category chips, and the admin add-product form —
// with typos ("Disktop", "Moniter") and plurals ("Mouses") that never matched each
// other or the data. Everything that offers a category choice now imports THIS list,
// so the navbar, homepage filter, and admin form can never drift apart again.
//
// Plain strings on purpose: any icons a surface wants (e.g. the homepage chips) are
// mapped locally there, since icons are JSX and only that surface needs them. The
// backend `products.category` column is free text; a one-off script
// (project backend/scripts/normalizeCategories.js) remaps existing rows onto these.
export const PRODUCT_CATEGORIES = [
  "Mouse",
  "Keyboard",
  "Headphone",
  "Desktop",
  "Laptop",
];
