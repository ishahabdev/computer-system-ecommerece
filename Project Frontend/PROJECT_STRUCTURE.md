# Project Structure Documentation

## 📁 Professional React Architecture

This project follows industry-standard React best practices with a clean, scalable folder structure.

---

## 🗂️ Directory Structure

```
src/
├── assets/                      # Static assets
│   ├── homePIc/                # Home page images
│   ├── storepics/              # Store images  
│   ├── icons/                  # Icon assets
│   └── About us/               # About page assets
│
├── components/                  # Reusable components
│   ├── common/                 # Generic UI components
│   │   └── Typography.jsx      # Text components
│   ├── layout/                 # Layout components
│   │   ├── Header.jsx          # Main header with navigation
│   │   └── Footer.jsx          # Main footer
│   ├── features/               # Feature-specific components
│   │   ├── cart/              
│   │   │   └── CartDropdown.jsx
│   │   ├── wishlist/
│   │   └── product/
│   ├── Signup.jsx              # Legacy signup form
│   ├── Userform.jsx            # User form component
│   └── UserList.jsx            # User list component
│
├── pages/                       # Page components (Routes)
│   ├── Auth/                   # Authentication pages
│   │   ├── Signin.jsx          # Sign in page
│   │   ├── Signup.jsx          # Sign up page
│   │   └── ForgotPassword.jsx  # Password recovery
│   │
│   ├── Dashboard/              # User dashboard
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   └── components/         # Dashboard sub-components
│   │       ├── HomeTab.jsx
│   │       ├── OrdersTab.jsx
│   │       ├── AddressTab.jsx
│   │       └── SettingsTab.jsx
│   │
│   ├── Shop/                   # Shopping pages
│   │   ├── Store.jsx           # Main store/products page
│   │   ├── ProductDetail.jsx   # Single product page
│   │   ├── data.js            # Product data
│   │   └── components/
│   │       ├── ProductGrid.jsx
│   │       ├── Sidebar.jsx
│   │       └── StoreProductCard.jsx
│   │
│   ├── Order/                  # Order-related pages
│   │   ├── OrderConfirmation.jsx
│   │   └── TrackOrder.jsx
│   │
│   ├── Static/                 # Static content pages
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   └── Accessories.jsx
│   │
│   ├── Home/                   # Home page
│   │   ├── Home.jsx
│   │   └── components/
│   │       ├── Slider.jsx
│   │       ├── Cards.jsx
│   │       ├── Category.jsx
│   │       ├── Custom.jsx
│   │       ├── Flash.jsx
│   │       └── Viewed.jsx
│   │
│   ├── Cart/                   # Shopping cart
│   │   └── Cart.jsx
│   ├── Checkout/               # Checkout process
│   │   └── Checkout.jsx
│   ├── Wishlist/               # Wishlist
│   │   └── Wishlist.jsx
│   └── NotFound.jsx            # 404 page
│
├── context/                     # React Context providers
│   ├── AuthContext.jsx         # Authentication state
│   ├── CartContext.jsx         # Shopping cart state
│   ├── WishlistContext.jsx     # Wishlist state
│   └── ToastContext.jsx        # Notification system
│
├── hooks/                       # Custom React hooks
│   └── usePageSEO.js           # SEO management hook
│
├── utils/                       # Utility functions
│   └── seo.js                  # SEO helpers
│
├── constants/                   # App constants
│   ├── navigation.js           # Navigation configuration
│   └── routes.js               # Route path constants
│
├── services/                    # API services (future)
│   └── (future API calls)
│
├── data/                        # Static data files
│   └── data.js                 # Legacy data
│
├── App.jsx                      # Main App component
├── App.css                      # App styles
├── main.jsx                     # App entry point
├── index.css                    # Global styles
└── vite.config.js              # Vite configuration

```

---

## 📋 Naming Conventions

### Files & Folders
- **Components**: PascalCase (e.g., `Header.jsx`, `ProductCard.jsx`)
- **Utilities**: camelCase (e.g., `seo.js`, `navigation.js`)
- **Folders**: PascalCase for features, lowercase for utilities

### Code
- **Components**: PascalCase (e.g., `const Header = () => {}`)
- **Functions**: camelCase (e.g., `const handleClick = () => {}`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `const API_URL = ''`)
- **Context**: PascalCase with Context suffix (e.g., `AuthContext`)

---

## 🎯 Component Organization

### Page Components (`pages/`)
- Main route components
- Container components that compose features
- Handle routing and high-level state

### Feature Components (`components/features/`)
- Feature-specific components
- Tightly coupled to business logic
- Reusable within their feature domain

### Common Components (`components/common/`)
- Generic, reusable UI components
- No business logic
- Used across multiple features

### Layout Components (`components/layout/`)
- Structural components (Header, Footer, Sidebar)
- Used on most/all pages
- Handle navigation and global UI

---

## 🔄 State Management

### Context Providers
1. **AuthContext** - User authentication state
2. **CartContext** - Shopping cart state
3. **WishlistContext** - Wishlist state
4. **ToastContext** - Notifications

### Local State
- Component-specific state with `useState`
- Form state with Formik
- URL state with React Router

---

## 🛣️ Routing Structure

```
/ ────────────────────── Home
├── /store ────────────── Shop/Store.jsx
│   ├── ?category=X ──── Filtered products
│   ├── ?search=X ────── Search results
│   └── /product/:id ─── Shop/ProductDetail.jsx
├── /accessories ──────── Static/Accessories.jsx
├── /about ────────────── Static/About.jsx
├── /contact ──────────── Static/Contact.jsx
├── /cart ─────────────── Cart/Cart.jsx
├── /wishlist ─────────── Wishlist/Wishlist.jsx
├── /checkout ─────────── Checkout/Checkout.jsx
├── /order-confirmation ─ Order/OrderConfirmation.jsx
├── /track-order ──────── Order/TrackOrder.jsx
├── /signin ───────────── Auth/Signin.jsx
├── /signup ───────────── Auth/Signup.jsx
├── /forgot-password ──── Auth/ForgotPassword.jsx
└── /dashboard ────────── Dashboard/Dashboard.jsx
```

---

## 🔧 Configuration Files

- `vite.config.js` - Vite bundler configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `eslint.config.js` - ESLint rules
- `package.json` - Dependencies and scripts

---

## 📦 Key Dependencies

### Core
- **React 19.2.4** - UI library
- **React Router 7.14.1** - Routing
- **Vite 8.0.4** - Build tool

### UI & Styling
- **Tailwind CSS 3.4.19** - Utility-first CSS
- **React Icons 5.6.0** - Icon library
- **Swiper 12.1.3** - Slider/carousel

### Forms & Validation
- **Formik 2.4.9** - Form management
- **Yup 1.7.1** - Schema validation

### Utilities
- **Axios 1.16.1** - HTTP client
- **Lucide React 1.31.0** - Icons

---

## 🚀 Development Workflow

### Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Adding New Features
1. Create feature folder in `pages/` or `components/features/`
2. Add route in `App.jsx` and `constants/routes.js`
3. Create necessary context if needed
4. Add navigation link in `constants/navigation.js`
5. Update this documentation

---

## ✅ Best Practices Followed

1. ✅ **Separation of Concerns** - Clear boundaries between pages, components, and logic
2. ✅ **DRY Principle** - Reusable components and utilities
3. ✅ **Consistent Naming** - Following React/JS conventions
4. ✅ **Component Composition** - Small, focused components
5. ✅ **Lazy Loading** - Code-splitting for better performance
6. ✅ **Centralized Configuration** - Constants and routes in one place
7. ✅ **Context for Global State** - Avoiding prop drilling
8. ✅ **Custom Hooks** - Reusable stateful logic
9. ✅ **SEO Optimization** - Dynamic meta tags and titles
10. ✅ **Accessibility** - Semantic HTML and ARIA labels

---

## 📚 Future Enhancements

### Planned Improvements
- [ ] Move to TypeScript for type safety
- [ ] Add unit tests (Jest + React Testing Library)
- [ ] Implement E2E tests (Playwright/Cypress)
- [ ] Add Storybook for component documentation
- [ ] Implement proper API service layer
- [ ] Add error boundaries
- [ ] Implement analytics tracking
- [ ] Add performance monitoring
- [ ] Create design system documentation

---

## 📝 Notes

- Dashboard folder has legacy typo (`Dashbaord`) - keeping for compatibility
- Some components still in root `/components` - will be migrated gradually
- Product data currently in `Shop/data.js` - will move to API in future
- Assets folder structure mirrors old structure - can be optimized

---

**Last Updated:** August 2026
**Maintained By:** Development Team
