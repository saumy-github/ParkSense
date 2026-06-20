interface HeaderProps {
  activePage: string;
  onSearch?: (term: string) => void;
  setActivePage: (page: string) => void;
  isLoggedIn: boolean;
  userRole: 'operator' | 'citizen' | null;
  onLogout: () => void;
}

export default function Header({ 
  activePage, 
  onSearch, 
  setActivePage, 
  isLoggedIn, 
  userRole, 
  onLogout 
}: HeaderProps) {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-outline-variant bg-surface/40 backdrop-blur-md">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto h-20">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActivePage('landing')} 
            className="font-bold text-xl text-primary tracking-tight hover:text-secondary transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-primary text-2xl">traffic</span>
            ASTraM ParkInsight
          </button>
          
          <div className="hidden md:flex items-center bg-surface-container-high/50 rounded-full px-4 py-1.5 border border-outline-variant/30">
            <span className="material-symbols-outlined text-primary text-[20px] mr-2">search</span>
            <input 
              onChange={(e) => onSearch?.(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm placeholder:text-on-surface-variant w-48 lg:w-64 text-on-surface" 
              placeholder="Search junctions/hotspots..." 
              type="text"
            />
          </div>
        </div>

        {/* Center Navigation Links */}
        <div className="hidden md:flex gap-6 items-center">
          <button 
            onClick={() => setActivePage('landing')}
            className={`text-sm font-semibold transition-colors duration-200 cursor-pointer ${
              activePage === 'landing' ? 'text-secondary border-b-2 border-secondary' : 'text-on-surface-variant hover:text-secondary'
            }`}
          >
            Solutions
          </button>
          
          {/* Only show/enable monitoring for Operators */}
          <button 
            onClick={() => {
              if (isLoggedIn && userRole === 'operator') {
                setActivePage('dashboard');
              } else {
                setActivePage('login');
              }
            }}
            className={`text-sm font-semibold transition-colors duration-200 cursor-pointer ${
              ['dashboard', 'map', 'alerts', 'reports'].includes(activePage) ? 'text-secondary border-b-2 border-secondary' : 'text-on-surface-variant hover:text-secondary'
            }`}
          >
            Monitoring Console
          </button>

          <button 
            onClick={() => setActivePage('booking')}
            className={`text-sm font-semibold transition-colors duration-200 cursor-pointer ${
              activePage === 'booking' ? 'text-secondary border-b-2 border-secondary' : 'text-on-surface-variant hover:text-secondary'
            }`}
          >
            Citizen Reporter
          </button>
          
          <button 
            onClick={() => setActivePage('roadmap')}
            className={`text-sm font-semibold transition-colors duration-200 cursor-pointer ${
              activePage === 'roadmap' ? 'text-secondary border-b-2 border-secondary' : 'text-on-surface-variant hover:text-secondary'
            }`}
          >
            Roadmap
          </button>
        </div>
        
        {/* Right side auth options */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-on-surface capitalize">
                  {userRole === 'operator' ? 'Officer Portal' : 'Citizen Reporter'}
                </span>
                <button 
                  onClick={onLogout}
                  className="text-[10px] text-error hover:underline text-left"
                >
                  Log Out
                </button>
              </div>
              
              <div 
                className="w-10 h-10 rounded-full border border-primary/20 overflow-hidden cursor-pointer flex items-center justify-center bg-primary-container text-primary font-bold text-sm"
                onClick={() => {
                  if (userRole === 'operator') {
                    setActivePage('dashboard');
                  } else {
                    setActivePage('booking');
                  }
                }}
              >
                {userRole === 'operator' ? 'OP' : 'CR'}
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setActivePage('login')}
              className="bg-primary text-on-primary px-4 py-2 rounded-xl font-bold text-xs hover:bg-secondary transition-all active:scale-95 shadow-md shadow-primary/10 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">login</span>
              Portal Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
