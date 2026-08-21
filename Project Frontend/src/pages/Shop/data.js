import img1 from "../../assets/Store/Dell1.webp";
import img2 from "../../assets/Store/Dell2.webp";
import img3 from "../../assets/Store/Dell3.webp";
import img4 from "../../assets/Store/Dell4.webp";
import img5 from "../../assets/Store/Dell5.webp";
import img6 from "../../assets/Store/Dell6.webp";
import img7 from "../../assets/Store/Dell7.webp";
import img8 from "../../assets/Store/Dell8.webp";
import img9 from "../../assets/Store/Dell9.webp";
import img10 from "../../assets/Store/Dell10.webp";
import img11 from "../../assets/Store/hp1.webp";
import img12 from "../../assets/Store/hp2.webp";
import img13 from "../../assets/Store/hp3.webp";
import img14 from "../../assets/Store/hp4.webp";
import img15 from "../../assets/Store/hp5.webp";
import img16 from "../../assets/Store/hp6.webp";
import img17 from "../../assets/Store/hp7.webp";
import img18 from "../../assets/Store/hp8.webp";
import img19 from "../../assets/Store/hp9.webp";
import img20 from "../../assets/Store/hp10.webp";
import img21 from "../../assets/Store/Disktop1.webp";
import img22 from "../../assets/Store/Disktop2.webp";
import img23 from "../../assets/Store/Disktop3.webp";
import img24 from "../../assets/Store/Disktop4.webp";
import view1 from "../../assets/homePIc/homeview1.webp";
import view2 from "../../assets/homePIc/homeview2.webp";
import view3 from "../../assets/homePIc/homeview3.webp";
import view4 from "../../assets/homePIc/homeview4.webp";
import view5 from "../../assets/homePIc/homeview5.webp";
import view6 from "../../assets/homePIc/homeview6.webp";
import view7 from "../../assets/homePIc/homeview7.webp";
import flash1 from "../../assets/homePIc/homeflash1.webp";
import flash2 from "../../assets/homePIc/homeflash2.webp";
import flash3 from "../../assets/homePIc/homeflash3.webp";
import flash4 from "../../assets/homePIc/homeflash4.webp";

const PRICE_MAX = 999;

const categoryDefs = [
  {
    label: "Desktop Computers",
    count: 10,
    base: 450,
    images: [img21, img22, img23, img24],
    brands: ["Apple", "HP", "Samsung", "Dell"],

    names: [
      "Dell OptiPlex Tower",
      "HP Pavilion Desktop",
      "Apple iMac 24-inch",
      "Dell Inspiron Desktop",
      "HP EliteDesk Mini",
    ],
  },
  {
    label: "Laptops",
    count: 20,
    base: 520,
    images: [
      img2,
      img3,
      view5,
      img4,
      img10,
      img9,
      img6,
      img7,
      img8,
      img1,
      img12,
      img13,
      img15,
      img14,
      img20,
      img19,
      img16,
      img17,
      img18,
      img11,
    ],
    brands: ["Apple", "HP", "Samsung", "Dell"],
    names: [
      "MacBook Air 13-inch",
      "HP Spectre x360",
      "Samsung Galaxy Book",
      "Dell XPS 13",
      "MacBook Pro 14-inch",
      "HP Envy Laptop",
    ],
  },
  {
    label: "Gaming PCs",
    count: 16,
    base: 700,
    images: [],
    brands: ["Apple", "HP", "Samsung", "Dell"],
    names: [
      "Alienware Aurora R16",
      "ASUS ROG Strix GT",
      "MSI Aegis Gaming Tower",
      "HP OMEN Desktop",
    ],
  },
  {
    label: "Gaming Laptops",
    count: 18,
    base: 800,
    images: [img2, img6, img7],
    brands: ["Apple", "HP", "Samsung", "Dell"],
    names: [
      "ASUS ROG Zephyrus",
      "MSI Katana Gaming Laptop",
      "Lenovo Legion 5",
      "Alienware m16",
    ],
  },
  {
    label: "Mouses",
    count: 34,
    base: 100,
    images: [view2, img5, view1, flash3],
    brands: ["Apple", "HP", "Samsung", "Dell"],
    names: [
      "Logitech G502 Hero",
      "Razer DeathAdder V3",
      "Corsair Dark Core RGB",
      "HP Wireless Mouse 220",
    ],
  },
  {
    label: "Keyboards",
    count: 29,
    base: 100,
    images: [view3, img5, view6, flash1],
    brands: ["Apple", "HP", "Samsung", "Dell"],
    names: [
      "Logitech G Pro Mechanical",
      "Razer BlackWidow V4",
      "Corsair K95 RGB Platinum",
      "HP Wired Keyboard K200",
    ],
  },
  {
    label: "Headphones",
    count: 55,
    base: 100,
    images: [view6, view7, flash4, view4],
    brands: ["Apple", "HP", "Samsung", "Dell"],
    names: [
      "Logitech G435 Wireless",
      "Razer BlackShark V2",
      "Corsair HS65 Surround",
      "HP Stereo Headset",
    ],
  },
];

const generatedProducts = [];
let createdAtCounter = 0;

categoryDefs.forEach((cat) => {
  for (let i = 0; i < cat.count; i++) {
    const price = Math.min(
      PRICE_MAX,
      cat.base + ((i * 37) % 250) + (i % 5 === 0 ? 120 : 0),
    );

    generatedProducts.push({
      id: createdAtCounter + 1,
      category: cat.label,
      title: cat.names[(i * 3) % cat.names.length],
      price,
      currency: "$",
      img: cat.images[i % cat.images.length],
      brand: cat.brands[i % cat.brands.length],
      isNew: i % 9 === 0,
      rating: i % 5 === 0 ? 4 : 4.5,
      createdAt: createdAtCounter,
    });

    createdAtCounter += 1;
  }
});

// Flash Sale Products — appended with continuing unique ids so no collision with generated products
const flashSaleDefs = [
  {
    title: "Gaming Headset Pro",
    category: "Headphones",
    brand:"Apple",
    price: 200,
    sale: 400,
    img: flash1,
  },
  {
    title: "Wireless Mouse Elite",
    category: "Mouses",
    brand:"Apple",
    price: 200,
    sale: 400,
    img: flash2,
  },
  {
    title: "RGB Keyboard Mechanical",
    category: "Keyboards",
    brand:"HP",
    price: 200,
    sale: 400,
    img: flash3,
  },
  {
    title: "Gaming Monitor 144Hz",
    category: "Monitors",
    brand:"Apple",
    price: 250,
    sale: 500,
    img: img2,
  },
];

const flashSaleIds = [];
flashSaleDefs.forEach((item) => {
  const id = createdAtCounter + 1;
  flashSaleIds.push(id);
  generatedProducts.push({
    id,
    category: item.category,
    title: item.title,
    price: item.price,
    sale: item.sale,
    currency: "$",
    img: item.img,
    brand: item.brand,
    isNew: true,
    rating: 4.5,
    createdAt: createdAtCounter,
  });
  createdAtCounter += 1;
});

export const products = generatedProducts;

export const flashSaleProducts = products.filter((p) =>
  flashSaleIds.includes(p.id),
);

export const categories = categoryDefs.map(({ label, count }) => ({
  label,
  count,
}));

export const brandOptions = Object.entries(
  products.reduce((acc, product) => {
    acc[product.brand] = (acc[product.brand] || 0) + 1;
    return acc;
  }, {}),
)
  .map(([label, count]) => ({ label, count }))
  .sort((a, b) => b.count - a.count);

export const PRICE_MIN = 100;
export { PRICE_MAX };

const FEATURE_LINES = [
  "High-performance processor with turbo boost up to 5.0 GHz",
  "16GB DDR5 RAM and 1TB NVMe SSD for lightning-fast load times",
  "Premium aluminum unibody design with slim bezels",
  "All-day battery life with rapid-charge support",
  "Advanced cooling system keeps performance consistent under load",
  "Wi-Fi 6E and Bluetooth 5.3 for reliable wireless connectivity",
  "Backlit keyboard with adjustable RGB lighting",
  "Crystal-clear FHD display with 100% sRGB coverage",
];

const descriptionBodies = [
  "This item is engineered for demanding workloads. It delivers dependable performance for everyday tasks, creative projects, and entertainment.",
  "Built for speed and responsiveness, this product combines premium materials with thoughtfully designed ergonomics.",
  "A versatile choice for home, office, or on the go. It offers the connectivity and performance you need, right out of the box.",
  "Designed with durability and precision in mind, it features refined details and dependable components that last.",
];

export const getProductById = (id) => {
  const product = products.find((p) => p.id === Number(id));
  if (!product) return null;

  return {
    ...product,
    description: descriptionBodies[product.id % descriptionBodies.length],
    features: [
      FEATURE_LINES[product.id % FEATURE_LINES.length],
      FEATURE_LINES[(product.id + 2) % FEATURE_LINES.length],
      FEATURE_LINES[(product.id + 4) % FEATURE_LINES.length],
      FEATURE_LINES[(product.id + 6) % FEATURE_LINES.length],
    ],
    stock: ((product.id * 7) % 30) + 5,
    sku: `SKU-${String(product.id).padStart(4, "0")}`,
  };
};
