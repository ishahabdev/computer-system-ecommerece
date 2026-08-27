import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaTruck,
  FaRegHeart,
  FaHeart,
  FaFacebookF,
  FaTwitter,
} from "react-icons/fa";
import { FaMinus, FaPlus, FaCheck } from "react-icons/fa6";
import { FiChevronRight } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { getProductById, products as demoProducts } from "./data";
import {
  fetchProductById,
  fetchProducts,
  formatPrice,
  parseStoreId,
} from "./productApi";
import StoreProductCard from "./components/StoreProductCard";

const LOW_STOCK_AT = 5;
const MAX_QTY = 20;

/* ------------------------------------------------------------------ */
/* Gallery — one large image with a centered thumbnail row beneath it  */
/* ------------------------------------------------------------------ */

function Gallery({ images, title }) {
  const [active, setActive] = useState(0);

  // Defensive: if the image list is shorter than a stale index, clamp.
  const safeActive = Math.min(active, images.length - 1);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="flex h-[280px] items-center justify-center rounded-md bg-[#F8F8F8] p-6 sm:h-[340px] lg:h-[400px]">
        <img
          src={images[safeActive]}
          alt={`${title} - image ${safeActive + 1}`}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Thumbnail row (only worth showing when there's more than one image) */}
      {images.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2">
          {images.map((img, index) => (
            <button
              key={`${img}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              aria-pressed={safeActive === index}
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-[#F8F8F8] p-1.5 transition ${
                safeActive === index
                  ? "ring-2 ring-[#006CE4]"
                  : "opacity-70 ring-1 ring-transparent hover:opacity-100 hover:ring-[#006CE4]/30"
              }`}
            >
              <img
                src={img}
                alt={`${title} thumbnail ${index + 1}`}
                loading="lazy"
                className="max-h-full max-w-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* View                                                                */
/* ------------------------------------------------------------------ */

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
  const [activeTab, setActiveTab] = useState("description");
  const { addToCart, startBuyNow } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

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
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-gray-500">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-[#006CE4]" />
        <p className="mt-4 text-sm">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
        <p className="text-6xl font-black text-[#2196F3]">404</p>
        <h1 className="mt-4 text-xl font-bold">Product not found</h1>
        <Link
          to="/store"
          className="mt-6 rounded-md bg-[#2196F3] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1a7fd1]"
        >
          Back to Store
        </Link>
      </div>
    );
  }

  // The cart POSTs this id to the backend as productId, so use the real integer
  // dbId for DB products; demo products keep their numeric id.
  const backendId = product.dbId ?? product.id;

  // ---- Normalized view model (works for DB + demo products) -------------
  // DB products carry a full `images` array and deal fields from the mapper;
  // demo products have only a single `img` and no discount. Fall back so both
  // render through the same markup below.
  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.img].filter(Boolean);
  const gallery = images.length > 0 ? images : [product.img];

  const listPrice = product.price;
  const salePrice = product.salePrice ?? product.price;
  const discountPercent = product.discountPercent ?? 0;
  const hasDeal = Boolean(product.hasDeal) && discountPercent > 0;

  const knowsStock = typeof product.stock === "number";
  const outOfStock = knowsStock && product.stock === 0;
  const lowStock =
    knowsStock && product.stock > 0 && product.stock <= LOW_STOCK_AT;
  const maxQty = knowsStock
    ? Math.max(1, Math.min(MAX_QTY, product.stock))
    : MAX_QTY;

  const inWishlist = isInWishlist(backendId);

  const related = catalog
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const bestSelling = catalog.filter((p) => p.id !== product.id).slice(0, 1);

  // Both cart and wishlist persist the price we pass, so passing salePrice is
  // what makes a deal actually charge the discounted amount at checkout.
  const cartPayload = {
    id: backendId,
    title: product.title,
    price: salePrice,
    currency: product.currency,
    image: product.img,
    imagePath: product.img,
    category: product.category,
  };

  // Social share targets — point at the current product URL (SPA: window is
  // always available by the time this renders).
  const shareUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(product.title);
  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
  const twitterShare = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;

  const handleAddToCart = () => {
    if (outOfStock) return;
    addToCart(cartPayload, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    // Buy Now is a direct, fresh checkout for just this product — it must not
    // touch the cart. startBuyNow REPLACES any prior Buy Now session, so
    // repeated clicks (or coming back from checkout and clicking again) never
    // duplicate the item or inflate the price.
    startBuyNow(cartPayload, quantity);
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
    <div className="bg-white px-4 py-6 sm:px-6 md:px-10 md:py-10 lg:px-20 xl:px-32">
      {/* Breadcrumbs */}
      <nav
        className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-gray-500"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="transition-colors hover:text-blue-500">
          Home
        </Link>
        <FiChevronRight className="text-xs" />
        <Link
          to={`/store?category=${encodeURIComponent(product.category)}`}
          className="transition-colors hover:text-blue-500"
        >
          {product.category}
        </Link>
        <FiChevronRight className="text-xs" />
        <span className="font-medium text-gray-900">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px] lg:gap-10">
        {/* ===== LEFT: GALLERY + INFO + TABS ===== */}
        <div className="min-w-0">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Gallery */}
            <Gallery images={gallery} title={product.title} />

            {/* Info */}
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight text-[#22262A] sm:text-2xl lg:text-3xl">
                {product.title}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <div className="flex text-[#FFC107]">{renderStars()}</div>
                <span className="text-sm text-gray-500">0 reviews</span>
                <button
                  type="button"
                  onClick={() => setActiveTab("reviews")}
                  className="ml-1 text-sm text-[#006CE4] hover:underline"
                >
                  Submit a review
                </button>
              </div>

              {/* Price + wishlist */}
              <div className="mt-5 flex items-start justify-between gap-4">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-3xl font-bold text-[#006CE4]">
                    {product.currency}
                    {formatPrice(salePrice)}
                  </span>
                  {hasDeal && (
                    <span className="text-xl text-gray-400 line-through">
                      {product.currency}
                      {formatPrice(listPrice)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => toggleWishlist(cartPayload)}
                  aria-label={
                    inWishlist ? "Remove from wishlist" : "Add to wishlist"
                  }
                  aria-pressed={inWishlist}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    inWishlist
                      ? "border-red-200 bg-red-50 text-red-600"
                      : "border-gray-200 bg-[#F8F8F8] text-gray-500 hover:text-[#006CE4]"
                  }`}
                >
                  {inWishlist ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>

              {/* Facts */}
              <ul className="mt-5 space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-24 text-gray-400">Availability:</span>
                  <span
                    className={`font-medium ${
                      outOfStock
                        ? "text-red-600"
                        : lowStock
                          ? "text-orange-500"
                          : "text-green-600"
                    }`}
                  >
                    {outOfStock
                      ? "Out of stock"
                      : lowStock
                        ? `Only ${product.stock} left`
                        : "In stock"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-24 text-gray-400">Category:</span>
                  <Link
                    to={`/store?category=${encodeURIComponent(product.category)}`}
                    className="hover:text-[#006CE4] hover:underline"
                  >
                    {product.category}
                  </Link>
                </li>
                <li className="flex items-center gap-1.5 text-green-600">
                  <FaTruck /> Free shipping
                </li>
              </ul>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="flex items-center overflow-hidden rounded-md border border-gray-300">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={outOfStock}
                    aria-label="Decrease quantity"
                    className="flex h-10 w-9 items-center justify-center text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FaMinus className="text-xs" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    disabled={outOfStock || quantity >= maxQty}
                    aria-label="Increase quantity"
                    className="flex h-10 w-9 items-center justify-center text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FaPlus className="text-xs" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={outOfStock}
                  className="rounded-md bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Buy Now
                </button>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className={`rounded-md px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 ${
                    added ? "bg-green-600" : "bg-[#006CE4] hover:bg-[#1a7fd1]"
                  }`}
                >
                  {added ? "Added ✓" : "Add To Cart"}
                </button>
              </div>

              {/* Share */}
              <div className="mt-5 flex items-center gap-3">
                <span className="text-sm text-gray-600">Share it on</span>
                <a
                  href={facebookShare}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on Facebook"
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1877F2] text-white transition-opacity hover:opacity-90"
                >
                  <FaFacebookF className="text-sm" />
                </a>
                <a
                  href={twitterShare}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on Twitter"
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1DA1F2] text-white transition-opacity hover:opacity-90"
                >
                  <FaTwitter className="text-sm" />
                </a>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-10">
            <div className="flex gap-6 border-b border-gray-200">
              {[
                ["description", "Product Information"],
                ["reviews", "Reviews 0"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`pb-2.5 text-sm font-medium transition-colors ${
                    activeTab === key
                      ? "border-b-2 border-[#006CE4] text-[#006CE4]"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="py-5 text-sm leading-relaxed text-gray-600">
              {activeTab === "description" && (
                <div className="space-y-3">
                  {product.description ? (
                    <p>{product.description}</p>
                  ) : (
                    <p className="text-gray-400">No description provided.</p>
                  )}
                  {product.features?.length > 0 && (
                    <ul className="space-y-1.5">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <FaCheck className="mt-0.5 shrink-0 text-[#006CE4]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <p>There are no reviews yet. Be the first to review.</p>
              )}
            </div>
          </div>
        </div>

        {/* ===== RIGHT: BEST SELLING ===== */}
        <aside>
          <h3 className="mb-4 text-base font-bold">Best selling</h3>
          <div className="space-y-4">
            {bestSelling.map((item) => {
              const itemSale = item.salePrice ?? item.price;
              const itemHasDeal =
                Boolean(item.hasDeal) && item.discountPercent > 0;
              return (
                <Link
                  key={item.id}
                  to={`/store/product/${item.id}`}
                  className="group block rounded-md border border-gray-200 p-4 text-center transition-colors hover:border-[#006CE4]/40 hover:bg-[#E6F2FF]/40"
                >
                  <div className="mx-auto flex h-32 w-full items-center justify-center rounded-md bg-[#F8F8F8] p-3">
                    <img
                      src={item.img}
                      alt={`${item.title} thumbnail`}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-[#22262A] transition-colors group-hover:text-[#006CE4]">
                    {item.title}
                  </p>
                  <div className="mt-1 flex justify-center text-[#FFC107]">
                    {renderStars(4)}
                  </div>
                  <p className="mt-1 text-sm">
                    <span className="font-semibold text-[#006CE4]">
                      {item.currency}
                      {formatPrice(itemSale)}
                    </span>{" "}
                    {itemHasDeal && (
                      <span className="text-xs text-gray-400 line-through">
                        {item.currency}
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </p>
                </Link>
              );
            })}
          </div>
        </aside>
      </div>

      {/* ===== RELATED PRODUCTS ===== */}
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-5 text-center text-lg font-bold sm:text-xl">
            Related products
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {related.map((item) => (
              <StoreProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
