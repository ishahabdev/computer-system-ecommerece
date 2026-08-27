import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FaStar, FaTruck, FaRegHeart, FaHeart } from "react-icons/fa";
import { FaMinus, FaPlus, FaCheck } from "react-icons/fa6";
import {
  FiChevronRight,
  FiChevronUp,
  FiChevronDown,
  FiShare2,
} from "react-icons/fi";
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
import adImage from "../../assets/homePIc/homeflash1.webp";

const LOW_STOCK_AT = 5;
const MAX_QTY = 20;
// Above this many images the thumbnail strip gets scroll controls.
const THUMB_SCROLL_AT = 4;

/* ------------------------------------------------------------------ */
/* Gallery — one large image + a scrollable thumbnail strip            */
/* (vertical beside the image on desktop, horizontal below on mobile)  */
/* ------------------------------------------------------------------ */

function Gallery({ images, title, badge }) {
  const [active, setActive] = useState(0);
  const stripRef = useRef(null);

  // Defensive: if the image list is shorter than a stale index, clamp.
  const safeActive = Math.min(active, images.length - 1);
  const scrollable = images.length > THUMB_SCROLL_AT;

  const scrollThumbs = (dir) => {
    const el = stripRef.current;
    if (!el) return;
    // Only the overflowing axis actually moves, so nudging both top and left
    // handles the vertical (desktop) and horizontal (mobile) layouts alike.
    el.scrollBy({ top: dir * 200, left: dir * 200, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {/* Thumbnail strip */}
      <div className="flex items-center gap-2 sm:flex-col">
        {scrollable && (
          <button
            type="button"
            onClick={() => scrollThumbs(-1)}
            aria-label="Scroll thumbnails back"
            className="hidden h-6 w-16 items-center justify-center rounded-md bg-[#F8F8F8] text-gray-500 transition-colors hover:bg-[#E6F2FF] hover:text-[#006CE4] sm:flex"
          >
            <FiChevronUp />
          </button>
        )}

        <div
          ref={stripRef}
          className="flex gap-2 overflow-x-auto pb-1 sm:max-h-[380px] sm:flex-col sm:overflow-y-auto sm:overflow-x-visible sm:pb-0 sm:pr-1"
        >
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

        {scrollable && (
          <button
            type="button"
            onClick={() => scrollThumbs(1)}
            aria-label="Scroll thumbnails forward"
            className="hidden h-6 w-16 items-center justify-center rounded-md bg-[#F8F8F8] text-gray-500 transition-colors hover:bg-[#E6F2FF] hover:text-[#006CE4] sm:flex"
          >
            <FiChevronDown />
          </button>
        )}
      </div>

      {/* Main image */}
      <div className="relative flex h-[280px] flex-1 items-center justify-center rounded-md bg-[#F8F8F8] p-6 sm:h-[340px] lg:h-[400px]">
        {badge && (
          <span className="absolute left-3 top-3 rounded-md bg-[#E11D48] px-2 py-1 text-xs font-bold text-white shadow-sm">
            {badge}
          </span>
        )}
        <img
          src={images[safeActive]}
          alt={`${title} - image ${safeActive + 1}`}
          className="max-h-full max-w-full object-contain"
        />
      </div>
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
  const [shareMsg, setShareMsg] = useState("");
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
  const savings = hasDeal ? Math.round((listPrice - salePrice) * 100) / 100 : 0;

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

  const bestSelling = catalog.filter((p) => p.id !== product.id).slice(0, 3);

  // Specifications table — the backend has no dedicated specs field, so this is
  // derived from the columns a product does have. Nulls are filtered out.
  const specs = [
    ["Category", product.category],
    product.brand ? ["Brand", product.brand] : null,
    [
      "Availability",
      outOfStock
        ? "Out of stock"
        : knowsStock
          ? `${product.stock} in stock`
          : "In stock",
    ],
    ["Price", `${product.currency}${formatPrice(salePrice)}`],
    hasDeal
      ? [
          "Discount",
          `${discountPercent}% off (was ${product.currency}${formatPrice(listPrice)})`,
        ]
      : ["Discount", "None"],
    product.sku ? ["SKU", product.sku] : null,
  ].filter(Boolean);

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

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, url });
      } catch {
        // The user dismissed the share sheet — nothing to do.
      }
      return;
    }
    // No native share (most desktops): copy the link and confirm inline.
    try {
      await navigator.clipboard.writeText(url);
      setShareMsg("Link copied!");
    } catch {
      setShareMsg("Couldn’t copy link");
    }
    setTimeout(() => setShareMsg(""), 2000);
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
        <Link to="/store" className="transition-colors hover:text-blue-500">
          Store
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_280px] lg:gap-10">
        {/* ===== LEFT: GALLERY ===== */}
        <Gallery
          images={gallery}
          title={product.title}
          badge={hasDeal ? `-${discountPercent}%` : null}
        />

        {/* ===== MIDDLE: INFO ===== */}
        <div className="min-w-0">
          {product.brand && (
            <p className="text-xs uppercase tracking-wide text-gray-400">
              {product.brand}
            </p>
          )}
          <h1 className="mt-1 text-xl font-bold leading-tight text-[#22262A] sm:text-2xl lg:text-3xl">
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
              Write a review
            </button>
          </div>

          {/* Price block */}
          <div className="mt-5">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold text-[#006CE4]">
                {product.currency}
                {formatPrice(salePrice)}
              </span>
              {hasDeal && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {product.currency}
                    {formatPrice(listPrice)}
                  </span>
                  <span className="rounded-md bg-[#E11D48] px-2 py-0.5 text-sm font-bold text-white">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>
            {hasDeal && (
              <p className="mt-1 text-sm font-medium text-green-600">
                You save {product.currency}
                {formatPrice(savings)}
              </p>
            )}
          </div>

          {/* Stock indicator */}
          <div className="mt-4">
            {outOfStock ? (
              <span className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1 text-sm font-medium text-red-600">
                Out of stock
              </span>
            ) : lowStock ? (
              <span className="inline-flex items-center rounded-md bg-orange-50 px-2.5 py-1 text-sm font-medium text-orange-600">
                Only {product.stock} left in stock
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-sm font-medium text-green-600">
                In stock
              </span>
            )}
          </div>

          {/* Facts */}
          <ul className="mt-5 space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="w-24 text-gray-400">Category:</span>
              <Link
                to={`/store?category=${encodeURIComponent(product.category)}`}
                className="hover:text-[#006CE4] hover:underline"
              >
                {product.category}
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-24 text-gray-400">Shipping:</span>
              <span className="flex items-center gap-1.5 text-green-600">
                <FaTruck /> Free shipping
              </span>
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
              className="rounded-md bg-[#006CE4] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1a7fd1] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Buy Now
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={`rounded-md border-2 px-6 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 ${
                added
                  ? "border-green-600 text-green-600"
                  : "border-[#006CE4] text-[#006CE4] hover:bg-blue-50"
              }`}
            >
              {added ? "Added ✓" : "Add To Cart"}
            </button>
          </div>

          {/* Secondary actions */}
          <div className="mt-4 flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => toggleWishlist(cartPayload)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                inWishlist ? "text-red-600" : "text-gray-600 hover:text-[#006CE4]"
              }`}
            >
              {inWishlist ? <FaHeart /> : <FaRegHeart />}
              {inWishlist ? "In wishlist" : "Add to wishlist"}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-[#006CE4]"
            >
              <FiShare2 />
              {shareMsg || "Share"}
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-8">
            <div className="flex gap-6 border-b border-gray-200">
              {[
                ["description", "Description"],
                ["specifications", "Specifications"],
                ["reviews", "Reviews"],
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

              {activeTab === "specifications" && (
                <table className="w-full max-w-lg border-collapse text-sm">
                  <tbody>
                    {specs.map(([label, value]) => (
                      <tr key={label} className="border-b border-gray-100">
                        <th
                          scope="row"
                          className="w-40 py-2 pr-4 text-left font-medium text-gray-500"
                        >
                          {label}
                        </th>
                        <td className="py-2 text-gray-800">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "reviews" && (
                <p>There are no reviews yet. Be the first to review.</p>
              )}
            </div>
          </div>
        </div>

        {/* ===== RIGHT: BEST SELLING + AD ===== */}
        <aside className="space-y-8">
          <div>
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
                    className="group flex items-center gap-3"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-[#F8F8F8] p-1.5 sm:h-[72px] sm:w-[72px]">
                      <img
                        src={item.img}
                        alt={`${item.title} thumbnail`}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#22262A] transition-colors group-hover:text-[#006CE4]">
                        {item.title}
                      </p>
                      <div className="my-0.5 flex text-[#FFC107]">
                        {renderStars(4)}
                      </div>
                      <p className="text-sm">
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
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Ad box */}
          <div className="rounded-md bg-[#F8F8F8] p-5 text-center">
            <p className="mb-3 text-[10px] uppercase tracking-wider text-gray-400">
              Advertisement
            </p>
            <img
              src={adImage}
              alt="Featured computer equipment"
              className="mx-auto h-24 object-contain"
            />
            <p className="mt-3 text-sm font-semibold">Top picks this week</p>
            <Link
              to="/deals"
              className="mt-1.5 inline-block text-xs font-medium text-[#006CE4] hover:underline"
            >
              Shop deals →
            </Link>
          </div>
        </aside>
      </div>

      {/* ===== RELATED PRODUCTS ===== */}
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-5 text-lg font-bold sm:text-xl">Related Products</h2>
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
