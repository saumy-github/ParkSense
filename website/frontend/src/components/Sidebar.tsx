interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onDeployUnit?: () => void;
  onLogout?: () => void;
}

export default function Sidebar({ activePage, setActivePage, onDeployUnit, onLogout }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Enforcement Panel', icon: 'dashboard' },
    { id: 'map', label: 'Live Map View', icon: 'map' },
    { id: 'alerts', label: 'Active Alerts', icon: 'warning' },
    { id: 'analytics', label: 'Traffic Analytics', icon: 'bar_chart' },
    { id: 'reporting', label: 'Report Infraction', icon: 'campaign' }
  ];

  return (
    <aside className="hidden lg:flex flex-col sticky top-20 h-[calc(100vh-80px)] w-64 py-6 border-r border-outline-variant bg-[#051424] text-[#d4e4fa] shrink-0 z-40">
      <div className="px-6 py-4 flex-grow overflow-y-auto hide-scrollbar">
        {/* Status indicator */}
        <div className="flex items-center gap-3 mb-8 p-3 bg-[#0d2238]/60 rounded-xl border border-outline-variant/35">
          <div className="w-2.5 h-2.5 rounded-full bg-primary status-glow animate-pulse"></div>
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">System Live</p>
            <p className="text-[9px] text-[#8eb0d4] font-mono">Enforcement console</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = activePage === item.id || (item.id === 'reporting' && activePage === 'booking');
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id === 'reporting' ? 'reporting' : item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-md shadow-primary/10'
                    : 'text-[#8eb0d4] hover:bg-[#0d2238] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Dispatch & Logout panel at bottom */}
      <div className="mt-auto px-6 py-6 border-t border-outline-variant/20 space-y-3 shrink-0">
        <button 
          onClick={onDeployUnit}
          className="w-full py-3 bg-primary hover:bg-secondary text-on-primary rounded-xl font-bold hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-200 active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-[16px]">send</span>
          Deploy Patrol Unit
        </button>
        
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
