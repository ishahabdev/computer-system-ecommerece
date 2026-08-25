import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Package, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Validation — mirrors the server                                     */
/* ------------------------------------------------------------------ */

// Kept in step with the rules in productController.js. Catching a bad value here
// saves a round trip, and stops multer writing the image to disk only for the
// controller to reject the submission and unlink it again.
const validate = ({ name, category, price, stock }) => {
  const errors = {};

  if (!name.trim()) errors.name = "Name is required";
  if (!category.trim()) errors.category = "Category is required";

  // Number("") and Number(" ") are both 0, so blank has to be rejected before
  // parsing — otherwise an omitted price would silently pass as free.
  const priceValue = Number(price);
  if (!price.trim() || !Number.isFinite(priceValue) || priceValue < 0) {
    errors.price = "Enter a price of 0 or more";
  }

  const stockValue = Number(stock);
  if (!stock.trim() || !Number.isInteger(stockValue) || stockValue < 0) {
    errors.stock = "Enter a whole number of 0 or more";
  }

  return errors;
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
/* Image picker                                                        */
/* ------------------------------------------------------------------ */

function ImagePicker({ file, preview, disabled, onPick, onClear }) {
  const inputRef = useRef(null);

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-admin-line-2 bg-admin-panel-2">
        {preview ? (
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <Package size={16} className="text-admin-fg-faint" aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <input
          ref={inputRef}
          id="product-image"
          type="file"
          accept="image/*"
          disabled={disabled}
          onChange={onPick}
          className="hidden"
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-admin-line-2 px-2.5 py-1.5 text-[11px] text-admin-fg-soft transition-colors hover:bg-admin-active disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImagePlus size={12} />
            {file ? "Change image" : "Choose image"}
          </button>

          {file && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                // Clearing the input's value matters: without it, re-picking the
                // same file fires no change event and the preview never returns.
                if (inputRef.current) inputRef.current.value = "";
                onClear();
              }}
              className="text-[10px] text-admin-fg-dim transition-colors hover:text-admin-fg-soft"
            >
              Remove
            </button>
          )}
        </div>

        <p className="mt-1 truncate text-[10px] text-admin-fg-dim">
          {file ? file.name : "PNG, JPEG, WebP, GIF or AVIF · up to 5MB"}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

const EMPTY_FORM = {
  name: "",
  category: "",
  price: "",
  stock: "",
  description: "",
  imageUrl: "",
};

export default function AddProductModal({ onClose, onCreate, categories = [] }) {
  const [values, setValues] = useState(EMPTY_FORM);
  // File and its preview URL are kept together so they can never disagree.
  const [image, setImage] = useState({ file: null, previewUrl: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const { file } = image;

  // Mirrors image.previewUrl so the unmount cleanup below can reach the current
  // URL without re-running (and revoking a URL still in use) on every change.
  const previewUrlRef = useRef("");

  // Created here, in the handler where the file arrives, rather than in an
  // effect — and the URL being replaced is revoked, or each re-pick leaks a blob
  // for the lifetime of the page.
  const setImageFile = (picked) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = picked ? URL.createObjectURL(picked) : "";
    setImage({ file: picked, previewUrl: previewUrlRef.current });
  };

  // The modal unmounts on both cancel and success, so this is where a preview
  // that is still alive gets released.
  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
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
    const { value } = e.target;
    setValues((prev) => ({ ...prev, [key]: value }));
    setFormError("");
    // Drop the field's error as soon as it is edited; submit re-validates.
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const onPickFile = (e) => {
    const picked = e.target.files?.[0] ?? null;
    setFormError("");

    if (!picked) {
      setImageFile(null);
      return;
    }

    const reject = (message) => {
      setFormError(message);
      e.target.value = "";
      setImageFile(null);
    };

    if (!ALLOWED_IMAGE_TYPES.includes(picked.type)) {
      reject("Choose a JPEG, PNG, WebP, GIF or AVIF image.");
      return;
    }
    if (picked.size > MAX_IMAGE_BYTES) {
      reject("Image must be 5MB or smaller.");
      return;
    }

    setImageFile(picked);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Multipart rather than JSON: the same endpoint takes the image file, and
    // multer only parses a multipart body.
    const payload = new FormData();
    payload.append("name", values.name.trim());
    payload.append("price", values.price.trim());
    payload.append("category", values.category.trim());
    payload.append("stock", values.stock.trim());
    payload.append("description", values.description.trim());

    // The controller prefers an uploaded file and only reads the image field as
    // a URL when none was sent, so exactly one of the two is ever attached.
    if (file) payload.append("image", file);
    else if (values.imageUrl.trim())
      payload.append("image", values.imageUrl.trim());

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
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-admin-line-2 bg-admin-panel-3 p-5 shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3
              id="add-product-title"
              className="text-[13px] font-semibold text-admin-fg"
            >
              Add product
            </h3>
            <p className="mt-0.5 text-[11px] text-admin-fg-muted">
              Saved to the catalog and shown in the store right away.
            </p>
          </div>

          <button
            type="button"
            onClick={requestClose}
            aria-label="Close"
            className="rounded-md p-1 text-admin-fg-dim transition-colors hover:bg-admin-active hover:text-admin-fg"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-3">
          <Field
            label="Name"
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
              placeholder="Wireless Headphones"
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
            hint="Pick an existing category or type a new one."
          >
            <input
              id="product-category"
              type="text"
              list="product-category-options"
              value={values.category}
              onChange={setField("category")}
              disabled={saving}
              placeholder="Electronics"
              aria-invalid={Boolean(errors.category)}
              aria-describedby={describedBy("category")}
              className={inputClass}
            />
            {/* Existing categories as suggestions, so the catalog doesn't drift
                into "Audio" and "audio" being two separate filters. */}
            <datalist id="product-category-options">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Price"
              htmlFor="product-price"
              required
              error={errors.price}
            >
              <input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={values.price}
                onChange={setField("price")}
                disabled={saving}
                placeholder="399.00"
                aria-invalid={Boolean(errors.price)}
                aria-describedby={describedBy("price")}
                className={inputClass}
              />
            </Field>

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
          </div>

          <Field label="Description" htmlFor="product-description">
            <textarea
              id="product-description"
              rows={3}
              value={values.description}
              onChange={setField("description")}
              disabled={saving}
              placeholder="Optional — shown on the product page."
              className={`${inputClass} resize-none`}
            />
          </Field>

          <Field label="Image" htmlFor="product-image">
            <ImagePicker
              file={file}
              preview={image.previewUrl || values.imageUrl.trim()}
              disabled={saving}
              onPick={onPickFile}
              onClear={() => setImageFile(null)}
            />
          </Field>

          <Field
            label="Or image URL"
            htmlFor="product-image-url"
            hint={
              file
                ? "Ignored while a file is attached."
                : "Point at a remote image instead of uploading one."
            }
          >
            <input
              id="product-image-url"
              type="url"
              value={values.imageUrl}
              onChange={setField("imageUrl")}
              // The server ignores this when a file is present; disabling it
              // makes that precedence visible instead of silent.
              disabled={saving || Boolean(file)}
              placeholder="https://example.com/product.jpg"
              className={inputClass}
            />
          </Field>
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
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={requestClose}
            disabled={saving}
            className="rounded-lg border border-admin-line-2 px-3 py-1.5 text-[11px] text-admin-fg-soft transition-colors hover:bg-admin-active disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500/90 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <Loader2 size={12} className="animate-spin" />}
            {saving ? "Adding…" : "Add product"}
          </button>
        </div>
      </form>
    </div>
  );
}
