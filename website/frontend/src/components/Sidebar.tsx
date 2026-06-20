
interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onDeployUnit?: () => void;
}

export default function Sidebar({ activePage, setActivePage, onDeployUnit }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'map', label: 'Map View', icon: 'map' },
    { id: 'alerts', label: 'Alerts', icon: 'warning' },
    { id: 'reports', label: 'Reports', icon: 'assessment' },
    { id: 'booking', label: 'Booking', icon: 'confirmation_number' },
    { id: 'roadmap', label: 'Roadmap', icon: 'timeline' },
    { id: 'landing', label: 'Solutions', icon: 'rocket_launch' }
  ];

  return (
    <aside className="hidden lg:flex flex-col sticky top-20 h-[calc(100vh-80px)] w-64 py-6 border-r border-outline-variant bg-surface-container-lowest/50 backdrop-blur-xl shrink-0 z-40">
      <div className="px-6 py-4">
        {/* Status indicator */}
        <div className="flex items-center gap-3 mb-8 p-3 bg-surface-container-low/50 rounded-xl border border-outline-variant/30">
          <div className="w-2 h-2 rounded-full bg-primary status-glow animate-pulse"></div>
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">System Active</p>
            <p className="text-[10px] text-on-surface-variant font-mono">AI Engine v2.4</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span className="text-sm font-semibold">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto px-6 py-6 border-t border-outline-variant/20">
        <button 
          onClick={onDeployUnit}
          className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold mb-4 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-200 active:scale-98"
        >
          Deploy Unit
        </button>
        <div className="space-y-3">
          <button 
            onClick={() => setActivePage('landing')} 
            className="flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors text-xs font-semibold w-full text-left"
          >
            <span className="material-symbols-outlined text-[16px]">help</span>
            <span>Support</span>
          </button>
          <button 
            onClick={() => setActivePage('alerts')} 
            className="flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors text-xs font-semibold w-full text-left"
          >
            <span className="material-symbols-outlined text-[16px]">terminal</span>
            <span>Logs</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
