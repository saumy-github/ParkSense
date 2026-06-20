import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Import layout components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Import views
import ControlCenter from './views/ControlCenter';
import PerformanceReports from './views/PerformanceReports';
import AlertMonitoring from './views/AlertMonitoring';
import BookingFlow from './views/BookingFlow';
import InfrastructureMap from './views/InfrastructureMap';
import Roadmap from './views/Roadmap';
import LandingPage from './views/LandingPage';
import Login from './views/Login';

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

function App() {
  const [activePage, setActivePage] = useState<string>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'operator' | 'citizen' | null>(null);
  const [customReportCount, setCustomReportCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [hotspots, setHotspots] = useState<HotspotSummary[]>([]);
  const [activeHotspotId, setActiveHotspotId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleLogin = (role: 'operator' | 'citizen') => {
    setIsLoggedIn(true);
    setUserRole(role);
    if (role === 'operator') {
      setActivePage('dashboard');
    } else {
      setActivePage('booking');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setActivePage('landing');
  };

  // Deploy Unit simulation
  const handleDeployUnit = () => {
    alert('Patrol dispatch initiated. Sending active enforcement unit to Shivajinagar Junction.');
  };

  const handleReportViolationSubmit = () => {
    setCustomReportCount(prev => prev + 1);
  };

  // Render active view
  const renderView = () => {
    switch (activePage) {
      case 'landing':
        return <LandingPage setActivePage={setActivePage} isLoggedIn={isLoggedIn} userRole={userRole} />;
      case 'login':
        return <Login onLogin={handleLogin} setActivePage={setActivePage} />;
      case 'roadmap':
        return <Roadmap />;
      case 'booking':
        // booking page is repurposed to Citizen Reporting
        return <BookingFlow onReportSubmit={handleReportViolationSubmit} />;
      
      // Protected Operator views
      case 'dashboard':
        if (!isLoggedIn || userRole !== 'operator') {
          return <Login onLogin={handleLogin} setActivePage={setActivePage} />;
        }
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
          />
        );
      case 'map':
        if (!isLoggedIn || userRole !== 'operator') {
          return <Login onLogin={handleLogin} setActivePage={setActivePage} />;
        }
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
      case 'alerts':
        if (!isLoggedIn || userRole !== 'operator') {
          return <Login onLogin={handleLogin} setActivePage={setActivePage} />;
        }
        return <AlertMonitoring customReportCount={customReportCount} />;
      case 'reports':
        if (!isLoggedIn || userRole !== 'operator') {
          return <Login onLogin={handleLogin} setActivePage={setActivePage} />;
        }
        return <PerformanceReports />;
      default:
        return <LandingPage setActivePage={setActivePage} isLoggedIn={isLoggedIn} userRole={userRole} />;
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

  const isOperatorPage = ['dashboard', 'map', 'alerts', 'reports'].includes(activePage);
  const showSidebar = isOperatorPage && isLoggedIn && userRole === 'operator';

  return (
    <div className="min-h-screen bg-surface transition-all duration-300 flex flex-col">
      {/* Render Header on all pages */}
      <Header 
        activePage={activePage}
        setActivePage={setActivePage}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        onLogout={handleLogout}
        onSearch={(term) => setSearchQuery(term)}
      />

      {/* Unified Flex Layout below fixed Header */}
      <div className="flex flex-row flex-grow w-full pt-20">
        {/* Render Sidebar only on Operator dashboard views */}
        {showSidebar && (
          <Sidebar 
            activePage={activePage}
            setActivePage={setActivePage}
            onDeployUnit={handleDeployUnit}
          />
        )}

        {/* Main page view canvas */}
        <main className="flex-1 w-full min-h-[calc(100vh-80px)] relative">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
 
export default App;
