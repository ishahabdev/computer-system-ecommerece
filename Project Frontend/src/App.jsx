import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router"
import { Suspense, lazy } from "react"

// Layout components
import Header from "./components/layout/Header"
import Footer from "./components/layout/Footer"
import NotFound from "./pages/NotFound"

// Context providers
import { CartProvider } from "./context/CartContext"
import { WishlistProvider } from "./context/WishlistContext"
import { AuthProvider } from "./context/AuthContext"
import { ToastProvider } from "./context/ToastContext"

import OverView from "./admin/overview/overview"
import Products from "./admin/products/products"

import Orders from "./admin/orders/orders"
import Analytics from "./admin/analytics/analytics"
import UsersAdmin from "./admin/users/users"
import AdminLayout from "./admin/components/AdminLayout"
import AdminRoute from "./admin/components/AdminRoute"

// Lazy load route components
const Home = lazy(() => import("./pages/Home/Home"))
const Deals = lazy(() => import("./pages/Deals/deals"))

const Store = lazy(() => import("./pages/Shop/Store"))
const ProductDetail = lazy(() => import("./pages/Shop/ProductDetail"))
const Accessories = lazy(() => import("./pages/Static/Accessories"))
const About = lazy(() => import("./pages/Static/About"))
const Contact = lazy(() => import("./pages/Static/Contact"))
const Dashboard = lazy(() => import("./pages/Dashbaord/Dashboard"))
const Wishlist = lazy(() => import("./pages/Wishlist/Wishlist"))
const Cart = lazy(() => import("./pages/Cart/Cart"))
const Checkout = lazy(() => import("./pages/Checkout/Checkout"))
const OrderConfirmation = lazy(() => import("./pages/Order/OrderConfirmation"))
const Signin = lazy(() => import("./pages/Auth/Signin"))
const Signup = lazy(() => import("./pages/Auth/Signup"))
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"))
const TrackOrder = lazy(() => import("./pages/Order/TrackOrder"))

const Loading = () => (
  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
    fontSize: "18px",
    color: "#666"
  }} role="status" aria-live="polite">
    Loading...
  </div>
)

// ← Yeh Layout component add kiya
function Layout({ children }) {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith("/admin")

  // Admin pages bring their own chrome (sidebar + navbar + main) via AdminLayout.
  if (isAdmin) return children

  return (
    <>
      <Header />
      <main role="main">{children}</main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ToastProvider>
            <BrowserRouter>
              <Layout>  {/* ← Header Footer yahan control ho raha hai */}
                <Suspense fallback={<Loading />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/store" element={<Store />} />
                    <Route path="/accessories" element={<Accessories />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/deals" element={<Deals />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/store/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                    <Route path="/signin" element={<Signin />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/track-order" element={<TrackOrder />} />

                    {/* Admin Routes — gated by AdminRoute (validates JWT session +
                        role). AdminRoute renders its <Outlet/> only for admins;
                        AdminLayout then supplies the sidebar/navbar chrome. */}
                    <Route path="/admin" element={<AdminRoute />}>
                      <Route element={<AdminLayout />}>
                        <Route index element={<Navigate to="/admin/overview" replace />} />
                        <Route path="overview" element={<OverView />} />
                        <Route path="products" element={<Products />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="analyze" element={<Analytics />} />
                        <Route path="users" element={<UsersAdmin />} />
                      </Route>
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Layout>
            </BrowserRouter>
          </ToastProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App