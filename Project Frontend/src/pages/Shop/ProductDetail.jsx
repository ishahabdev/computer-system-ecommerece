import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { FaMinus, FaPlus, FaCheck } from "react-icons/fa6";
import { FiChevronRight } from "react-icons/fi";
import { FaFacebookF, FaTwitter, FaTruck } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { getProductById, products as demoProducts } from "./data";
import { fetchProductById, fetchProducts, parseStoreId } from "./productApi";
import adImage from "../../assets/homePIc/homeflash1.webp";

// Thin wrapper: remount the view whenever the route id changes (via key), so all
// of its view + fetch state resets cleanly for the new product instead of leaking
// across navigations.
const ProductDetail = () => {
  const { id } = useParams();
  return <ProductDetailView key={id} routeId={id} />;
};

const ProductDetailView = ({ routeId }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("information");
  const [mainImage, setMainImage] = useState(0);
  const { addToCart } = useCart();

  // A "db-<id>" route is a real product from the backend; a bare numeric id is a
  // demo product the Home page still links to and resolves synchronously.
  const dbId = parseStoreId(routeId);
  const isDbProduct = dbId !== null;

  // DB products start in a loading state; static demo products resolve in render.
  const [dbState, setDbState] = useState({
    loading: isDbProduct,
    product: null,
    catalog: [],
  });

  // Load a DB product (and the catalog, for related/best-selling) from the API.
  // The component is keyed by route id, so this runs once per product and the
  // initial state above already covers the loading flag — no synchronous reset.
  useEffect(() => {
    if (!isDbProduct) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const [product, catalog] = await Promise.all([
          fetchProductById(dbId),
          fetchProducts(),
        ]);
        if (!cancelled) setDbState({ loading: false, product, catalog });
      } catch {
        // Treat a load failure like "not found" — the 404 block below covers it.
        if (!cancelled) {
          setDbState({ loading: false, product: null, catalog: [] });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isDbProduct, dbId]);

  const product = isDbProduct ? dbState.product : getProductById(routeId);
  const catalog = isDbProduct ? dbState.catalog : demoProducts;

  if (isDbProduct && dbState.loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 text-gray-500">
        <div className="w-9 h-9 rounded-full border-2 border-gray-200 border-t-[#006CE4] animate-spin" />
        <p className="mt-4 text-sm">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-6xl font-black text-[#2196F3]">404</p>
        <h1 className="text-xl font-bold mt-4">Product not found</h1>
        <Link
          to="/store"
          className="mt-6 bg-[#2196F3] text-white text-sm font-medium px-6 py-3 rounded-md hover:bg-[#1a7fd1] transition-colors"
        >
          Back to Store
        </Link>
      </div>
    );
  }

  // The cart POSTs this id to the backend as productId, so use the real integer
  // dbId for DB products; demo products keep their numeric id.
  const backendId = product.dbId ?? product.id;

  // Gallery: product image + up to 3 others from same category
  const sameCategoryImages = Array.from(
    new Set(
      catalog.filter((p) => p.category === product.category).map((p) => p.img)
    )
  );
  const gallery = [product.img, ...sameCategoryImages]
    .filter((img, index, self) => self.indexOf(img) === index)
    .slice(0, 4);

  const related = catalog
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const bestSelling = catalog
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const oldPrice = Math.round(product.price * 1.2);

  const handleAddToCart = () => {
    addToCart({
      id: backendId,
      title: product.title,
      price: product.price,
      currency: product.currency,
      image: product.img,
      imagePath: product.img,
      category: product.category,
    }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart({
      id: backendId,
      title: product.title,
      price: product.price,
      currency: product.currency,
      image: product.img,
      imagePath: product.img,
      category: product.category,
    }, quantity);
    navigate("/checkout");
  };

  const renderStars = (count = 5) => {
    const stars = [];
    for (let i = 0; i < count; i += 1) {
      stars.push(<FaStar key={i} className="text-xs sm:text-sm" />);
    }
    return stars;
  };

  return (
    <div className="bg-white px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 py-6 md:py-10">
      {/* Breadcrumbs */}
      <nav
        className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="hover:text-blue-500 transition-colors">
          Home
        </Link>
        <FiChevronRight className="text-xs" />
        <Link to="/store" className="hover:text-blue-500 transition-colors">
          Store
        </Link>
        <FiChevronRight className="text-xs" />
        <Link to="/store" className="hover:text-blue-500 transition-colors">
          {product.category}
        </Link>
        <FiChevronRight className="text-xs" />
        <span className="text-gray-900 font-medium">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_280px] gap-8 lg:gap-10">
        {/* ===== LEFT: GALLERY ===== */}
        <div>
          <div className="bg-[#F8F8F8] rounded-md flex items-center justify-center p-6 h-[260px] sm:h-[320px] lg:h-[380px]">
            <img
              src={gallery[mainImage]}
              alt={`${product.title} - Product image ${mainImage + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {gallery.map((img, index) => (
              <button
                key={`${img}-${index}`}
                onClick={() => setMainImage(index)}
                aria-label={`View image ${index + 1}`}
                className={`bg-[#F8F8F8] rounded-md h-[60px] sm:h-[70px] flex items-center justify-center p-1.5 transition ${
                  mainImage === index
                    ? "ring-2 ring-[#006CE4]"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`Product thumbnail - view option ${index + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>

        {/* ===== MIDDLE: INFO ===== */}
        <div className="min-w-0">
          {product.brand && (
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              {product.brand}
            </p>
          )}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#22262A] mt-1 leading-tight">
            {product.title}
          </h1>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div className="flex text-[#FFC107]">{renderStars()}</div>
            <span className="text-gray-500 text-sm">0 reviews</span>
            <button className="text-[#006CE4] text-sm hover:underline ml-1">
              Submit a review
            </button>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mt-5">
            <span className="text-3xl font-bold text-[#006CE4]">
              {product.currency}
              {product.price}
            </span>
            <span className="text-xl text-gray-400 line-through">
              {product.currency}
              {oldPrice}
            </span>
          </div>

          {/* Facts */}
          <ul className="mt-5 space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="text-gray-400 w-24">Availability:</span>
              <span className="text-green-600 font-medium">In stock</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-gray-400 w-24">Category:</span>
              {product.category}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-gray-400 w-24">Shipping:</span>
              <span className="flex items-center gap-1.5 text-green-600">
                <FaTruck /> Free shipping
              </span>
            </li>
          </ul>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-9 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
              >
                <FaMinus className="text-xs" />
              </button>
              <span className="w-10 text-center font-medium text-sm">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                aria-label="Increase quantity"
                className="w-9 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
              >
                <FaPlus className="text-xs" />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="bg-[#006CE4] text-white text-sm font-semibold px-6 py-2.5 rounded-sm hover:bg-[#1a7fd1] transition-colors">
              Buy Now
            </button>

            <button
              onClick={handleAddToCart}
              className={`text-sm font-semibold px-6 py-2.5 rounded-sm border-2 transition-colors ${
                added
                  ? "border-green-600 text-green-600"
                  : "border-[#006CE4] text-[#006CE4] hover:bg-blue-50"
              }`}
            >
              {added ? "Added ✓" : "Add To Cart"}
            </button>
          </div>



          {/* Tabs */}
          <div className="mt-8">
            <div className="flex gap-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("information")}
                className={`pb-2.5 text-sm font-medium transition-colors ${
                  activeTab === "information"
                    ? "text-[#006CE4] border-b-2 border-[#006CE4]"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Product Information
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`pb-2.5 text-sm font-medium transition-colors ${
                  activeTab === "reviews"
                    ? "text-[#006CE4] border-b-2 border-[#006CE4]"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Reviews
              </button>
            </div>

            <div className="py-5 text-sm text-gray-600 leading-relaxed space-y-3">
              {activeTab === "information" ? (
                <>
                  {product.description ? (
                    <p>{product.description}</p>
                  ) : (
                    <p className="text-gray-400">No description provided.</p>
                  )}
                  {product.features?.length > 0 && (
                    <ul className="space-y-1.5">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <FaCheck className="text-[#006CE4] mt-0.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <>
                  <p>There are no reviews yet. Be the first to review.</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ===== RIGHT: BEST SELLING + AD ===== */}
        <aside className="space-y-8">
          <div>
            <h3 className="font-bold text-base mb-4">Best selling</h3>
            <div className="space-y-4">
              {bestSelling.map((item) => (
                <Link
                  key={item.id}
                  to={`/store/product/${item.id}`}
                  className="flex gap-3 items-center group"
                >
                  <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] bg-[#F8F8F8] rounded-md flex items-center justify-center shrink-0 p-1.5">
                    <img
                      src={item.img}
                      alt={`${item.title} - Computer product thumbnail`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#22262A] leading-snug line-clamp-2 group-hover:text-[#006CE4] transition-colors">
                      {item.title}
                    </p>
                    <div className="flex text-[#FFC107] my-0.5">
                      {renderStars(4)}
                    </div>
                    <p className="text-sm">
                      <span className="text-[#006CE4] font-semibold">
                        {item.currency}
                        {item.price}
                      </span>{" "}
                      <span className="text-gray-400 line-through text-xs">
                        {item.currency}
                        {Math.round(item.price * 1.2)}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Ad box */}
          <div className="bg-[#F8F8F8] rounded-md p-5 text-center">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">
              Advertisement
            </p>
            <img
              src={adImage}
              alt="Featured computer equipment - Advertisement"
              className="h-24 mx-auto object-contain"
            />
            <p className="font-semibold text-sm mt-3">Product Name</p>
            <button className="mt-1.5 text-[#006CE4] text-xs font-medium hover:underline">
              Shop Now →
            </button>
          </div>
        </aside>
      </div>

      {/* ===== RELATED PRODUCTS ===== */}
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="text-lg sm:text-xl font-bold mb-5">
            Related Products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/store/product/${item.id}`}
                className="bg-[#F8F8F8] hover:bg-[#E6F2FF] rounded-md p-3 transition-colors"
              >
                <div className="h-[90px] sm:h-[110px] flex items-center justify-center">
                  <img
                    src={item.img}
                    alt={`${item.title} - Computer product`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-2">{item.category}</p>
                <p className="font-semibold text-sm text-[#22262A] leading-snug line-clamp-1">
                  {item.title}
                </p>
                <div className="flex text-[#FFC107] mt-1">{renderStars()}</div>
                <p className="text-[#006CE4] font-semibold text-sm mt-1">
                  {item.currency}
                  {item.price}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
