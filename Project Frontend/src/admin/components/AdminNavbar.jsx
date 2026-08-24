import { useState } from "react";
import { Search, Bell } from "lucide-react";

export default function AdminNavbar() {
  const [search, setSearch] = useState("");

  return (
    <header className="flex h-16 items-center gap-4 border-b border-white/[0.06] bg-[#0a0a0b] px-6">
      {/* left spacer keeps the search optically centered */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full rounded-lg border border-white/[0.06] bg-[#141416] py-2 pl-9 pr-3 text-[13px] text-white outline-none transition-colors placeholder:text-gray-500 focus:border-white/[0.14]"
        />
      </div>

      {/* Right */}
      <div className="flex flex-1 justify-end">
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-lg border border-white/[0.06] bg-[#141416] p-2 text-gray-400 transition-colors hover:text-white"
        >
          <Bell size={17} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
