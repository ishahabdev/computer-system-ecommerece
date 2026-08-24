import { useNavigate, useLocation } from "react-router";
import {
  LayoutGrid,
  Package,
  ShoppingCart,
  Users,
  LineChart,
  Image,
  Megaphone,
  MessageSquare,
  Tag,
  Settings,
  LifeBuoy,
  Plus,
  Triangle,
  ChevronDown,
} from "lucide-react";

const mainLinks = [
  { name: "Overview", icon: LayoutGrid, path: "/admin/overview" },
  { name: "Products", icon: Package, path: "/admin/products" },
  { name: "Orders", icon: ShoppingCart, path: "/admin/orders" },
  { name: "Users", icon: Users, path: "/admin/users" },
  { name: "Analyze", icon: LineChart, path: "/admin/analyze" },
  { name: "Media", icon: Image, path: "/admin/media" },
  { name: "Campaigns", icon: Megaphone, path: "/admin/campaigns" },
];

const chartLinks = [
  { name: "Support", icon: MessageSquare, dot: true },
  { name: "Visual labels", icon: Tag },
];

const settingsLinks = [
  { name: "Settings", icon: Settings, path: "/admin/settings" },
  { name: "Support", icon: LifeBuoy, path: "/admin/support" },
];

// `icon` is read into a capitalized local so it can render as a component
// (`varsIgnorePattern` covers the const; a destructured arg would falsely lint).
function NavItem({ icon, label, active = false, dot = false, onClick }) {
  const Icon = icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors ${
        active
          ? "bg-white/[0.06] text-white"
          : "text-gray-400 hover:bg-white/[0.03] hover:text-white"
      }`}
    >
      <Icon size={16} strokeWidth={1.75} />
      <span>{label}</span>
      {dot && <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />}
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="mb-1 px-3 text-[10px] font-medium tracking-wider text-gray-600">
      {children}
    </p>
  );
}

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="flex w-56 flex-col border-r border-white/[0.06] bg-[#0a0a0b]">
      {/* Brand — h-16 + border-b aligns the divider with the top bar */}
      <div className="flex h-16 items-center gap-2 border-b border-white/[0.06] px-4">
        <Triangle size={17} className="fill-emerald-400 text-emerald-400" />
        <span className="text-[15px] font-semibold text-white">Nuxt Charts</span>
        <ChevronDown size={14} className="ml-auto text-gray-500" />
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col justify-between overflow-y-auto px-3 py-4">
        {/* Main nav */}
        <div>
          <p className="mb-2 px-2 text-[10px] font-medium tracking-wider text-gray-600">
            NUXTCHARTS.COM
          </p>

          <nav className="space-y-0.5">
            {mainLinks.map((link) => (
              <NavItem
                key={link.name}
                icon={link.icon}
                label={link.name}
                active={isActive(link.path)}
                onClick={() => navigate(link.path)}
              />
            ))}
          </nav>
        </div>

        {/* Bottom groups */}
        <div className="space-y-5 pt-6">
          <div>
            <SectionLabel>ALL CHARTS</SectionLabel>
            {chartLinks.map((link) => (
              <NavItem key={link.name} icon={link.icon} label={link.name} dot={link.dot} />
            ))}
          </div>

          <div>
            <SectionLabel>SETTINGS</SectionLabel>
            {settingsLinks.map((link) => (
              <NavItem
                key={link.name}
                icon={link.icon}
                label={link.name}
                onClick={() => link.path && navigate(link.path)}
              />
            ))}
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.1] py-2 text-[13px] text-white transition-colors hover:bg-white/[0.04]"
          >
            <Plus size={15} strokeWidth={2} />
            New dashboard
          </button>
        </div>
      </div>
    </aside>
  );
}
