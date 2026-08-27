import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Package, Percent, Tag, X } from "lucide-react";
import { PRODUCT_CATEGORIES } from "../../../constants/categories";

/* ------------------------------------------------------------------ */
/* Validation — mirrors the server                                     */
/* ------------------------------------------------------------------ */

// Kept in step with the rules in productController.js. Catching a bad value here
// saves a round trip, and stops multer writing images to disk only for the
// controller to reject the submission and unlink them again.
const validate = ({ name, category, salePrice, originalPrice, stock }) => {
  const errors = {};

  if (!name.trim()) errors.name = "Name is required";
  if (!category.trim()) errors.category = "Category is required";

  // The sale price is what the product actually sells for, so it's required.
  // Number("") and Number(" ") are both 0, so blank has to be rejected before
  // parsing — otherwise an omitted price would silently pass as free.
  const sale = Number(salePrice);
  if (!salePrice.trim() || !Number.isFinite(sale) || sale < 0) {
    errors.salePrice = "Enter a price of 0 or more";
  }

  // Optional "was" price. When present it must be a valid number and at least the
  // sale price — a lower one would be a negative discount.
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

  // SKU and badge are optional and validated on the server; nothing to block here.
  return errors;
};

// The store stores an integer discount %, not a sale price, and derives the sale
// price back from it. So an original + sale price becomes the nearest whole
// "% off" — computed here so the modal can show exactly what will be saved. No
// original, or an original at/below the sale price, means "not a deal" (0).
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

// Same limits the upload middleware enforces. Checked client-side too so a 20MB
// photo fails instantly instead of after a full upload.
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
// Mirrors MAX_IMAGES in the upload middleware — a product's gallery is capped.
const MAX_IMAGES = 8;

// Merchandising labels. Mirrors ALLOWED_BADGES in productController.js; "" is the
// "None" choice and sends no badge.
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
  // Keep the picker's grid shape by padding to at least four tiles (the add tile
  // counts as one) with faint placeholders.
  const placeholderCount = Math.max(0, 4 - images.length - (full ? 0 : 1));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {/* Add tile first, matching the design's cover-then-gallery order. */}
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

            {/* The first image is what the store card / cart / wishlist show. */}
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

const EMPTY_FORM = {
  name: "",
  category: "",
  originalPrice: "",
  salePrice: "",
  stock: "",
  sku: "",
  badge: "",
  featured: false,
  description: "",
};

export default function AddProductModal({ onClose, onCreate }) {
  const [values, setValues] = useState(EMPTY_FORM);
  // Each entry pairs the picked File with its preview object URL so they can
  // never disagree. The first entry becomes the product's cover image.
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Mirrors `images` so the unmount cleanup can revoke every live object URL
  // without depending on `images` (which would re-run and revoke URLs still shown).
  const imagesRef = useRef([]);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // The modal unmounts on cancel and on success; release any previews still alive.
  useEffect(
    () => () => {
      imagesRef.current.forEach((img) => URL.revokeObjectURL(img.url));
    },
    [],
  );

  // Closing mid-request would drop the form while the product is still being
  // created, so both dismiss paths are blocked until the call settles.
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
    // Checkboxes (e.g. "featured") carry their state in `checked`, not `value`.
    const nextValue = type === "checkbox" ? checked : value;
    setValues((prev) => ({ ...prev, [key]: nextValue }));
    setFormError("");
    // Drop the field's error as soon as it is edited; submit re-validates.
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Badge is a single-select set of pills, so it sets state directly. Picking the
  // active label or "None" (value "") clears the badge.
  const selectBadge = (badge) => {
    if (saving) return;
    setValues((prev) => ({ ...prev, badge }));
    setFormError("");
  };

  const onPickFiles = (e) => {
    const picked = Array.from(e.target.files ?? []);
    // Reset the input so re-picking the same file still fires a change event.
    e.target.value = "";
    if (picked.length === 0) return;

    // Validate each file individually so one bad photo doesn't reject the batch.
    const problems = [];
    const accepted = [];
    for (const file of picked) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        problems.push(`${file.name} isn’t a supported image type.`);
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
      }));
      setImages((prev) => [...prev, ...created]);
    }

    setFormError(problems.join(" "));
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== index);
    });
    setFormError("");
  };

  // Live discount preview, also what gets saved. Derived from the two price fields.
  const discountPercent = computeDiscount(values.originalPrice, values.salePrice);
  const hasDeal = discountPercent > 0;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Map the two-price UI onto the backend's list-price + discount model. The
    // stored `price` is the list price: the original ("was") price when there's a
    // deal, otherwise the sale price itself. The store re-derives the sale price
    // from `discountPercent`, so the two stay in sync.
    const sale = Number(values.salePrice.trim());
    const listPrice = values.originalPrice.trim()
      ? Number(values.originalPrice.trim())
      : sale;

    // Multipart rather than JSON: the endpoint takes image files, and multer only
    // parses a multipart body.
    const payload = new FormData();
    payload.append("name", values.name.trim());
    payload.append("category", values.category.trim());
    payload.append("price", String(listPrice));
    payload.append("discountPercent", String(discountPercent));
    payload.append("stock", values.stock.trim());
    payload.append("description", values.description.trim());
    // Handpicked flag for the homepage. The controller coerces "true"/"false".
    payload.append("featured", values.featured ? "true" : "false");
    // Optional; only sent when set so the controller stores null otherwise.
    if (values.sku.trim()) payload.append("sku", values.sku.trim());
    if (values.badge) payload.append("badge", values.badge);
    // Files under the "images" field (multer's .array name); first is the cover.
    images.forEach((img) => payload.append("images", img.file));

    setSaving(true);
    setFormError("");

    const result = await onCreate(payload);

    // The parent closes this modal on success, so only a failure lands back
    // here — leaving `saving` alone avoids a state update after unmount.
    if (!result?.success) {
      setFormError(result?.error || "Could not add the product.");
      setSaving(false);
    }
  };

  const describedBy = (key) => (errors[key] ? `product-${key}-error` : undefined);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-product-title"
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
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white">
              <Package size={18} />
            </span>
            <div>
              <h3
                id="add-product-title"
                className="text-[15px] font-semibold text-admin-fg"
              >
                Add new product
              </h3>
              <p className="mt-0.5 text-[11px] text-admin-fg-muted">
                Saved to the catalog and shown in the store right away.
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
          {/* Images first — the cover sets the tone for the listing. */}
          <Field label="Product images" htmlFor="product-image">
            <ImageGalleryPicker
              images={images}
              disabled={saving}
              onPick={onPickFiles}
              onRemove={removeImage}
            />
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
              autoFocus
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
            {/* A fixed list, not free text, so the catalog can't drift into
                "Audio"/"audio"/"Headset" being separate filters. Mirrors the
                nav and home filter via the shared PRODUCT_CATEGORIES. */}
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

          {/* Pricing — original + sale price; the gap becomes the listing badge. */}
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

          {/* Stock + SKU */}
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

          {/* Badge — single-select merchandising label. */}
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
            <span className="text-admin-fg-dim">— shown in “Handpicked”.</span>
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
            className="flex items-center gap-1.5 rounded-lg bg-red-500 px-4 py-2 text-[11px] font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <Loader2 size={12} className="animate-spin" />}
            {saving ? "Publishing…" : "Publish product"}
          </button>
        </div>
      </form>
    </div>
  );
}
