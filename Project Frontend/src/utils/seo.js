// SEO utility for dynamically setting page titles and meta tags
export const setPageTitle = (title, noIndex = false) => {
  // Set page title
  document.title = title ? `${title} | Computer System eCommerce` : 'Computer System eCommerce - High-Performance PC Components & Accessories';
  
  // Handle no-index meta tag for auth/dashboard pages
  let metaRobots = document.querySelector('meta[name="robots"]');
  
  if (noIndex) {
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = 'noindex, nofollow';
  } else {
    if (metaRobots) {
      metaRobots.content = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
    }
  }
};

export const setMetaDescription = (description) => {
  let metaDescription = document.querySelector('meta[name="description"]');
  
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    document.head.appendChild(metaDescription);
  }
  
  metaDescription.content = description;
};

// Common page titles and descriptions
export const PAGE_SEO = {
  home: {
    title: 'Home',
    description: 'Shop premium computer systems, gaming PCs, laptops, and accessories. Best prices on desktop computers, gaming setups, and tech peripherals.'
  },
  store: {
    title: 'Store',
    description: 'Browse our complete collection of computer systems, gaming PCs, laptops, components, and accessories. Find the perfect tech for your needs.'
  },
  deals: {
    title: 'Today\'s Deals',
    description: 'Save big on computer systems, gaming PCs, components, and accessories. Discover discounted products with limited-time deals updated daily.'
  },
  about: {
    title: 'About Us',
    description: 'Learn about Computer System eCommerce - your trusted partner for premium computer hardware and gaming equipment since day one.'
  },
  contact: {
    title: 'Contact Us',
    description: 'Get in touch with Computer System eCommerce. Our expert team is ready to help with your computer hardware questions and orders.'
  },
  accessories: {
    title: 'Computer Accessories',
    description: 'Complete your setup with keyboards, mice, monitors, headsets, webcams, cables and more. Premium computer accessories at competitive prices.'
  },
  cart: {
    title: 'Shopping Cart',
    description: 'Review your selected items and proceed to secure checkout. Free shipping on orders over $50.'
  },
  wishlist: {
    title: 'My Wishlist',
    description: 'Save your favorite computer systems and accessories for later. Never lose track of products you love.'
  },
  signin: {
    title: 'Sign In',
    description: 'Sign in to your Computer System eCommerce account to track orders, manage your wishlist, and enjoy a personalized shopping experience.',
    noIndex: true
  },
  signup: {
    title: 'Create Account',
    description: 'Create a new account to start shopping for computer systems and accessories. Join thousands of satisfied customers.',
    noIndex: true
  },
  forgotPassword: {
    title: 'Reset Password',
    description: 'Reset your account password securely. We\'ll help you regain access to your Computer System eCommerce account.',
    noIndex: true
  },
  dashboard: {
    title: 'My Account',
    description: 'Manage your Computer System eCommerce account, view orders, update shipping addresses, and track your purchases.',
    noIndex: true
  },
  checkout: {
    title: 'Checkout',
    description: 'Complete your purchase securely. Fast shipping and excellent customer service guaranteed.',
    noIndex: true
  },
  orderConfirmation: {
    title: 'Order Confirmation',
    description: 'Your order has been placed successfully. Thank you for shopping with Computer System eCommerce.',
    noIndex: true
  },
  trackOrder: {
    title: 'Track Your Order',
    description: 'Track your Computer System eCommerce order in real-time. Enter your tracking ID to see the latest delivery status.'
  }
};
