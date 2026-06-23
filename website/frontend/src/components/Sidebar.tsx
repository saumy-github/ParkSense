import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  onDeployUnit?: () => void;
  onLogout?: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Enforcement Panel", icon: "dashboard" },
    { path: "/map", label: "Live Map View", icon: "map" },
    { path: "/alerts", label: "Active Alerts", icon: "warning" },
    { path: "/analytics", label: "Traffic Analytics", icon: "bar_chart" },
    { path: "/reporting", label: "Reported Infractions", icon: "campaign" },
  ];

  return (
    <aside className="hidden lg:flex flex-col sticky top-20 h-[calc(100vh-80px)] w-64 py-6 border-r border-outline-variant bg-[#051424] text-[#d4e4fa] shrink-0 z-40">
      <div className="px-6 py-4 grow overflow-y-auto hide-scrollbar">
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary text-on-primary shadow-md shadow-primary/10"
                    : "text-[#8eb0d4] hover:bg-[#0d2238] hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto px-6 py-6 border-t border-outline-variant/20 space-y-3 shrink-0">
        <button
          onClick={onLogout}
          className="w-full py-3 bg-error-container/30 text-error border border-error/25 hover:bg-error-container/60 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
