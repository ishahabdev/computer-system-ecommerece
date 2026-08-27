import React from "react";
import { Link } from "react-router-dom";
import Typography from "../../../components/common/Typography";
import { FaStar } from "react-icons/fa";
import { FaRegStarHalfStroke } from "react-icons/fa6";

const ProductCard = ({
  product,
  imgSize = "w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] md:w-[150px] md:h-[150px]",
}) => (
  <Link
    to={`/store/product/${product.id}`}
    className="bg-[#F8F8F8] p-3 sm:p-4 relative block hover:shadow-lg transition-shadow"
  >
    <Typography
      varient="h4"
      style="text-[#2196F3] font-semibold"
    >{`${product.currency}${product.price}`}</Typography>

    <div className={`mx-auto flex items-center justify-center ${imgSize}`}>
      <img
        src={product.img}
        className="max-w-full max-h-full object-contain"
        alt={product.title}
      />
    </div>

    <Typography varient="small">{product.category}</Typography>
    <Typography style="font-semibold" varient="p">
      {product.title}
    </Typography>
    <div className="flex text-[#FFC107] text-sm mt-1">
      <FaStar />
      <FaStar />
      <FaStar />
      <FaStar />
      <FaRegStarHalfStroke />
    </div>
  </Link>
);

// A single grey placeholder box, sized like a card, shown while the catalog loads.
const CardSkeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-[#F1F3F5] ${className}`} />
);

const Cards = ({ products = [], loading = false, error = "" }) => {
  // Admin-flagged products fill "Handpicked". If none are flagged yet, fall back
  // to the six newest so the section is never empty during the data transition.
  const flagged = products.filter((p) => p.featured);
  const picks = (flagged.length > 0 ? flagged : products).slice(0, 6);
  const [featured, top1, top2, bottom1, bottom2, bottom3] = picks;

  // On a hard failure there's nothing to hand-pick — hide the section rather than
  // show a broken shell (the store grid surfaces the real error separately).
  if (error) return null;

  return (
    <div className="bg-white px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36">
      <Typography
        style="text-center flex justify-center mx-auto py-6 sm:py-8 md:py-10 font-semibold text-xl sm:text-2xl md:text-3xl"
        varient="h3"
      >
        Handpicked by our techies
      </Typography>

      {loading ? (
        <div className="flex flex-col lg:flex-row gap-6">
          <CardSkeleton className="w-full lg:w-[45%] xl:w-[700px] h-[360px]" />
          <div className="flex flex-col gap-6 flex-1">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <CardSkeleton className="h-[220px]" />
              <CardSkeleton className="h-[220px]" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              <CardSkeleton className="h-[180px]" />
              <CardSkeleton className="h-[180px]" />
              <CardSkeleton className="h-[180px]" />
            </div>
          </div>
        </div>
      ) : picks.length === 0 ? (
        <p className="pb-10 text-center text-gray-500">
          No products to feature yet.
        </p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Big featured card, full height */}
          {featured && (
            <Link
              to={`/store/product/${featured.id}`}
              className="bg-[#F8F8F8] p-4 relative w-full lg:w-[45%] xl:w-[700px] flex flex-col hover:shadow-lg transition-shadow"
            >
              <Typography
                varient="h4"
                style="text-[#2196F3] font-semibold"
              >{`${featured.currency}${featured.price}`}</Typography>

              <div className="flex-1 flex items-center justify-center py-4">
                <img
                  src={featured.img}
                  className="max-w-full max-h-[220px] sm:max-h-[260px] md:max-h-[300px] lg:max-h-[320px] object-contain"
                  alt={featured.title}
                />
              </div>

              <Typography varient="small">{featured.category}</Typography>
              <Typography style="font-semibold" varient="p">
                {featured.title}
              </Typography>
              <div className="flex text-[#FFC107] text-sm mt-1">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaRegStarHalfStroke />
              </div>
            </Link>
          )}

          {/* Right side: top row (2 cards) + bottom row (3 cards) */}
          <div className="flex flex-col gap-6 flex-1">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {top1 && (
                <ProductCard
                  product={top1}
                  imgSize="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] md:w-[170px] md:h-[170px] lg:w-[180px] lg:h-[180px]"
                />
              )}
              {top2 && (
                <ProductCard
                  product={top2}
                  imgSize="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] md:w-[170px] md:h-[170px] lg:w-[180px] lg:h-[180px]"
                />
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {bottom1 && <ProductCard product={bottom1} />}
              {bottom2 && <ProductCard product={bottom2} />}
              {bottom3 && <ProductCard product={bottom3} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cards;