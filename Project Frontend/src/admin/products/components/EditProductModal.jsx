import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Package, Percent, Tag, X, Edit3 } from "lucide-react";
import { PRODUCT_CATEGORIES } from "../../../constants/categories";

/* ------------------------------------------------------------------ */
/* Validation — mirrors the server                                     */
/* ------------------------------------------------------------------ */

const validate = ({ name, category, salePrice, originalPrice, stock }) => {
  const errors = {};

  if (!name.trim()) errors.name = "Name is required";
  if (!category.trim()) errors.category = "Category is required";

  const sale = Number(salePrice);
  if (!salePrice.trim() || !Number.isFinite(sale) || sale < 0) {
    errors.salePrice = "Enter a price of 0 or more";
  }

  if (originalPrice.trim() !== "") {
    const orig = Number(originalPrice);
    if (!Number.isFinite(orig) || orig < 0) {
      errors.originalPrice = "Enter a price of 0 or more";
    } else if (Number.isFinite(sale) && orig < sale) {
      errors.originalPrice = "Original price can't be below the sale price";
    }
  }

  const stockValue = Number(stock);
  if (!stock.trim() || !Number.isInteger(stockValue) || stockValue < 0) {
    errors.stock = "Enter a whole number of 0 or more";
  }

  return errors;
};

const computeDiscount = (originalPrice, salePrice) => {
  const orig = Number(originalPrice);
  const sale = Number(salePrice);
  if (
    originalPrice.trim() === "" ||
    !Number.isFinite(orig) ||
    !Number.isFinite(sale) ||
    orig <= 0 ||
    sale < 0 ||
    orig <= sale
  ) {
    return 0;
  }
  return Math.round(((orig - sale) / orig) * 100);
};

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES = 8;
const BADGE_OPTIONS = ["Best seller", "New arrival", "Limited stock"];

/* ------------------------------------------------------------------ */
/* Field wrapper                                                       */
/* ------------------------------------------------------------------ */

const inputClass =
  "w-full rounded-lg border border-admin-line-2 bg-admin-panel-2 px-2.5 py-1.5 text-[11px] text-admin-fg outline-none transition-colors placeholder:text-admin-fg-dim focus:border-admin-line-strong disabled:cursor-not-allowed disabled:opacity-50";

function Field({ label, htmlFor, error, required = false, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-[11px] text-admin-fg-muted">
        {label}
        {required && (
          <span className="ml-0.5 text-red-400" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}

      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1 text-[10px] text-red-400">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-[10px] text-admin-fg-dim">{hint}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gallery picker — multiple files, first is the cover image           */
/* ------------------------------------------------------------------ */

function ImageGalleryPicker({ images, disabled, onPick, onRemove }) {
  const inputRef = useRef(null);
  const full = images.length >= MAX_IMAGES;
  const placeholderCount = Math.max(0, 4 - images.length - (full ? 0 : 1));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {!full && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-admin-line-2 bg-admin-panel-2 text-admin-fg-dim transition-colors hover:bg-admin-active hover:text-admin-fg-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImagePlus size={18} />
            <span className="text-[9px] font-medium">Add photo</span>
          </button>
        )}

        {images.map((img, index) => (
          <div
            key={img.url}
            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-admin-line-2 bg-admin-panel-2"
          >
            <img src={img.url} alt="" className="h-full w-full object-cover" />

            {index === 0 && (
              <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[8px] font-medium leading-tight text-white">
                Cover
              </span>
            )}

            {!disabled && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                aria-label={`Remove image ${index + 1}`}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white transition-colors hover:bg-black/80"
              >
                <X size={11} />
              </button>
            )}
          </div>
        ))}

        {Array.from({ length: placeholderCount }).map((_, i) => (
          <div
            key={`placeholder-${i}`}
            aria-hidden="true"
            className="h-20 w-20 shrink-0 rounded-xl border border-dashed border-admin-line-2/70 bg-admin-panel-2/40"
          />
        ))}
      </div>

      <input
        ref={inputRef}
        id="product-image"
        type="file"
        accept="image/*"
        multiple
        disabled={disabled}
        onChange={onPick}
        className="hidden"
      />

      <p className="mt-2 text-[10px] text-admin-fg-dim">
        {images.length > 0
          ? `${images.length} of ${MAX_IMAGES} · first photo is the cover image`
          : `First photo is the cover image. Up to ${MAX_IMAGES} photos · PNG, JPEG, WebP, GIF or AVIF · 5MB each`}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

export default function EditProductModal({ product, onClose, onUpdate }) {
  // Convert product data to form values
  // If discountPercent > 0, calculate original price from sale price
  const initialOriginalPrice = product.discountPercent > 0 
    ? (product.price / (1 - product.discountPercent / 100)).toFixed(2)
    : "";
  const initialSalePrice = product.price.toFixed(2);

  const [values, setValues] = useState({
    name: product.name || "",
    category: product.category || "",
    originalPrice: initialOriginalPrice,
    salePrice: initialSalePrice,
    stock: String(product.stock || 0),
    sku: product.sku || "",
    badge: product.badge || "",
    featured: product.featured || false,
    description: product.description || "",
  });

  // Convert existing images to the format the picker expects
  const [images, setImages] = useState(() => {
    const existing = product.images || [];
    return existing.map((url) => ({ url, existing: true }));
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const imagesRef = useRef([]);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(
    () => () => {
      imagesRef.current.forEach((img) => {
        // Only revoke URLs we created (new files), not existing URLs from the server
        if (!img.existing && img.url) {
          URL.revokeObjectURL(img.url);
        }
      });
    },
    [],
  );

  const requestClose = () => {
    if (!saving) onClose();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  const setField = (key) => (e) => {
    const { type, value, checked } = e.target;
    const nextValue = type === "checkbox" ? checked : value;
    setValues((prev) => ({ ...prev, [key]: nextValue }));
    setFormError("");
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const selectBadge = (badge) => {
    if (saving) return;
    setValues((prev) => ({ ...prev, badge }));
    setFormError("");
  };

  const onPickFiles = (e) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (picked.length === 0) return;

    const problems = [];
    const accepted = [];
    for (const file of picked) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        problems.push(`${file.name} isn't a supported image type.`);
      } else if (file.size > MAX_IMAGE_BYTES) {
        problems.push(`${file.name} is larger than 5MB.`);
      } else {
        accepted.push(file);
      }
    }

    const room = MAX_IMAGES - images.length;
    const toAdd = accepted.slice(0, Math.max(0, room));
    if (accepted.length > toAdd.length) {
      problems.push(`You can attach at most ${MAX_IMAGES} images.`);
    }

    if (toAdd.length > 0) {
      const created = toAdd.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        existing: false,
      }));
      setImages((prev) => [...prev, ...created]);
    }

    setFormError(problems.join(" "));
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const target = prev[index];
      if (target && !target.existing) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((_, i) => i !== index);
    });
    setFormError("");
  };

  const discountPercent = computeDiscount(values.originalPrice, values.salePrice);
  const hasDeal = discountPercent > 0;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const sale = Number(values.salePrice.trim());
    const listPrice = values.originalPrice.trim()
      ? Number(values.originalPrice.trim())
      : sale;

    // Build JSON payload (image editing not supported yet - backend needs multipart support)
    const updates = {
      name: values.name.trim(),
      category: values.category.trim(),
      price: listPrice,
      discountPercent: discountPercent,
      stock: Number(values.stock.trim()),
      description: values.description.trim(),
      featured: values.featured,
    };

    if (values.sku.trim()) {
      updates.sku = values.sku.trim();
    }
    
    if (values.badge) {
      updates.badge = values.badge;
    } else {
      updates.badge = null; // Clear badge if "None" is selected
    }

    setSaving(true);
    setFormError("");

    const result = await onUpdate(product.id, updates);

    if (!result?.success) {
      setFormError(result?.error || "Could not update the product.");
      setSaving(false);
    }
  };

  const describedBy = (key) => (errors[key] ? `product-${key}-error` : undefined);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-product-title"
      onClick={requestClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
        noValidate
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-admin-line-2 bg-admin-panel-3 p-6 shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white">
              <Edit3 size={18} />
            </span>
            <div>
              <h3
                id="edit-product-title"
                className="text-[15px] font-semibold text-admin-fg"
              >
                Edit product
              </h3>
              <p className="mt-0.5 text-[11px] text-admin-fg-muted">
                Update {product.name} details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={requestClose}
            aria-label="Close"
            className="rounded-md p-1 text-admin-fg-dim transition-colors hover:bg-admin-active hover:text-admin-fg"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Product images" htmlFor="product-image">
            <ImageGalleryPicker
              images={images}
              disabled={true}
              onPick={onPickFiles}
              onRemove={removeImage}
            />
            <p className="mt-2 text-[10px] text-amber-400">
              ⚠️ Image editing is view-only. To change images, use "Add product" to create a new product or contact support.
            </p>
          </Field>

          <Field
            label="Product name"
            htmlFor="product-name"
            required
            error={errors.name}
          >
            <input
              id="product-name"
              type="text"
              value={values.name}
              onChange={setField("name")}
              disabled={saving}
              placeholder="Wireless bluetooth headphones"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={describedBy("name")}
              className={inputClass}
            />
          </Field>

          <Field
            label="Category"
            htmlFor="product-category"
            required
            error={errors.category}
            hint="One of the store's five categories."
          >
            <select
              id="product-category"
              value={values.category}
              onChange={setField("category")}
              disabled={saving}
              aria-invalid={Boolean(errors.category)}
              aria-describedby={describedBy("category")}
              className={inputClass}
            >
              <option value="" disabled>
                Select a category
              </option>
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>

          <div className="rounded-xl border border-admin-line-2 bg-admin-panel-2 p-3.5">
            <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium text-admin-fg-soft">
              <Tag size={12} className="text-red-400" />
              Pricing
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Original price"
                htmlFor="product-originalPrice"
                error={errors.originalPrice}
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-admin-fg-dim">
                    $
                  </span>
                  <input
                    id="product-originalPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={values.originalPrice}
                    onChange={setField("originalPrice")}
                    disabled={saving}
                    placeholder="3,999"
                    aria-invalid={Boolean(errors.originalPrice)}
                    aria-describedby={describedBy("originalPrice")}
                    className={`${inputClass} pl-6`}
                  />
                </div>
              </Field>

              <Field
                label="Sale price"
                htmlFor="product-salePrice"
                required
                error={errors.salePrice}
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-admin-fg-dim">
                    $
                  </span>
                  <input
                    id="product-salePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={values.salePrice}
                    onChange={setField("salePrice")}
                    disabled={saving}
                    placeholder="2,699"
                    aria-invalid={Boolean(errors.salePrice)}
                    aria-describedby={describedBy("salePrice")}
                    className={`${inputClass} pl-6`}
                  />
                </div>
              </Field>
            </div>

            {hasDeal && (
              <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-[11px] font-medium text-red-300">
                <Percent size={12} />
                {discountPercent}% off — shown as a badge on the listing
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Stock"
              htmlFor="product-stock"
              required
              error={errors.stock}
            >
              <input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                value={values.stock}
                onChange={setField("stock")}
                disabled={saving}
                placeholder="25"
                aria-invalid={Boolean(errors.stock)}
                aria-describedby={describedBy("stock")}
                className={inputClass}
              />
            </Field>

            <Field label="SKU" htmlFor="product-sku" hint="Optional stock reference.">
              <input
                id="product-sku"
                type="text"
                value={values.sku}
                onChange={setField("sku")}
                disabled={saving}
                placeholder="HP-BT-001"
                className={inputClass}
              />
            </Field>
          </div>

          <div>
            <span className="mb-1 block text-[11px] text-admin-fg-muted">Badge</span>
            <div className="flex flex-wrap gap-2">
              {[...BADGE_OPTIONS, ""].map((option) => {
                const selected = values.badge === option;
                const label = option || "None";
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => selectBadge(option)}
                    disabled={saving}
                    aria-pressed={selected}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      selected
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-admin-line-2 text-admin-fg-soft hover:bg-admin-active hover:text-admin-fg"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-[10px] text-admin-fg-dim">
              Optional label shown on the product card.
            </p>
          </div>

          <Field label="Description" htmlFor="product-description">
            <textarea
              id="product-description"
              rows={3}
              value={values.description}
              onChange={setField("description")}
              disabled={saving}
              placeholder="Key features, materials, what's in the box…"
              className={`${inputClass} resize-none`}
            />
          </Field>

          <label
            htmlFor="product-featured"
            className="flex cursor-pointer items-center gap-2 text-[11px] text-admin-fg-muted"
          >
            <input
              id="product-featured"
              type="checkbox"
              checked={values.featured}
              onChange={setField("featured")}
              disabled={saving}
              className="h-3.5 w-3.5 shrink-0 accent-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
            Feature on homepage
            <span className="text-admin-fg-dim">— shown in "Handpicked".</span>
          </label>
        </div>

        {formError && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300"
          >
            {formError}
          </p>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={requestClose}
            disabled={saving}
            className="rounded-lg border border-admin-line-2 px-4 py-2 text-[11px] text-admin-fg-soft transition-colors hover:bg-admin-active disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-[11px] font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <Loader2 size={12} className="animate-spin" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
