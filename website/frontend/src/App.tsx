import { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  Activity, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  RefreshCw,
  Info
} from 'lucide-react';

interface HotspotSummary {
  cluster_id: number;
  cluster_name: string;
  center_latitude: number;
  center_longitude: number;
  representative_junction: string;
  police_station_jurisdiction: string;
  congestion_impact_score: number;
  total_incident_count: number;
  primary_peak_minute_of_day: number;
  primary_peak_time_string: string;
  priority_level: string;
}

interface Incident {
  id: string;
  timestamp: string;
  vehicle_type: string;
  violation: string;
  status: string;
  severity: string;
}

interface HotspotDetails {
  cluster_id: number;
  cluster_name: string;
  congestion_impact_score: number;
  total_incident_count: number;
  representative_junction: string;
  police_station_jurisdiction: string;
  average_delay_minutes: number;
  average_speed_reduction_pct: number;
  primary_violation_type: string;
  violation_distribution: Record<string, number>;
  hourly_congestion: number[];
  recent_incidents: Incident[];
  recommended_actions: string[];
}

function App() {
  const [hotspots, setHotspots] = useState<HotspotSummary[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'incidents' | 'actions'>('summary');

  const mapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  // Access Leaflet from window global loaded via CDN
  const L = (window as any).L;

  // Fetch all hotspots summary on load
  const fetchHotspots = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/hotspots');
      if (!response.ok) {
        throw new Error('Failed to fetch hotspots data from server.');
      }
      const data = await response.json();
      setHotspots(data);
      if (data.length > 0 && !selectedHotspot) {
        // Load the first hotspot details by default
        fetchHotspotDetails(data[0].cluster_id);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch individual hotspot details
  const fetchHotspotDetails = async (id: number) => {
    try {
      const response = await fetch(`/api/hotspots/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch details for selected hotspot.');
      }
      const data = await response.json();
      setSelectedHotspot(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHotspots();
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!loading && hotspots.length > 0 && !mapRef.current && L) {
      // Create Map centered around Bengaluru center
      const map = L.map('map', {
        zoomControl: false
      }).setView([12.9716, 77.5946], 12);

      // Add a modern dark theme CartoDB layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Put zoom control in bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    }

    // Cleanup map on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [loading, hotspots, L]);

  // Update map markers when hotspots load
  useEffect(() => {
    if (mapRef.current && markersGroupRef.current && hotspots.length > 0 && L) {
      markersGroupRef.current.clearLayers();

      hotspots.forEach(spot => {
        const lat = spot.center_latitude;
        const lng = spot.center_longitude;

        if (lat && lng) {
          let markerColor = '#10B981'; // Green for MEDIUM
          if (spot.priority_level === 'CRITICAL') {
            markerColor = '#EF4444'; // Red
          } else if (spot.priority_level === 'HIGH') {
            markerColor = '#F59E0B'; // Orange
          }

          // Custom pulsing SVG HTML marker icon
          const customIcon = L.divIcon({
            className: 'custom-pulsing-marker-wrapper',
            html: `
              <div class="glowing-marker" style="color: ${markerColor}">
                <div class="marker-pin" style="background-color: ${markerColor}"></div>
                <div class="marker-pulse"></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const popupContent = `
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; line-height: 1.4; color: #F3F4F6;">
              <b style="font-family: 'Space Grotesk', sans-serif; font-size: 14px; display: block; margin-bottom: 4px; color: #FFF">${spot.cluster_name}</b>
              <div style="color: #9CA3AF; margin-bottom: 2px;">📍 Junction: ${spot.representative_junction}</div>
              <div style="color: #9CA3AF; margin-bottom: 6px;">👮 Police Jurisdiction: ${spot.police_station_jurisdiction}</div>
              <hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                <span style="font-weight: 700; color: ${markerColor}">${spot.priority_level} Priority</span>
                <span style="background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.12)">Impact: ${spot.congestion_impact_score}</span>
              </div>
            </div>
          `;

          const marker = L.marker([lat, lng], { icon: customIcon })
            .addTo(markersGroupRef.current)
            .bindPopup(popupContent);

          marker.on('click', () => {
            fetchHotspotDetails(spot.cluster_id);
            focusOnMapCoordinates(lat, lng);
          });
        }
      });

      // Fit map bounds to encompass all markers nicely
      try {
        const bounds = hotspots.map(s => [s.center_latitude, s.center_longitude]);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      } catch (e) {
        console.error('Error fitting bounds:', e);
      }
    }
  }, [hotspots, L]);

  // Pan and Zoom map to selected hotspot
  const focusOnMapCoordinates = (lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 15, {
        animate: true,
        duration: 1.0
      });
    }
  };

  const handleSelectHotspot = (spot: HotspotSummary) => {
    fetchHotspotDetails(spot.cluster_id);
    focusOnMapCoordinates(spot.center_latitude, spot.center_longitude);
    
    // Find the corresponding Leaflet marker and trigger popup
    if (markersGroupRef.current) {
      markersGroupRef.current.eachLayer((layer: any) => {
        if (typeof layer.getLatLng === 'function') {
          const latlng = layer.getLatLng();
          if (latlng.lat === spot.center_latitude && latlng.lng === spot.center_longitude) {
            layer.openPopup();
          }
        }
      });
    }
  };

  // Helper calculations for summary statistics
  const criticalSpots = hotspots.filter(s => s.priority_level === 'CRITICAL').length;
  const avgImpactScore = hotspots.length > 0 
    ? (hotspots.reduce((acc, s) => acc + s.congestion_impact_score, 0) / hotspots.length).toFixed(1)
    : '0.0';

  // Render index loading state
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <h3 className="heading-font">ASTraM Parking Intelligence Loading...</h3>
      </div>
    );
  }

  // Render error screen
  if (error) {
    return (
      <div className="error-screen">
        <AlertTriangle size={48} className="text-red-500" />
        <h3 className="heading-font">Connection Failed</h3>
        <p>{error}</p>
        <button onClick={fetchHotspots} className="glass" style={{ padding: '8px 16px', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} /> Re-try Connection
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* HEADER BAR */}
      <header className="header">
        <div className="header-logo">
          <ShieldAlert size={28} className="text-indigo-400" />
          <div>
            <h1>ASTraM Parking Control</h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Bengaluru Traffic Police AI Co-Pilot</p>
          </div>
          <span>Prototype</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
            Proxy Server Active
          </div>
          <button onClick={fetchHotspots} className="glass" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <RefreshCw size={14} /> Sync
          </button>
        </div>
      </header>

      {/* THREE COLUMN GRID */}
      <main className="main-content">
        
        {/* COLUMN 1: ANALYTICS & HOTSPOTS */}
        <section className="sidebar">
          {/* Quick Metrics */}
          <div className="glass stat-card" style={{ padding: '16px' }}>
            <h3 className="card-title"><TrendingUp size={18} /> Network Overview</h3>
            <div className="stat-grid">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="stat-label">Total Congested Hotspots</span>
                <span className="stat-value" style={{ margin: 0, fontSize: '1.4rem' }}>{hotspots.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="stat-label">Critical Enforcement Required</span>
                <span className="stat-value" style={{ margin: 0, fontSize: '1.4rem', color: 'var(--accent-critical)' }}>{criticalSpots}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="stat-label">Avg Congestion Impact</span>
                <span className="stat-value" style={{ margin: 0, fontSize: '1.4rem', color: 'var(--accent-indigo)' }}>{avgImpactScore}</span>
              </div>
            </div>
          </div>

          {/* Hotspots List */}
          <div className="glass" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <h3 className="card-title" style={{ marginBottom: '12px' }}><MapPin size={18} /> Hotspots List</h3>
            <div className="hotspot-list" style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
              {hotspots.map(spot => {
                const isActive = selectedHotspot && selectedHotspot.cluster_id === spot.cluster_id;
                let badgeClass = 'badge-medium';
                if (spot.priority_level === 'CRITICAL') badgeClass = 'badge-critical';
                else if (spot.priority_level === 'HIGH') badgeClass = 'badge-high';

                return (
                  <div 
                    key={spot.cluster_id} 
                    className={`glass hotspot-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectHotspot(spot)}
                  >
                    <div className="hotspot-item-header">
                      <span className="hotspot-name">{spot.cluster_name}</span>
                      <span className={`badge ${badgeClass}`}>{spot.priority_level}</span>
                    </div>
                    <div className="hotspot-item-meta">
                      <span>Incidents: {spot.total_incident_count}</span>
                      <div className="score-tag">
                        <Activity size={12} /> Impact: <b>{spot.congestion_impact_score}</b>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* COLUMN 2: BENGALURU MAP */}
        <section className="glass map-container">
          <div id="map"></div>
          {/* Legend */}
          <div className="glass" style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 1000, padding: '10px 14px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(11, 15, 25, 0.9)', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '2px', fontFamily: 'Space Grotesk' }}>PRIORITY LEVEL</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-critical)' }}></span> Critical (Impact &gt; 90)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-high)' }}></span> High Priority (Impact 60-90)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-medium)' }}></span> Medium (Impact &lt; 60)</div>
          </div>
        </section>

        {/* COLUMN 3: SELECTED HOTSPOT ANALYTICS */}
        <section className="glass sidebar" style={{ overflow: 'hidden' }}>
          {selectedHotspot ? (
            <div className="details-panel">
              {/* Header Info */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <h2 style={{ fontSize: '1.3rem', color: '#FFF' }}>{selectedHotspot.cluster_name}</h2>
                  <span className={`badge ${selectedHotspot.congestion_impact_score > 90 ? 'badge-critical' : 'badge-high'}`}>
                    {selectedHotspot.congestion_impact_score > 90 ? 'Critical' : 'High'}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} className="text-indigo-400" /> Junction: {selectedHotspot.representative_junction}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  👮 Station Jurisdiction: <b>{selectedHotspot.police_station_jurisdiction}</b>
                </p>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginTop: '4px' }}>
                <button 
                  onClick={() => setActiveTab('summary')}
                  className="heading-font"
                  style={{ 
                    flex: 1, 
                    padding: '8px 0', 
                    background: 'none', 
                    border: 'none', 
                    borderBottom: activeTab === 'summary' ? '2px solid var(--accent-indigo)' : 'none',
                    color: activeTab === 'summary' ? '#FFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Summary
                </button>
                <button 
                  onClick={() => setActiveTab('incidents')}
                  className="heading-font"
                  style={{ 
                    flex: 1, 
                    padding: '8px 0', 
                    background: 'none', 
                    border: 'none', 
                    borderBottom: activeTab === 'incidents' ? '2px solid var(--accent-indigo)' : 'none',
                    color: activeTab === 'incidents' ? '#FFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Live Logs
                </button>
                <button 
                  onClick={() => setActiveTab('actions')}
                  className="heading-font"
                  style={{ 
                    flex: 1, 
                    padding: '8px 0', 
                    background: 'none', 
                    border: 'none', 
                    borderBottom: activeTab === 'actions' ? '2px solid var(--accent-indigo)' : 'none',
                    color: activeTab === 'actions' ? '#FFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Action Plan
                </button>
              </div>

              {/* TAB CONTENT: SUMMARY */}
              {activeTab === 'summary' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
                  {/* Stats Row */}
                  <div className="grid-2col" style={{ margin: 0 }}>
                    <div className="detail-metric">
                      <div className="detail-metric-label">Impact Score</div>
                      <div className="detail-metric-value" style={{ color: selectedHotspot.congestion_impact_score > 90 ? 'var(--accent-critical)' : 'var(--accent-high)' }}>
                        {selectedHotspot.congestion_impact_score}
                      </div>
                    </div>
                    <div className="detail-metric">
                      <div className="detail-metric-label">Violation Count</div>
                      <div className="detail-metric-value" style={{ color: 'var(--accent-indigo)' }}>
                        {selectedHotspot.total_incident_count}
                      </div>
                    </div>
                    <div className="detail-metric">
                      <div className="detail-metric-label">Traffic Delay</div>
                      <div className="detail-metric-value">
                        {selectedHotspot.average_delay_minutes} min
                      </div>
                    </div>
                    <div className="detail-metric">
                      <div className="detail-metric-label">Speed Reduc.</div>
                      <div className="detail-metric-value">
                        {selectedHotspot.average_speed_reduction_pct}%
                      </div>
                    </div>
                  </div>

                  {/* Hourly Congestion Chart */}
                  <div>
                    <h4 style={{ fontSize: '0.8rem', color: '#FFF', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} className="text-indigo-400" /> Hourly Congestion Level (%)
                    </h4>
                    <div className="chart-container">
                      {selectedHotspot.hourly_congestion.map((val, idx) => {
                        const hourText = idx < 12 ? `${idx === 0 ? 12 : idx} AM` : `${idx === 12 ? 12 : idx - 12} PM`;
                        const isPeak = val > 80;
                        return (
                          <div 
                            key={idx} 
                            className={`chart-bar ${isPeak ? 'peak' : ''}`} 
                            style={{ height: `${val}%` }}
                          >
                            <span className="chart-bar-tooltip">
                              {hourText}: {val}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="chart-axis-labels">
                      <span>12 AM</span>
                      <span>6 AM</span>
                      <span>12 PM</span>
                      <span>6 PM</span>
                      <span>11 PM</span>
                    </div>
                  </div>

                  {/* Violation Types Breakdown */}
                  <div>
                    <h4 style={{ fontSize: '0.8rem', color: '#FFF', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={14} className="text-indigo-400" /> Violation Types
                    </h4>
                    {Object.entries(selectedHotspot.violation_distribution).map(([type, percentage], index) => {
                      let color = 'var(--accent-indigo)';
                      if (index === 0) color = 'var(--accent-critical)';
                      else if (index === 1) color = 'var(--accent-high)';
                      
                      return (
                        <div key={type} className="breakdown-row">
                          <div className="breakdown-info">
                            <span>{type}</span>
                            <span>{percentage}%</span>
                          </div>
                          <div className="progress-bg">
                            <div className="progress-fg" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: INCIDENTS LOG */}
              {activeTab === 'incidents' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.8rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={14} className="text-indigo-400" /> Recent Violation Log
                    </h4>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-critical)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                      Live Feed
                    </span>
                  </div>
                  <div className="incidents-container" style={{ flex: 1, maxHeight: 'none' }}>
                    {selectedHotspot.recent_incidents.map((incident) => {
                      let statusClass = 'status-warning';
                      if (incident.status === 'Towed') statusClass = 'status-danger';
                      else if (incident.status === 'Ticket Issued') statusClass = 'status-warning';
                      else if (incident.status === 'Warning Issued') statusClass = 'status-success';

                      return (
                        <div key={incident.id} className="incident-row">
                          <div className="incident-details">
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span className="incident-id">{incident.id}</span>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{incident.timestamp}</span>
                            </div>
                            <span className="incident-desc">{incident.vehicle_type}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-high)', marginTop: '2px' }}>{incident.violation}</span>
                          </div>
                          <span className={`incident-status ${statusClass}`}>{incident.status}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: POLICE ACTION PLAN */}
              {activeTab === 'actions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
                  <h4 style={{ fontSize: '0.8rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} className="text-indigo-400" /> Recommended Action Items
                  </h4>
                  <ul className="recommendations-list">
                    {selectedHotspot.recommended_actions.map((action, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--accent-indigo)', fontWeight: 'bold' }}>•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="glass" style={{ padding: '12px', marginTop: '10px', display: 'flex', gap: '8px', background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
                    <Info size={18} className="text-indigo-400" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Recommendations are dynamically generated using historical congestion indices overlayed with police violation ticketing reports.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="details-placeholder">
              <ShieldAlert size={48} />
              <p>Select a hotspot on the map or in the list to view telemetry and police recommendations.</p>
            </div>
          )}
        </section>
        
      </main>
    </div>
  );
}

export default App;
