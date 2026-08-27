import { useEffect, useState } from "react";
import { Loader2, Package, Percent, Tag, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const money = (n) =>
  `$${(Number(n) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Round to cents so the previewed sale price never shows binary rounding noise.
const round2 = (n) => Math.round(n * 100) / 100;

// A whole 0–100 percentage; anything malformed or <= 0 means "not a deal".
const clampPercent = (value) => {
  const pct = Math.round(Number(value));
  if (!Number.isFinite(pct) || pct <= 0) return 0;
  return Math.min(pct, 100);
};

// Convert a stored date (ISO / UTC) into the value <input type="datetime-local">
// expects — local wall-clock "YYYY-MM-DDTHH:mm". Empty string when there's none.
const toDatetimeLocalValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const inputClass =
  "w-full rounded-lg border border-admin-line-2 bg-admin-panel-2 px-2.5 py-1.5 text-[11px] text-admin-fg outline-none transition-colors placeholder:text-admin-fg-dim focus:border-admin-line-strong disabled:cursor-not-allowed disabled:opacity-50";

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

// Lightweight discount editor reached from a product row's actions menu. The
// only field it writes is discountPercent; `price` stays the list price and the
// store derives the sale price from the percentage (same math previewed here).
export default function ManageDealModal({ product, onClose, onUpdate }) {
  // String state so the field can be emptied while typing without snapping to 0.
  const [percent, setPercent] = useState(String(product.discountPercent || 0));
  // Optional flash-sale end. Prefilled from the product; blank = open-ended.
  const [endsAt, setEndsAt] = useState(() =>
    toDatetimeLocalValue(product.saleEndsAt),
  );
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Closing mid-request would drop the modal while the PATCH is still in flight.
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

  const price = Number(product.price) || 0;
  const previewPct = clampPercent(percent);
  const hasDeal = previewPct > 0;
  const salePrice = hasDeal ? round2(price * (1 - previewPct / 100)) : price;
  const savings = round2(price - salePrice);

  const alreadyOnDeal = product.discountPercent > 0;

  // Shared submit path for both Save (typed value) and Remove (explicit 0), so the
  // saving/valid/error handling lives in one place. Validates like the server.
  const submit = async (rawValue, rawEndsAt) => {
    if (saving) return;

    const value = Number(rawValue);
    if (
      String(rawValue).trim() === "" ||
      !Number.isInteger(value) ||
      value < 0 ||
      value > 100
    ) {
      setFormError("Discount must be a whole number from 0 to 100.");
      return;
    }

    // The end date only applies to a live deal: removing the deal (value 0)
    // clears it, and a blank field means an open-ended deal (null).
    let saleEndsAt = null;
    const trimmedEnds = String(rawEndsAt ?? "").trim();
    if (value > 0 && trimmedEnds !== "") {
      const date = new Date(trimmedEnds);
      if (Number.isNaN(date.getTime())) {
        setFormError("Enter a valid sale end date, or leave it blank.");
        return;
      }
      saleEndsAt = date.toISOString();
    }

    setSaving(true);
    setFormError("");

    const result = await onUpdate(product.id, {
      discountPercent: value,
      saleEndsAt,
    });

    // The parent closes this modal and refetches on success, so only a failure
    // lands back here — leaving `saving` set avoids a state update after unmount.
    if (!result?.success) {
      setFormError(result?.error || "Could not update the deal.");
      setSaving(false);
    }
  };

  const onSave = (e) => {
    e.preventDefault();
    submit(percent.trim(), endsAt);
  };

  const onPercentChange = (e) => {
    setPercent(e.target.value);
    setFormError("");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-deal-title"
      onClick={requestClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSave}
        noValidate
        className="w-full max-w-md overflow-y-auto rounded-xl border border-admin-line-2 bg-admin-panel-3 p-5 shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3
              id="manage-deal-title"
              className="flex items-center gap-1.5 text-[13px] font-semibold text-admin-fg"
            >
              <Tag size={13} className="text-emerald-400" />
              Manage deal
            </h3>
            <p className="mt-0.5 text-[11px] text-admin-fg-muted">
              Set a discount to list this product in Deals.
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

        {/* Product identity */}
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-admin-line-2 bg-admin-panel-2 p-2.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-admin-line-2 bg-admin-panel-3">
            {product.image ? (
              <img
                src={product.image}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <Package size={16} className="text-admin-fg-faint" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium text-admin-fg">
              {product.name}
            </p>
            <p className="mt-0.5 text-[10px] text-admin-fg-dim">
              List price {money(price)}
            </p>
          </div>
        </div>

        {/* Discount input */}
        <label
          htmlFor="deal-percent"
          className="mb-1 block text-[11px] text-admin-fg-muted"
        >
          Discount %
        </label>
        <div className="relative">
          <input
            id="deal-percent"
            type="number"
            min="0"
            max="100"
            step="1"
            value={percent}
            onChange={onPercentChange}
            disabled={saving}
            autoFocus
            placeholder="0"
            className={`${inputClass} pr-8`}
          />
          <Percent
            size={12}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-fg-dim"
          />
        </div>
        <p className="mt-1 text-[10px] text-admin-fg-dim">
          0 removes it from Deals. Any value above 0 lists it there.
        </p>

        {/* Live price preview */}
        <div className="mt-3 rounded-lg border border-admin-line-2 bg-admin-panel-2 p-3">
          {hasDeal ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[15px] font-semibold text-emerald-400">
                    {money(salePrice)}
                  </span>
                  <span className="text-[11px] text-admin-fg-dim line-through">
                    {money(price)}
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] text-admin-fg-muted">
                  Customers save {money(savings)}
                </p>
              </div>
              <span className="inline-flex items-center rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-[11px] font-bold leading-none text-red-400">
                -{previewPct}%
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-admin-fg-muted">
              No discount — sells at the list price {money(price)} and stays out
              of Deals.
            </p>
          )}
        </div>

        {/* Optional flash-sale end date */}
        <label
          htmlFor="deal-ends-at"
          className="mb-1 mt-4 block text-[11px] text-admin-fg-muted"
        >
          Flash sale ends <span className="text-admin-fg-dim">(optional)</span>
        </label>
        <input
          id="deal-ends-at"
          type="datetime-local"
          value={endsAt}
          onChange={(e) => {
            setEndsAt(e.target.value);
            setFormError("");
          }}
          disabled={saving || !hasDeal}
          className={inputClass}
        />
        <p className="mt-1 text-[10px] text-admin-fg-dim">
          {hasDeal
            ? "Leave blank for an open-ended deal. After this time it drops off the homepage Flash Sale."
            : "Set a discount above to schedule a flash sale."}
        </p>

        {formError && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300"
          >
            {formError}
          </p>
        )}

        {/* Actions */}
        <div className="mt-5 flex items-center justify-between gap-2">
          {/* Only meaningful once a product is actually on deal. */}
          {alreadyOnDeal ? (
            <button
              type="button"
              onClick={() => submit(0)}
              disabled={saving}
              className="rounded-lg border border-red-500/30 px-3 py-1.5 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove from deals
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
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
              {saving ? "Saving…" : "Save deal"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
