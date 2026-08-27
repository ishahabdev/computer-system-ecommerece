import { useRef, useState } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";

import { PRESETS, DEFAULT_RANGE, labelOf } from "./dateRange";
import { useOutsideClose } from "./useOutsideClose";

const barBtn =
  "flex items-center gap-1.5 rounded-lg border border-admin-line-2 bg-admin-panel px-3 py-1.5 text-[12px] text-admin-fg-soft transition-colors hover:bg-admin-hover hover:text-admin-fg";

// Controlled date-range picker for the admin toolbars. `value` is a range object
// ({ preset } or { preset: "custom", from, to }) owned by the tab; `onChange`
// receives the next range. Presets apply immediately; "Custom" reveals two date
// inputs that apply together.
export default function DateRangeMenu({ value = DEFAULT_RANGE, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClose(ref, open, () => setOpen(false));

  const isCustom = value?.preset === "custom";
  const [from, setFrom] = useState(isCustom ? value.from ?? "" : "");
  const [to, setTo] = useState(isCustom ? value.to ?? "" : "");

  const choosePreset = (id) => {
    onChange?.({ preset: id });
    setOpen(false);
  };

  const applyCustom = () => {
    if (!from && !to) return;
    onChange?.({ preset: "custom", from, to });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={barBtn}
      >
        <Calendar size={13} strokeWidth={1.75} />
        {labelOf(value)}
        <ChevronDown size={13} strokeWidth={1.75} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-56 overflow-hidden rounded-lg border border-admin-line-2 bg-admin-panel-3 py-1 shadow-xl shadow-black/40">
          {PRESETS.map((preset) => {
            const active = value?.preset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => choosePreset(preset.id)}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[11px] transition-colors hover:bg-admin-active ${
                  active ? "text-admin-fg" : "text-admin-fg-soft hover:text-admin-fg"
                }`}
              >
                {preset.label}
                {active && <Check size={12} strokeWidth={2.5} className="text-emerald-400" />}
              </button>
            );
          })}

          <div className="my-1 border-t border-admin-line-2" />

          <div className="px-3 py-1.5">
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-admin-fg-muted">
              Custom range
            </p>
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center justify-between gap-2 text-[10px] text-admin-fg-muted">
                From
                <input
                  type="date"
                  value={from}
                  max={to || undefined}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-32 rounded-md border border-admin-line-2 bg-admin-panel-2 px-2 py-1 text-[11px] text-admin-fg outline-none focus:border-admin-line-strong"
                />
              </label>
              <label className="flex items-center justify-between gap-2 text-[10px] text-admin-fg-muted">
                To
                <input
                  type="date"
                  value={to}
                  min={from || undefined}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-32 rounded-md border border-admin-line-2 bg-admin-panel-2 px-2 py-1 text-[11px] text-admin-fg outline-none focus:border-admin-line-strong"
                />
              </label>
              <button
                type="button"
                onClick={applyCustom}
                disabled={!from && !to}
                className="mt-0.5 rounded-md border border-admin-line-strong bg-admin-invert px-2 py-1 text-[11px] font-medium text-admin-invert-fg transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
