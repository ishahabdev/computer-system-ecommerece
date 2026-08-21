// Shared class tokens for the customer dashboard.
//
// The dashboard page is white, so cards can no longer rely on a tinted page
// behind them: they separate with a hairline border plus a faint lift instead.
// The old page tint (#F7F7F5) is now the SURFACE token — used for recessed areas
// such as inputs, table panels and empty states, one layer *below* the cards.
export const CARD = "bg-white border border-[#E5E5E0] rounded-xl shadow-sm";
export const SURFACE = "bg-[#F7F7F5]";
export const HAIRLINE = "border-[#E5E5E0]";

export const TAB_TITLE = "text-2xl font-bold text-[#22262A]";
export const TAB_SUBTITLE = "text-sm text-gray-500 mt-1";

export const FIELD_LABEL = "block text-sm font-medium text-gray-700 mb-2";
export const FIELD_INPUT =
  "w-full bg-[#F7F7F5] border border-[#E5E5E0] text-sm text-gray-700 placeholder-gray-400 px-4 py-3 rounded-lg outline-none transition focus:bg-white focus:border-[#2196F3] focus:ring-2 focus:ring-[#2196F3]/30";

export const BUTTON_PRIMARY =
  "inline-flex items-center justify-center gap-2 bg-[#2196F3] hover:bg-[#1a7fd1] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors";
export const BUTTON_SECONDARY =
  "inline-flex items-center justify-center gap-2 bg-white border border-[#E5E5E0] hover:bg-[#F7F7F5] text-[#22262A] text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors";
export const LINK_ACTION = "text-sm font-medium text-[#2196F3] hover:underline transition-colors";
