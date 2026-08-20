/**
 * Navigation Configuration
 * Centralized navigation menu items for the application
 */

export const NAV_MENU_ITEMS = [
  { id: 1, path: "/", label: "Home" },
  { id: 2, path: "/store", label: "Store" },
  { id: 3, path: "/store?category=Mouse", label: "Mouse" },
  { id: 4, path: "/store?category=Keyboard", label: "Keyboard" },
  { id: 5, path: "/accessories", label: "Accessories" },
  { id: 6, path: "/about", label: "About Us" },
  { id: 7, path: "/contact", label: "Contact Us" },
];

export const LANGUAGE_OPTIONS = ["EN", "UR", "JP", "ZH"];

export const CURRENCY_OPTIONS = ["USD", "PKR", "YUAN", "INR"];

export const FOOTER_LINKS = {
  useful: [
    { id: 1, label: "Home", href: "/" },
    { id: 2, label: "Store", href: "/store" },
    { id: 3, label: "Accessories", href: "/accessories" },
    { id: 4, label: "About Us", href: "/about" },
  ],
  policies: [
    { id: 1, label: "About Us", href: "/about" },
    { id: 2, label: "Information", href: "#" },
    { id: 3, label: "Privacy Policy", href: "#" },
    { id: 4, label: "Terms & Conditions", href: "#" },
  ],
};

export const SOCIAL_LINKS = [
  { id: 1, name: "Instagram", url: "https://instagram.com" },
  { id: 2, name: "YouTube", url: "https://youtube.com" },
  { id: 3, name: "Facebook", url: "https://facebook.com" },
  { id: 4, name: "Twitter", url: "https://twitter.com" },
];
