import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle, Info, X } from 'lucide-react';

// Import layout components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Import views
import ControlCenter from './views/ControlCenter';
import PerformanceReports from './views/PerformanceReports';
import AlertMonitoring from './views/AlertMonitoring';
import BookingFlow from './views/BookingFlow';
import InfrastructureMap from './views/InfrastructureMap';
import Login from './views/Login';
import LandingPage from './views/LandingPage';

interface HotspotSummary {
  cluster_id: number;
  cluster_name: string;
  center_latitude: number;
  center_longitude: number;
  representative_junction: string;
  police_station_jurisdiction: string;
  congestion_impact_score: number;
  total_incident_count: number;
  primary_peak_time_string: string;
  priority_level: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

function App() {
  const [activePage, setActivePage] = useState<string>('home');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'operator' | 'citizen' | null>(null);
  const [customReportCount, setCustomReportCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    // Prevent lint issue TS6133
    return '';
  });
  
  const [hotspots, setHotspots] = useState<HotspotSummary[]>([]);
  const [activeHotspotId, setActiveHotspotId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Toast notifications state
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch hotspots data from backend
  const fetchHotspots = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/hotspots');
      if (!response.ok) {
        throw new Error('Failed to fetch hotspots data from server.');
      }
      const data = await response.json();
      
      const mappedData = data.map((item: any) => ({
        ...item,
        priority_level: item.priority_level ? item.priority_level.toUpperCase() : 'MEDIUM'
      }));

      setHotspots(mappedData);
      
      if (mappedData.length > 0 && !activeHotspotId) {
        setActiveHotspotId(mappedData[0].cluster_id);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotspots();
  }, []);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash;
      const hash = rawHash.replace('#/', '').replace('#', '');
      
      // Public pages accessible without login
      const publicPages = ['home', 'login', ''];
      // Protected operator-only pages
      const operatorPages = ['dashboard', 'map', 'alerts', 'analytics'];
      const allValidPages = ['home', 'login', 'dashboard', 'map', 'alerts', 'reporting', 'analytics'];

      // Empty hash or root → show landing page for guests, dashboard for operators
      if (!hash || hash === '/') {
        if (isLoggedIn) {
          window.location.hash = userRole === 'operator' ? '#/dashboard' : '#/reporting';
        } else {
          setActivePage('home');
        }
        return;
      }

      // Security: protect operator-only pages
      if (!isLoggedIn) {
        if (operatorPages.includes(hash) || hash === 'reporting') {
          // Only operator/console pages need auth — redirect to login
          window.location.hash = '#/login';
          showToast('Please log in to access this page.', 'warning');
        } else if (publicPages.includes(hash)) {
          setActivePage(hash);
        } else {
          setActivePage('home');
        }
      } else {
        // Logged in: citizens can only access reporting
        if (userRole === 'citizen' && operatorPages.includes(hash)) {
          window.location.hash = '#/reporting';
          showToast('Unauthorized access. Redirected to Citizen Console.', 'warning');
        } else if (allValidPages.includes(hash)) {
          setActivePage(hash);
        } else {
          window.location.hash = userRole === 'operator' ? '#/dashboard' : '#/reporting';
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // run on load

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isLoggedIn, userRole]);

  const handleLogin = (role: 'operator' | 'citizen') => {
    const targetPage = role === 'operator' ? 'dashboard' : 'reporting';
    setIsLoggedIn(true);
    setUserRole(role);
    setActivePage(targetPage); // Set directly — don't rely on hash listener (state is async)
    showToast(`Welcome back, ${role === 'operator' ? 'Traffic Officer' : 'Citizen Reporter'}!`, 'success');
    window.location.hash = `#/${targetPage}`;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setActivePage('home'); // Set directly
    showToast('Logged out successfully.', 'info');
    window.location.hash = '#/';
  };

  // Deploy Unit simulation
  const handleDeployUnit = () => {
    showToast('Patrol dispatch initialized. Enforcement vehicle is en-route.', 'success');
  };

  const handleReportViolationSubmit = () => {
    setCustomReportCount(prev => prev + 1);
    showToast('Incident report logged in. Operator console updated.', 'success');
  };

  // Render active view
  const renderView = () => {
    switch (activePage) {
      case 'home':
        return <LandingPage setActivePage={(page) => { window.location.hash = `#/${page}`; }} isLoggedIn={isLoggedIn} userRole={userRole} />;
      case 'login':
        return <Login onLogin={handleLogin} setActivePage={(page) => { window.location.hash = `#/${page}`; }} showToast={showToast} />;
      case 'reporting':
        return <BookingFlow onReportSubmit={handleReportViolationSubmit} showToast={showToast} />;
      
      // Protected Operator views
      case 'dashboard': {
        const filteredHotspots = hotspots.filter(h => 
          h.cluster_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.police_station_jurisdiction.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.representative_junction.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return (
          <ControlCenter 
            hotspots={filteredHotspots}
            activeHotspotId={activeHotspotId}
            setActiveHotspotId={setActiveHotspotId}
            customReportCount={customReportCount}
            showToast={showToast}
          />
        );
      }
      case 'map': {
        const filteredHotspotsMap = hotspots.filter(h => 
          h.cluster_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.police_station_jurisdiction.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.representative_junction.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return (
          <InfrastructureMap 
            hotspots={filteredHotspotsMap}
            activeHotspotId={activeHotspotId}
            setActiveHotspotId={setActiveHotspotId}
          />
        );
      }
      case 'alerts':
        return <AlertMonitoring customReportCount={customReportCount} showToast={showToast} />;
      case 'analytics':
        return <PerformanceReports />;
      default:
        return <LandingPage setActivePage={(page) => { window.location.hash = `#/${page}`; }} isLoggedIn={isLoggedIn} userRole={userRole} />;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#051424] text-[#d4e4fa] gap-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <h3 className="font-bold tracking-wide">ASTraM ParkInsight Systems Initializing...</h3>
      </div>
    );
  }

  // Render connection error screen
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#051424] text-[#d4e4fa] gap-6 p-6 text-center">
        <AlertTriangle size={48} className="text-error" />
        <h3 className="text-xl font-bold tracking-wide text-primary">Connection Failed</h3>
        <p className="max-w-md text-sm text-on-surface-variant">{error}</p>
        <button 
          onClick={fetchHotspots} 
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(0,240,255,0.3)] active:scale-95 transition-all"
        >
          <RefreshCw size={16} /> Re-try Connection
        </button>
      </div>
    );
  }

  const isOperatorPage = ['dashboard', 'map', 'alerts', 'analytics'].includes(activePage);
  const showSidebar = isOperatorPage && isLoggedIn && userRole === 'operator';

  // Toast overlay (shared across all pages)
  const toastOverlay = (
    <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 w-80 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        let icon = <Info className="text-primary w-5 h-5 shrink-0" />;
        let borderClass = 'border-primary/20';
        const bgClass = 'bg-[#0d2238]/95';

        if (isSuccess) {
          icon = <CheckCircle className="text-secondary w-5 h-5 shrink-0" />;
          borderClass = 'border-secondary/20';
        } else if (isError) {
          icon = <AlertTriangle className="text-error w-5 h-5 shrink-0" />;
          borderClass = 'border-error/20';
        } else if (isWarning) {
          icon = <AlertTriangle className="text-warning w-5 h-5 shrink-0" />;
          borderClass = 'border-warning/20';
        }

        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 p-4 rounded-xl border ${borderClass} ${bgClass} backdrop-blur-md shadow-2xl pointer-events-auto transition-all duration-300`}
          >
            {icon}
            <p className="text-xs font-semibold text-white flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-[#8eb0d4] hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );

  // Login page: fullscreen standalone — no Header, no sidebar, no pt-20
  if (activePage === 'login') {
    return (
      <>
        {toastOverlay}
        <Login
          onLogin={handleLogin}
          setActivePage={(page) => { window.location.hash = `#/${page}`; }}
          showToast={showToast}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-surface transition-all duration-300 flex flex-col">
      {toastOverlay}

      {/* Header on all non-login pages */}
      <Header
        activePage={activePage}
        setActivePage={(page) => { window.location.hash = `#/${page}`; }}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        onLogout={handleLogout}
        onSearch={setSearchQuery}
      />

      {/* Unified Flex Layout below fixed Header */}
      <div className="flex flex-row flex-grow w-full pt-20">
        {/* Render Sidebar only on Operator dashboard views */}
        {showSidebar && (
          <Sidebar
            activePage={activePage}
            setActivePage={(page) => { window.location.hash = `#/${page}`; }}
            onDeployUnit={handleDeployUnit}
            onLogout={handleLogout}
          />
        )}

        {/* Main page view canvas */}
        <main className="flex-grow w-full min-h-[calc(100vh-80px)] relative">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;

