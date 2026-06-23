import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, RefreshCw, CheckCircle, Info, X } from 'lucide-react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';

const ControlCenter = React.lazy(() => import('./views/ControlCenter'));
const PerformanceReports = React.lazy(() => import('./views/PerformanceReports'));
const AlertMonitoring = React.lazy(() => import('./views/AlertMonitoring'));
const BookingFlow = React.lazy(() => import('./views/BookingFlow'));
const InfrastructureMap = React.lazy(() => import('./views/InfrastructureMap'));
const Login = React.lazy(() => import('./views/Login'));
const LandingPage = React.lazy(() => import('./views/LandingPage'));
const ReportedViolations = React.lazy(() => import('./views/ReportedViolations'));

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

function ProtectedRoute({
  children,
  isLoggedIn,
  requiredRole,
  userRole,
}: {
  children: React.ReactElement;
  isLoggedIn: boolean;
  requiredRole?: 'operator' | 'citizen';
  userRole: 'operator' | 'citizen' | null;
}) {
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (requiredRole === 'operator' && userRole !== 'operator') return <Navigate to="/reporting" replace />;
  return children;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'operator' | 'citizen' | null>(null);
  const [customReportCount, setCustomReportCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [hotspots, setHotspots] = useState<HotspotSummary[]>([]);
  const [hotspotDetails, setHotspotDetails] = useState<Record<string, any>>({});
  const [activeHotspotId, setActiveHotspotId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchHotspots = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/hotspots');
      if (!response.ok) throw new Error('Failed to fetch hotspots data from server.');
      const data = await response.json();
      const mappedData = data.map((item: any) => ({
        ...item,
        priority_level: item.priority_level ? item.priority_level.toUpperCase() : 'MEDIUM',
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
    fetch('/api/hotspots/details')
      .then(r => r.json())
      .then(data => setHotspotDetails(data))
      .catch(err => console.error('Failed to fetch hotspot details', err));
  }, []);

  const handleLogin = (role: 'operator' | 'citizen') => {
    setIsLoggedIn(true);
    setUserRole(role);
    showToast(`Welcome back, ${role === 'operator' ? 'Traffic Officer' : 'Citizen Reporter'}!`, 'success');
    navigate(role === 'operator' ? '/dashboard' : '/reporting');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    showToast('Logged out successfully.', 'info');
    navigate('/');
  };

  const handleDeployUnit = () => {
    showToast('Patrol dispatch initialized. Enforcement vehicle is en-route.', 'success');
  };

  const handleReportViolationSubmit = () => {
    setCustomReportCount(prev => prev + 1);
    showToast('Incident report logged in. Operator console updated.', 'success');
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#051424] text-[#d4e4fa] gap-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <h3 className="font-bold tracking-wide">ParkSense Systems Initializing...</h3>
      </div>
    );
  }

  const pathname = location.pathname;
  const isPublicRoute = pathname === '/' || pathname === '/login';

  if (error && !isPublicRoute) {
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
  const operatorPages = ['/dashboard', '/map', '/alerts', '/analytics', '/reporting'];
  const showSidebar = operatorPages.includes(pathname) && isLoggedIn && userRole === 'operator';

  const toastOverlay = (
    <div className="fixed top-6 right-6 z-200 flex flex-col gap-3 w-80 pointer-events-none">
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

  const filteredHotspots = hotspots.filter(h =>
    h.cluster_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.police_station_jurisdiction.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.representative_junction.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pageFallback = (
    <div className="flex items-center justify-center h-screen bg-[#051424]">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent transition-all duration-300 flex flex-col">
      {toastOverlay}

      <React.Suspense fallback={pageFallback}>
      <Routes>
        {/* Login: fullscreen, no header/sidebar */}
        <Route
          path="/login"
          element={<Login onLogin={handleLogin} showToast={showToast} />}
        />

        {/* All other pages share Header + optional Sidebar layout */}
        <Route
          path="*"
          element={
            <>
              <Header
                isLoggedIn={isLoggedIn}
                userRole={userRole}
                onLogout={handleLogout}
                onSearch={setSearchQuery}
              />
              <div className="flex flex-row grow w-full pt-20">
                {showSidebar && (
                  <Sidebar
                    onDeployUnit={handleDeployUnit}
                    onLogout={handleLogout}
                  />
                )}
                <main className="grow w-full min-h-[calc(100vh-80px)] relative">
                  <Routes>
                    <Route path="/" element={<LandingPage isLoggedIn={isLoggedIn} userRole={userRole} hotspots={hotspots} />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute isLoggedIn={isLoggedIn} requiredRole="operator" userRole={userRole}>
                          <ControlCenter
                            hotspots={filteredHotspots}
                            activeHotspotId={activeHotspotId}
                            setActiveHotspotId={setActiveHotspotId}
                            hotspotDetails={hotspotDetails}
                            showToast={showToast}
                          />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/map"
                      element={
                        <ProtectedRoute isLoggedIn={isLoggedIn} requiredRole="operator" userRole={userRole}>
                          <InfrastructureMap
                            hotspots={filteredHotspots}
                          />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/alerts"
                      element={
                        <ProtectedRoute isLoggedIn={isLoggedIn} requiredRole="operator" userRole={userRole}>
                          <AlertMonitoring customReportCount={customReportCount} showToast={showToast} />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/analytics"
                      element={
                        <ProtectedRoute isLoggedIn={isLoggedIn} requiredRole="operator" userRole={userRole}>
                          <PerformanceReports hotspots={filteredHotspots} />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/reporting"
                      element={
                        <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole}>
                          {userRole === 'operator' ? (
                            <ReportedViolations customReportCount={customReportCount} showToast={showToast} />
                          ) : (
                            <BookingFlow onReportSubmit={handleReportViolationSubmit} showToast={showToast} />
                          )}
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </>
          }
        />
      </Routes>
      </React.Suspense>
    </div>
  );
}

export default App;
