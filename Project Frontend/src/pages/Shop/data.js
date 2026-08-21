import img1 from "../../assets/homePIc/home1.webp";
import img2 from "../../assets/homePIc/home2.webp";
import img3 from "../../assets/homePIc/home3.webp";
import img4 from "../../assets/homePIc/home4.webp";
import img5 from "../../assets/homePIc/home5.webp";
import img6 from "../../assets/homePIc/home6.webp";
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
    count: 40,
    base: 450,
    images: [img1, img6, view2],
    brands: ["Dell", "HP", "Apple", "Lenovo", "Samsung", "ASUS"],
    names: [
      "OptiPlex 7080 Tower",
      "Pavilion TP01 Desktop",
      'iMac 24" M1',
      "Galaxy Desktop DM500",
      "ThinkCentre M90q",
      "Precision 3650 Tower",
      "Envy TE01 Desktop",
      "IdeaCentre 3 Desktop",
      "Mac Mini M2",
      "Vostro 3910 Tower",
      "ProDesk 400 G7",
      "Legion Tower 5",
    ],
  },
  {
    label: "Laptops",
    count: 58,
    base: 520,
    images: [img2, img3, view5, img4],
    brands: ["Apple", "HP", "Samsung", "Dell", "Lenovo", "ASUS", "MSI"],
    names: [
      "EliteBook 840 G6",
      "XPS 13 Plus",
      "MacBook Air M2",
      "Galaxy Book3 Pro",
      "Spectre x360 2-in-1",
      "ThinkPad X1 Carbon",
      "Pavilion 15 Laptop",
      "Gram 17 Ultrabook",
      "Swift 3 Laptop",
      "ZenBook 14 OLED",
      "Vivobook S15",
      "Inspiron 15 3000",
      "Surface Laptop 5",
      "ROG Zephyrus G14",
    ],
  },
  {
    label: "Gaming PCs",
    count: 16,
    base: 700,
    images: [img1, img4, img6],
    brands: ["Dell", "ASUS", "MSI", "HP"],
    names: [
      "Gamer Supreme X",
      "Aurora R15",
      "OMEN 45L Tower",
      "Predator Orion 3000",
      "ROG Strix GA35",
      "Cyborg Manticore",
      "GF63 Tower",
      "Nitro N50",
    ],
  },
  {
    label: "Gaming Laptops",
    count: 18,
    base: 800,
    images: [img2, img6, flash2],
    brands: ["ASUS", "MSI", "Lenovo", "Dell", "Razer"],
    names: [
      "ROG Strix G16",
      "Raider GE78",
      "Legion Pro 7",
      "Predator Helios 16",
      "Blade 16",
      "GF63 Thin",
      "Katana 15",
      "Ghost Pro 16",
    ],
  },
  {
    label: "Mouses",
    count: 34,
    base: 100,
    images: [view2, img5, view1, flash3],
    brands: ["Logitech", "Razer", "Corsair", "HP"],
    names: [
      "G502 X Plus",
      "DeathAdder V3",
      "MX Master 3S",
      "Basmilisk V3",
      "Viper V2 Pro",
      "M720 Triathlon",
      "Corsair M65",
      "Pulsefire Haste",
      "Model O Wireless",
      "Kone Pro Air",
    ],
  },
  {
    label: "Keyboards",
    count: 29,
    base: 100,
    images: [view3, img5, view6, flash1],
    brands: ["Logitech", "Razer", "Keychron", "Corsair"],
    names: [
      "K780 Multi-Device",
      "K8 Pro",
      "G513 Carbon",
      "Huntsman V2",
      "MX Keys S",
      "Corsair K70",
      "BlackWidow V4",
      "Vortex Race 3",
      "Ducky One 3",
      "Anne Pro 2",
    ],
  },
  {
    label: "Headphones",
    count: 55,
    base: 100,
    images: [view6, view7, flash4, view4],
    brands: ["Sony", "JBL", "Bose", "Logitech", "Apple"],
    names: [
      "WH-1000XM5",
      "Quantum One",
      "Astro A50 X",
      "Pulse Elite",
      "Bose QC45",
      "Cloud Alpha",
      "Lightspeed G733",
      "Studio Pro Wireless",
      "G Pro X",
      "Momentum 4",
    ],
  },
];

const generatedProducts = [];
let createdAtCounter = 0;

categoryDefs.forEach((cat) => {
  for (let i = 0; i < cat.count; i++) {
    const price = Math.min(
      PRICE_MAX,
      cat.base + ((i * 37) % 250) + (i % 5 === 0 ? 120 : 0)
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
    brand: "TechGear",
    price: 200,
    sale: 400,
    img: flash1,
  },
  {
    title: "Wireless Mouse Elite",
    category: "Mouses",
    brand: "ProGaming",
    price: 200,
    sale: 400,
    img: flash2,
  },
  {
    title: "RGB Keyboard Mechanical",
    category: "Keyboards",
    brand: "MechKeys",
    price: 200,
    sale: 400,
    img: flash3,
  },
  {
    title: "Gaming Monitor 144Hz",
    category: "Monitors",
    brand: "ViewPro",
    price: 250,
    sale: 500,
    img: flash4,
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
  flashSaleIds.includes(p.id)
);

export const categories = categoryDefs.map(({ label, count }) => ({
  label,
  count,
}));

export const brandOptions = Object.entries(
  products.reduce((acc, product) => {
    acc[product.brand] = (acc[product.brand] || 0) + 1;
    return acc;
  }, {})
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
    description:
      descriptionBodies[product.id % descriptionBodies.length],
    features: [
      FEATURE_LINES[product.id % FEATURE_LINES.length],
      FEATURE_LINES[(product.id + 2) % FEATURE_LINES.length],
      FEATURE_LINES[(product.id + 4) % FEATURE_LINES.length],
      FEATURE_LINES[(product.id + 6) % FEATURE_LINES.length],
    ],
    stock: (product.id * 7) % 30 + 5,
    sku: `SKU-${String(product.id).padStart(4, "0")}`,
  };
};