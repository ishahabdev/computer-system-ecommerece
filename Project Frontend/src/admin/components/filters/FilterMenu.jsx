import { useMemo, useRef, useState } from "react";
import { SlidersHorizontal, Check, X } from "lucide-react";

import { useOutsideClose } from "./useOutsideClose";

const barBtn =
  "flex items-center gap-1.5 rounded-lg border border-admin-line-2 bg-admin-panel px-3 py-1.5 text-[12px] text-admin-fg-soft transition-colors hover:bg-admin-hover hover:text-admin-fg";

// Controlled multi-group filter panel for the admin toolbars.
//   groups: [{ id, label, options: [{ value, label }] }]
//   value:  { [groupId]: string[] }  — selected values per group; a group absent
//           or empty imposes no constraint.
//   onChange(nextValue)
// The tab applies the matching (OR within a group, AND across groups); this
// component only edits the selection and shows how many filters are active.
export default function FilterMenu({ groups = [], value = {}, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClose(ref, open, () => setOpen(false));

  const activeCount = useMemo(
    () => Object.values(value).reduce((n, list) => n + (list?.length || 0), 0),
    [value],
  );

  const toggle = (groupId, optionValue) => {
    const current = value[groupId] ?? [];
    const next = current.includes(optionValue)
      ? current.filter((v) => v !== optionValue)
      : [...current, optionValue];
    const nextValue = { ...value, [groupId]: next };
    if (next.length === 0) delete nextValue[groupId];
    onChange?.(nextValue);
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
        <SlidersHorizontal size={13} strokeWidth={1.75} />
        Filter
        {activeCount > 0 && (
          <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-admin-invert px-1 text-[9px] font-semibold text-admin-invert-fg">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-56 rounded-lg border border-admin-line-2 bg-admin-panel-3 py-1 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between px-3 py-1.5">
            <p className="text-[11px] font-semibold text-admin-fg">Filters</p>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => onChange?.({})}
                className="flex items-center gap-1 text-[10px] text-admin-fg-muted transition-colors hover:text-admin-fg"
              >
                <X size={11} /> Clear
              </button>
            )}
          </div>

          {groups.length === 0 && (
            <p className="px-3 py-2 text-[11px] text-admin-fg-dim">No filters available.</p>
          )}

          {groups.map((group) => (
            <div key={group.id} className="border-t border-admin-line-2 px-3 py-2">
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-admin-fg-muted">
                {group.label}
              </p>
              <div className="flex flex-col gap-1.5">
                {group.options.map((option) => {
                  const checked = (value[group.id] ?? []).includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-2 text-[11px] text-admin-fg-soft transition-colors hover:text-admin-fg"
                    >
                      <span
                        className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                          checked ? "border-emerald-500 bg-emerald-500" : "border-admin-line-stronger"
                        }`}
                      >
                        {checked && <Check size={10} strokeWidth={3.5} className="text-[#0a0a0b]" />}
                      </span>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => toggle(group.id, option.value)}
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
