/**
 * SEO Helper Utility
 * Provides functions to update meta tags and structured data for different pages
 */

export const updatePageMeta = (title, description, keywords, image, url, type = 'website') => {
  // Update title
  document.title = title;
  
  // Update or create meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', description);
  
  // Update or create meta keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.setAttribute('name', 'keywords');
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.setAttribute('content', keywords);
  
  // Update Open Graph tags
  updateOGTags(title, description, image, url, type);
  
  // Update Twitter Card tags
  updateTwitterTags(title, description, image);
  
  // Update or create canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
};

const updateOGTags = (title, description, image, url, type) => {
  updateMetaProperty('og:title', title);
  updateMetaProperty('og:description', description);
  updateMetaProperty('og:image', image);
  updateMetaProperty('og:url', url);
  updateMetaProperty('og:type', type);
};

const updateTwitterTags = (title, description, image) => {
  updateMetaProperty('twitter:title', title);
  updateMetaProperty('twitter:description', description);
  updateMetaProperty('twitter:image', image);
};

const updateMetaProperty = (property, content) => {
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.querySelector(`meta[name="${property}"]`);
  }
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
};

export const updateStructuredData = (data) => {
  let script = document.querySelector('script[type="application/ld+json"]');
  if (!script) {
    script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
};

// Page-specific meta configurations
export const pageMetaData = {
  home: {
    title: 'Computer System eCommerce - Buy Gaming PCs, Laptops & Accessories',
    description: 'Shop the latest gaming PCs, laptops, desktops, and computer accessories. Best prices and premium quality hardware.',
    keywords: 'gaming PC, laptop, desktop computer, computer accessories, gaming laptop, PC components',
    type: 'website'
  },
  store: {
    title: 'Computer Store - Browse Gaming PCs, Laptops & Components',
    description: 'Browse our extensive catalog of gaming PCs, laptops, desktop computers, and computer accessories. Find the perfect system for your needs.',
    keywords: 'buy computer, gaming PC, laptop price, desktop computer, PC accessories',
    type: 'website'
  },
  accessories: {
    title: 'Computer Accessories - Mice, Keyboards, Headphones & More',
    description: 'Discover premium computer accessories including gaming mice, mechanical keyboards, wireless headphones, and more.',
    keywords: 'computer accessories, gaming mouse, mechanical keyboard, gaming headphones, PC peripherals',
    type: 'website'
  },
  about: {
    title: 'About Computer System eCommerce - Your PC Hardware Destination',
    description: 'Learn about Computer System eCommerce, your trusted source for premium gaming PCs, laptops, and computer accessories.',
    keywords: 'about us, computer store, gaming PC retailer',
    type: 'website'
  },
  contact: {
    title: 'Contact Us - Computer System eCommerce Support',
    description: 'Get in touch with our customer support team. We\'re here to help with questions about our products and services.',
    keywords: 'contact us, customer support, computer store support',
    type: 'website'
  },
  wishlist: {
    title: 'My Wishlist - Computer System eCommerce',
    description: 'View and manage your saved favorite computer products and accessories.',
    keywords: 'wishlist, saved products, favorites',
    type: 'website'
  },
  cart: {
    title: 'Shopping Cart - Computer System eCommerce',
    description: 'Review and checkout your selected computer systems and accessories.',
    keywords: 'shopping cart, checkout, buy now',
    type: 'website'
  },
  dashboard: {
    title: 'Dashboard - Computer System eCommerce',
    description: 'Manage your account, orders, and preferences.',
    keywords: 'dashboard, my account, orders',
    type: 'website'
  },
  productDetail: {
    title: (productName) => `${productName} - Buy Online | Computer System eCommerce`,
    description: (productName, price) => `Shop ${productName}. High-quality gaming PC, laptop, or computer accessory. Best price guaranteed.`,
    keywords: (category) => `${category}, buy online, computer hardware, gaming equipment`,
    type: 'product'
  }
};
