import React, { useEffect, useState, Suspense } from 'react';
const MapComponent = React.lazy(() => import('../components/MapComponent'));

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

interface ControlCenterProps {
  hotspots: HotspotSummary[];
  activeHotspotId: number | null;
  setActiveHotspotId: (id: number | null) => void;
  customReportCount: number;
  showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface EventItem {
  id: string;
  type: 'double_parking' | 'sidewalk' | 'bus_lane';
  title: string;
  time: string;
  detail: string;
  meta: string;
  img: string;
  clusterId: number;
}

const EVENTS: EventItem[] = [
  {
    id: 'CIT-1025',
    type: 'double_parking',
    title: 'Citizen Double Parking',
    time: 'Just Now',
    detail: 'Mercedes (MH-14-DN-8982) • Parallel Block',
    meta: 'Prabhat Corner Deccan • EWR: 36%',
    img: '/infraction_6.png',
    clusterId: 6
  },
  {
    id: 'DET-1021',
    type: 'double_parking',
    title: 'Double Parking Detected',
    time: '15m ago',
    detail: 'BMW (KA-03-MM-1234) • Parallel Block',
    meta: 'Shivajinagar PS Junction • EWR: 36%',
    img: '/infraction_1.png',
    clusterId: 1
  },
  {
    id: 'DET-1019',
    type: 'bus_lane',
    title: 'Bus Lane Obstruction',
    time: '45m ago',
    detail: 'Tanker (KA-04-DE-4321) • BRTS corridor',
    meta: '80 Feet Ring Road • EWR: 45%',
    img: '/infraction_2.png',
    clusterId: 2
  },
  {
    id: 'DET-1015',
    type: 'double_parking',
    title: 'Double Parking Detected',
    time: '2h ago',
    detail: 'Hatchback (KA-01-AB-5678) • Blocking lane',
    meta: 'Commercial Street Entrance • EWR: 40%',
    img: '/infraction_3.png',
    clusterId: 3
  },
  {
    id: 'DET-1008',
    type: 'double_parking',
    title: 'No Parking Zone Block',
    time: '3h ago',
    detail: 'Trailer (KA-51-JK-7890) • Heavy Obstruction',
    meta: 'Modi Bridge Area • EWR: 55%',
    img: '/infraction_4.png',
    clusterId: 4
  },
  {
    id: 'DET-1002',
    type: 'bus_lane',
    title: 'Highway Shoulder Block',
    time: '4h ago',
    detail: 'Chemical Tanker (KA-02-XY-9876) • Shoulder Block',
    meta: 'NH-48 Highway Shoulder • EWR: 10%',
    img: '/infraction_5.jpg',
    clusterId: 5
  }
];

const CITIZEN_HOTSPOTS = [
  {
    cluster_id: 6,
    cluster_name: "Prabhat Corner - Deccan",
    center_latitude: 12.9716,
    center_longitude: 77.6412,
    representative_junction: "Golden Punjab Road Corner",
    police_station_jurisdiction: "Indiranagar PS",
    congestion_impact_score: 62.3,
    total_incident_count: 520,
    primary_peak_time_string: "12:00 PM",
    priority_level: "HIGH"
  }
];

export default function ControlCenter({ hotspots, activeHotspotId, setActiveHotspotId, customReportCount, showToast }: ControlCenterProps) {
  const [mapMode, setMapMode] = useState<'ai' | 'citizen'>('ai');

  useEffect(() => {
    // Set theme to dark for Operator Dashboard
    document.documentElement.classList.remove('light');
  }, []);

  // Assemble dynamic events based on citizen portal reporting
  const dynamicEvents = [...EVENTS];
  if (customReportCount > 0) {
    for (let i = 0; i < customReportCount; i++) {
      dynamicEvents.unshift({
        id: `CIT-00${i + 1}`,
        type: 'double_parking',
        title: 'Citizen Incident Logged',
        time: 'Just Now',
        detail: 'Obstruction • OCR Pending Review',
        meta: 'Prabhat Corner Deccan • SPI: 62%',
        img: '/infraction_6.png',
        clusterId: 6
      });
    }
  }

  const activeEvents = dynamicEvents.filter(event => {
    const isAi = event.id.startsWith('DET-');
    return mapMode === 'ai' ? isAi : !isAi;
  });

  const handleEventClick = (clusterId: number, title: string) => {
    setActiveHotspotId(clusterId);
    showToast?.(`Focused live map on ${title}`, 'info');
  };

  return (
    <div className="mesh-gradient min-h-full bg-[#051424] text-[#d4e4fa] px-6 py-8 max-w-7xl mx-auto w-full transition-all duration-300">
      
      {/* Header Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Active Violations */}
        <div className="glass-panel rounded-2xl p-6 border border-outline-variant/30 bg-[#0d2238]/60 transition-all duration-300 hover:border-primary/40">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#8eb0d4] mb-2">Active Violations</p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-bold text-primary">{activeEvents.length}</h2>
            <span className="text-[#8eb0d4]/60 text-xs mb-1">Ongoing Hotspots</span>
          </div>
          <div className="w-full bg-[#051424] h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              style={{ width: `${Math.min(100, 40 + (activeEvents.length * 8))}%` }}
              className="bg-primary h-full shadow-[0_0_8px_#00f0ff] transition-all duration-500"
            ></div>
          </div>
        </div>

        {/* AI Detection Accuracy */}
        <div className="glass-panel rounded-2xl p-6 border border-outline-variant/30 bg-[#0d2238]/60 ai-pulse transition-all duration-300 hover:border-secondary/40">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#8eb0d4] mb-2">AI Detection Health</p>
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-bold text-secondary">98.4%</h2>
            <span className="material-symbols-outlined text-secondary text-[24px]">verified</span>
          </div>
          <div className="flex gap-1.5 mt-4">
            <div className="h-4 w-1 bg-secondary rounded-full opacity-20"></div>
            <div className="h-6 w-1 bg-secondary rounded-full opacity-40"></div>
            <div className="h-8 w-1 bg-secondary rounded-full opacity-60"></div>
            <div className="h-5 w-1 bg-secondary rounded-full opacity-80"></div>
            <div className="h-7 w-1 bg-secondary rounded-full"></div>
          </div>
        </div>

        {/* Peak Congestion Hour */}
        <div className="glass-panel rounded-2xl p-6 border border-outline-variant/30 bg-[#0d2238]/60 transition-all duration-300 hover:border-primary/40">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#8eb0d4] mb-2">Peak Congestion Hour</p>
          <h2 className="text-4xl font-bold text-on-surface">09:20 AM</h2>
          <p className="text-xs text-error mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span className="font-semibold">+64% Speed Reduction</span>
          </p>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map panel */}
        <div className="lg:col-span-8 glass-panel rounded-3xl overflow-hidden border border-outline-variant/30 bg-[#0d2238]/60 relative h-125 flex flex-col">
          <div className="p-4 bg-[#0d2238] border-b border-outline-variant/30 flex flex-wrap justify-between items-center gap-4 z-10">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-primary">Live Enforcement Heatmap</p>
                <p className="text-xs text-[#8eb0d4] mt-0.5">Bengaluru Active Traffic Nodes</p>
              </div>

              {/* Map Tabs */}
              <div className="flex bg-[#051424] rounded-lg p-0.5 border border-outline-variant/30">
                <button
                  onClick={() => {
                    setMapMode('ai');
                    setActiveHotspotId(null);
                  }}
                  className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    mapMode === 'ai' ? 'bg-primary text-on-primary' : 'text-[#8eb0d4] hover:text-white'
                  }`}
                >
                  AI Detected ({hotspots.length})
                </button>
                <button
                  onClick={() => {
                    setMapMode('citizen');
                    setActiveHotspotId(null);
                  }}
                  className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    mapMode === 'citizen' ? 'bg-primary text-on-primary' : 'text-[#8eb0d4] hover:text-white'
                  }`}
                >
                  Citizen Reported ({customReportCount > 0 ? 1 + customReportCount : 1})
                </button>
              </div>
            </div>
            {activeHotspotId && (
              <button 
                onClick={() => setActiveHotspotId(null)}
                className="text-xs text-secondary hover:underline"
              >
                Clear Selection
              </button>
            )}
          </div>
          <div className="grow">
            <Suspense fallback={<div className="w-full h-full bg-[#051424] flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>}>
              <MapComponent
                hotspots={mapMode === 'ai' ? hotspots : CITIZEN_HOTSPOTS}
                selectedId={activeHotspotId}
                onSelectHotspot={setActiveHotspotId}
              />
            </Suspense>
          </div>
        </div>

        {/* Live Feed panel */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 border border-outline-variant/30 bg-[#0d2238]/60 flex flex-col h-125">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-primary">Live Violation Feed</h3>
            <span className="material-symbols-outlined text-primary text-[18px] animate-pulse">sensors</span>
          </div>
          
          <div className="grow space-y-4 overflow-y-auto pr-1 hide-scrollbar">
            {activeEvents.map((event) => {
              const isSelected = activeHotspotId === event.clusterId;
              return (
                <div 
                  key={event.id}
                  onClick={() => handleEventClick(event.clusterId, event.title)}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex gap-4 cursor-pointer hover:bg-[#0d2238] ${
                    isSelected ? 'border-primary bg-[#0d2238]' : 'border-outline-variant/20 bg-[#0d2238]/30'
                  }`}
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-outline-variant/40">
                    <img 
                      alt={event.title} 
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" 
                      src={event.img}
                    />
                  </div>
                  <div className="grow min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                        {event.title}
                      </span>
                      <span className="text-[10px] text-[#8eb0d4]/60 font-mono">{event.time}</span>
                    </div>
                    <p className="text-xs font-semibold text-white mt-1 truncate">{event.detail}</p>
                    <p className="text-[10px] text-[#8eb0d4]/80 font-mono mt-0.5 truncate">{event.meta}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
