// Mock Product Database
export const PRODUCTS = [
  // Mouses
  {
    id: 1,
    title: "Razer Mamba Tournament Edition",
    category: "Mouses",
    price: 999,
    currency: "$",
    image: "🖱️",
    description: "High-performance gaming mouse with 16,000 DPI sensor",
    stock: 15,
  },
  {
    id: 2,
    title: "Logitech MX Master 3S",
    category: "Mouses",
    price: 1199,
    currency: "$",
    image: "🖱️",
    description: "Advanced wireless mouse for professionals",
    stock: 20,
  },
  {
    id: 3,
    title: "SteelSeries Rival 600",
    category: "Mouses",
    price: 899,
    currency: "$",
    image: "🖱️",
    description: "Ergonomic gaming mouse with dual sensors",
    stock: 12,
  },
  {
    id: 4,
    title: "Corsair M65 Elite RGB",
    category: "Mouses",
    price: 1299,
    currency: "$",
    image: "🖱️",
    description: "Premium gaming mouse with CUE software",
    stock: 10,
  },

  // Keyboards
  {
    id: 5,
    title: "Corsair K95 Platinum XT",
    category: "Keyboards",
    price: 2799,
    currency: "$",
    image: "⌨️",
    description: "Mechanical RGB gaming keyboard with macro keys",
    stock: 8,
  },
  {
    id: 6,
    title: "SteelSeries Apex Pro",
    category: "Keyboards",
    price: 2499,
    currency: "$",
    image: "⌨️",
    description: "Adjustable mechanical gaming keyboard",
    stock: 14,
  },
  {
    id: 7,
    title: "Razer DeathStalker V2",
    category: "Keyboards",
    price: 2199,
    currency: "$",
    image: "⌨️",
    description: "Ultra-thin gaming keyboard with low-profile switches",
    stock: 11,
  },
  {
    id: 8,
    title: "ASUS ROG Strix Scope II",
    category: "Keyboards",
    price: 1999,
    currency: "$",
    image: "⌨️",
    description: "Compact gaming keyboard with RGB lighting",
    stock: 16,
  },

  // Laptops
  {
    id: 9,
    title: "Lenovo Legion 5 Pro",
    category: "Laptop",
    price: 89999,
    currency: "$",
    image: "💻",
    description: "High-performance gaming laptop with RTX 3070",
    stock: 5,
  },
  {
    id: 10,
    title: "ASUS ROG Zephyrus G14",
    category: "Laptop",
    price: 124999,
    currency: "$",
    image: "💻",
    description: "Ultra-portable gaming laptop with RTX 3060",
    stock: 7,
  },
  {
    id: 11,
    title: "MSI GE76 Raider",
    category: "Laptop",
    price: 134999,
    currency: "$",
    image: "💻",
    description: "Premium gaming laptop with RTX 3080",
    stock: 4,
  },
  {
    id: 12,
    title: "Dell XPS 15",
    category: "Laptop",
    price: 154999,
    currency: "$",
    image: "💻",
    description: "Professional workstation with NVIDIA RTX GPU",
    stock: 6,
  },

  // Monitors
  {
    id: 13,
    title: "LG 27GP850",
    category: "Monitor",
    price: 24999,
    currency: "$",
    image: "🖥️",
    description: "27 inch 144Hz IPS gaming monitor",
    stock: 18,
  },
  {
    id: 14,
    title: "ASUS ROG Swift PG27UQ",
    category: "Monitor",
    price: 32999,
    currency: "$",
    image: "🖥️",
    description: "27 inch 144Hz 4K gaming monitor with HDR",
    stock: 9,
  },
  {
    id: 15,
    title: "Dell S2721DGF",
    category: "Monitor",
    price: 22999,
    currency: "$",
    image: "🖥️",
    description: "27 inch 165Hz VA gaming monitor",
    stock: 13,
  },
  {
    id: 16,
    title: "BenQ SW270C",
    category: "Monitor",
    price: 42999,
    currency: "$",
    image: "🖥️",
    description: "Professional 27 inch color-accurate monitor",
    stock: 7,
  },

  // Headphones
  {
    id: 17,
    title: "SteelSeries Arctis Pro",
    category: "Headphones",
    price: 1999,
    currency: "$",
    image: "🎧",
    description: "Wireless gaming headset with 2.4GHz",
    stock: 19,
  },
  {
    id: 18,
    title: "Corsair HS80 RGB",
    category: "Headphones",
    price: 1799,
    currency: "$",
    image: "🎧",
    description: "Wireless multi-platform gaming headset",
    stock: 14,
  },
  {
    id: 19,
    title: "Razer BlackShark V2",
    category: "Headphones",
    price: 1599,
    currency: "$",
    image: "🎧",
    description: "Esports gaming headset with THX audio",
    stock: 17,
  },
  {
    id: 20,
    title: "ASUS ROG Delta S",
    category: "Headphones",
    price: 1899,
    currency: "$",
    image: "🎧",
    description: "Wireless gaming headset with ASUS AI noise cancelling",
    stock: 11,
  },

  // Accessories
  {
    id: 21,
    title: "SteelSeries QcK XL Mousepad",
    category: "Accessories",
    price: 399,
    currency: "$",
    image: "📍",
    description: "Large durable gaming mousepad 900x400mm",
    stock: 30,
  },
  {
    id: 22,
    title: "Corsair MM700 Extended",
    category: "Accessories",
    price: 499,
    currency: "$",
    image: "📍",
    description: "RGB mousepad with qi wireless charging",
    stock: 16,
  },
  {
    id: 23,
    title: "Razer Firefly V2",
    category: "Accessories",
    price: 699,
    currency: "$",
    image: "📍",
    description: "Hard surface mouse mat with chroma RGB",
    stock: 22,
  },
  {
    id: 24,
    title: "ASUS ROG Keystone",
    category: "Accessories",
    price: 299,
    currency: "$",
    image: "🔑",
    description: "Physical hardware authentication key",
    stock: 25,
  },
];

// Helper function to get products by category
export const getProductsByCategory = (category) => {
  return PRODUCTS.filter(
    (product) => product.category.toLowerCase() === category.toLowerCase()
  );
};

// Helper function to get single product by ID
export const getProductById = (id) => {
  return PRODUCTS.find((product) => product.id === id);
};

// Helper function to search products
export const searchProducts = (query) => {
  return PRODUCTS.filter(
    (product) =>
      product.title.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
  );
};

// Get unique categories
export const getCategories = () => {
  return [...new Set(PRODUCTS.map((product) => product.category))];
};
