# Quick Reference Guide 🚀

## 📁 Where to Find Things

### Auth & User Management
```
src/pages/Auth/
├── Signin.jsx          → /signin
├── Signup.jsx          → /signup
└── ForgotPassword.jsx  → /forgot-password

src/pages/Dashboard/    → /dashboard
└── components/         → Tab components
```

### Shopping & Products
```
src/pages/Shop/
├── Store.jsx           → /store
├── ProductDetail.jsx   → /store/product/:id
└── components/         → Product grids, filters

src/pages/Cart/         → /cart
src/pages/Wishlist/     → /wishlist
src/pages/Checkout/     → /checkout
```

### Orders
```
src/pages/Order/
├── OrderConfirmation.jsx  → /order-confirmation
└── TrackOrder.jsx         → /track-order
```

### Static Content
```
src/pages/Static/
├── About.jsx        → /about
├── Contact.jsx      → /contact
└── Accessories.jsx  → /accessories
```

### Layout
```
src/components/layout/
├── Header.jsx       → Main navigation
└── Footer.jsx       → Site footer
```

### Features
```
src/components/features/
└── cart/
    └── CartDropdown.jsx  → Cart preview dropdown
```

### Configuration
```
src/constants/
├── navigation.js    → Menu items, languages, currencies
└── routes.js        → All route paths & helpers
```

### State Management
```
src/context/
├── AuthContext.jsx      → User authentication
├── CartContext.jsx      → Shopping cart
├── WishlistContext.jsx  → Wishlist
└── ToastContext.jsx     → Notifications
```

### Utilities
```
src/hooks/
└── usePageSEO.js    → SEO hook for all pages

src/utils/
└── seo.js           → SEO helper functions
```

---

## 🛠️ Common Tasks

### Adding a New Page
1. Create component in appropriate folder:
   - Auth → `pages/Auth/`
   - Shopping → `pages/Shop/`
   - Order → `pages/Order/`
   - Content → `pages/Static/`

2. Add route in `App.jsx`:
```javascript
const NewPage = lazy(() => import("./pages/Category/NewPage"))

<Route path="/new-page" element={<NewPage />} />
```

3. Add to `constants/routes.js`:
```javascript
export const ROUTES = {
  NEW_PAGE: '/new-page',
  // ...
}
```

4. Add to navigation in `constants/navigation.js` if needed

### Adding a New Feature Component
1. Create folder: `src/components/features/feature-name/`
2. Create component: `ComponentName.jsx`
3. Import where needed with relative path

### Using Route Constants
```javascript
import { ROUTES, getProductRoute } from '../../constants/routes'

// Use constants instead of hardcoded strings
<Link to={ROUTES.SIGNIN}>Sign In</Link>
<Link to={getProductRoute(product.id)}>View Product</Link>
```

### Using Navigation Config
```javascript
import { NAV_MENU_ITEMS } from '../../constants/navigation'

{NAV_MENU_ITEMS.map(item => (
  <Link key={item.id} to={item.path}>{item.label}</Link>
))}
```

---

## 📝 Import Path Examples

### From a Page Component
```javascript
// Context
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

// Components
import Header from '../../components/layout/Header'
import ProductCard from '../Shop/components/ProductCard'

// Constants
import { ROUTES } from '../../constants/routes'

// Hooks
import { usePageSEO } from '../../hooks/usePageSEO'
```

### From a Layout Component (`components/layout/`)
```javascript
// Context
import { useAuth } from '../../context/AuthContext'

// Features
import CartDropdown from '../features/cart/CartDropdown'

// Constants
import { NAV_MENU_ITEMS } from '../../constants/navigation'
```

### From a Feature Component (`components/features/cart/`)
```javascript
// Context
import { useCart } from '../../../context/CartContext'

// Constants
import { ROUTES } from '../../../constants/routes'
```

---

## 🚀 Build & Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Lint Code
```bash
npm run lint
```

---

## 📊 Folder Structure at a Glance

```
src/
├── components/       → Reusable UI components
│   ├── layout/      → Header, Footer
│   ├── features/    → Feature-specific (cart, wishlist, etc.)
│   └── common/      → Generic UI (Typography, etc.)
├── pages/           → Route components
│   ├── Auth/        → Authentication pages
│   ├── Shop/        → Store & products
│   ├── Order/       → Order management
│   ├── Static/      → About, Contact, etc.
│   ├── Dashboard/   → User dashboard
│   ├── Home/        → Homepage
│   ├── Cart/        → Shopping cart
│   ├── Checkout/    → Checkout flow
│   └── Wishlist/    → Wishlist
├── context/         → Global state providers
├── hooks/           → Custom React hooks
├── utils/           → Helper functions
├── constants/       → App configuration
├── services/        → API services (future)
├── assets/          → Images, icons, styles
└── data/            → Static data files
```

---

## ✅ Best Practices

### DO ✅
- Use constants for routes and navigation
- Keep components small and focused
- Use proper import paths (relative or absolute)
- Group related components in feature folders
- Use context for global state
- Add SEO hooks to all pages
- Use lazy loading for routes

### DON'T ❌
- Hardcode route paths in components
- Mix business logic in UI components
- Create deeply nested folder structures
- Duplicate code across components
- Skip accessibility attributes
- Forget to handle loading states

---

## 🎯 Quick Tips

1. **Finding Files:** Use VS Code's Cmd+P (Mac) / Ctrl+P (Windows) to quickly open files

2. **Search Across Files:** Cmd+Shift+F (Mac) / Ctrl+Shift+F (Windows)

3. **Import Auto-Complete:** Start typing the component name, VS Code will suggest imports

4. **Refactoring:** Right-click → Rename Symbol to rename across all files

5. **Check Route:** Look in `App.jsx` for all routes and `constants/routes.js` for paths

---

**Need Help?** Check `PROJECT_STRUCTURE.md` for detailed documentation!
