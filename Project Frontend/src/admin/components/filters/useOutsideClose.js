import { useEffect } from "react";

// Close an open popover when the user clicks outside `ref` or presses Escape.
// Extracted from the inline pattern in admin/products/components/ProductsTable.jsx
// so every admin menu dismisses the same way. A no-op while `open` is false, so
// the listeners are only attached for the brief time a menu is showing.
export const useOutsideClose = (ref, open, onClose) => {
  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (!ref.current?.contains(e.target)) onClose();
    };
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, open, onClose]);
};
