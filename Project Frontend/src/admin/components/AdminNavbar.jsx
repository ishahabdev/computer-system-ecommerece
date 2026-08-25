import { useState } from "react";
import { Search, Bell, Sun, Moon } from "lucide-react";
import { useAdminTheme } from "../theme/AdminThemeContext";

export default function AdminNavbar() {
  const [search, setSearch] = useState("");
  const { isLight, toggleTheme } = useAdminTheme();

  return (
    <header className="flex h-16 items-center gap-4 border-b border-admin-line bg-admin-bg px-6">
      {/* left spacer keeps the search optically centered */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-admin-fg-dim"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full rounded-lg border border-admin-line bg-admin-panel py-2 pl-9 pr-3 text-[13px] text-admin-fg outline-none transition-colors placeholder:text-admin-fg-dim focus:border-admin-line-strong"
        />
      </div>

      {/* Right */}
      <div className="flex flex-1 items-center justify-end gap-2">
        {/* Light/dark toggle — shows the mode it will switch to */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
          title={isLight ? "Switch to dark mode" : "Switch to light mode"}
          className="rounded-lg border border-admin-line bg-admin-panel p-2 text-admin-fg-muted transition-colors hover:text-admin-fg"
        >
          {isLight ? (
            <Moon size={17} strokeWidth={1.75} />
          ) : (
            <Sun size={17} strokeWidth={1.75} />
          )}
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="rounded-lg border border-admin-line bg-admin-panel p-2 text-admin-fg-muted transition-colors hover:text-admin-fg"
        >
          <Bell size={17} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
