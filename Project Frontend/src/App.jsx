import { BrowserRouter, Route, Routes } from "react-router"
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

// Lazy load route components for code splitting
const Home = lazy(() => import("./pages/Home/Home"))
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


// Loading fallback component
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

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ToastProvider>
            <BrowserRouter>
              <Header />
              <main role="main">
                <Suspense fallback={<Loading />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/store" element={<Store />} />
                    <Route path="/accessories" element={<Accessories />} />
                    <Route path="/about" element={<About />} />
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
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </BrowserRouter>
          </ToastProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App