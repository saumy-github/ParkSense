import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Shield, BarChart2, MapPin, AlertTriangle, Home } from 'lucide-react';

interface HeaderProps {
  onSearch?: (term: string) => void;
  isLoggedIn: boolean;
  userRole: 'operator' | 'citizen' | null;
  onLogout: () => void;
}

export default function Header({ onSearch, isLoggedIn, userRole, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = location.pathname;

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    onLogout();
    setMobileMenuOpen(false);
  };

  const isOperator = isLoggedIn && userRole === 'operator';

  return (
    <header className="fixed top-0 z-50 w-full border-b border-outline-variant bg-surface/80 backdrop-blur-md transition-all duration-300">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto h-20">

        {/* Logo */}
        <div className="flex items-center gap-6 shrink-0">
          <button
            onClick={() => navigate(isLoggedIn ? (userRole === 'operator' ? '/dashboard' : '/reporting') : '/')}
            className="font-bold text-lg md:text-xl text-primary tracking-tight hover:text-secondary transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary text-2xl">traffic</span>
            <span>ASTraM ParkInsight</span>
          </button>

          {isOperator && (pathname === '/dashboard' || pathname === '/map') && (
            <div className="hidden md:flex items-center bg-surface-container-high/50 rounded-full px-4 py-1.5 border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary text-[20px] mr-2">search</span>
              <input
                onChange={(e) => onSearch?.(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-sm placeholder:text-on-surface-variant w-44 lg:w-60 text-on-surface"
                placeholder="Filter locations/hotspots..."
                type="text"
              />
            </div>
          )}
        </div>

        {/* Desktop Nav removed as items are in Sidebar */}


        {/* Right Side */}
        <div className="flex items-center gap-4">
          {isLoggedIn && (
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-on-surface capitalize">
                  {userRole === 'operator' ? 'Traffic Officer' : 'Citizen Reporter'}
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">
                  {userRole === 'operator' ? 'Badge #8841' : 'Verified ID'}
                </span>
              </div>
              <div
                className="w-10 h-10 rounded-full border border-primary/20 cursor-pointer flex items-center justify-center bg-primary-container text-primary font-bold text-sm shadow-sm"
                onClick={() => {
                  if (userRole === 'citizen') {
                    if (confirm('Log out of Citizen Console?')) handleLogoutClick();
                  } else {
                    handleNavClick('/dashboard');
                  }
                }}
                title={userRole === 'citizen' ? 'Click to Log Out' : 'Operator Console'}
              >
                {userRole === 'operator' ? 'OP' : 'CR'}
              </div>
            </div>
          )}

          {!isLoggedIn && pathname !== '/login' && (
            <div className="hidden lg:block">
              <button
                onClick={() => handleNavClick('/login')}
                className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-secondary transition-all active:scale-95 shadow-md shadow-primary/10 flex items-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                Portal Login
              </button>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute right-0 top-0 h-screen w-72 bg-white border-l border-outline-variant p-6 flex flex-col justify-between shadow-2xl animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-outline-variant/30">
                <span className="font-bold text-md text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">traffic</span>
                  ParkInsight Mobile
                </span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isLoggedIn && (
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></div>
                  <div>
                    <p className="text-xs font-bold text-on-surface capitalize">{userRole} Portal</p>
                    <p className="text-[9px] text-on-surface-variant font-mono">Active Session</p>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-2.5">
                {isOperator && [
                  { path: '/dashboard', label: 'Dashboard Console', Icon: Home },
                  { path: '/map', label: 'Live Map Canvas', Icon: MapPin },
                  { path: '/alerts', label: 'Active Alerts Queue', Icon: AlertTriangle },
                  { path: '/analytics', label: 'Congestion Analytics', Icon: BarChart2 },
                ].map(({ path, label, Icon }) => (
                  <button
                    key={path}
                    onClick={() => handleNavClick(path)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold text-xs uppercase tracking-wider transition-colors ${
                      pathname === path ? 'bg-primary-container text-primary' : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}

                {isLoggedIn && (
                  <button
                    onClick={() => handleNavClick('/reporting')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold text-xs uppercase tracking-wider transition-colors ${
                      pathname === '/reporting' ? 'bg-primary-container text-primary' : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Report a Violation
                  </button>
                )}
              </nav>
            </div>

            <div className="border-t border-outline-variant/30 pt-4">
              {isLoggedIn ? (
                <button
                  onClick={handleLogoutClick}
                  className="w-full py-3 bg-error-container text-error border border-error/25 hover:bg-error-container/85 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out from Portal
                </button>
              ) : (
                <button
                  onClick={() => handleNavClick('/login')}
                  className="w-full py-3 bg-primary text-on-primary hover:bg-secondary rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  Log In to Console
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
