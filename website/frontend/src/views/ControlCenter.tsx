import React, { useEffect, Suspense } from 'react';
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
    id: 'INC-8891',
    type: 'double_parking',
    title: 'Double Parking Detected',
    time: '14:02:11',
    detail: 'SUV (KA-03-MM-1234) • Blocking lane',
    meta: 'Aruna Chouhan Muduar Road • EWR: 36%',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4z1V4R8kikm2sB2GRCvURwwmZvsgRGtKRrJq6MwiIAzjtywtK2r8pH7jHPeigTBjmUTM02sdJ0IpxkXeSACChV4WTuLLTnT0jpPtciF9k3juY_MLG6MqcjN1KUXcBesBiNDjnbNTfrWBsgS5zu7MAtHp0fT_5J7uymupxkELcatO7Q2_n_ls5OOPQ-zzGI3sc4rzbDKQuvT1xsUH1jCjwt-NKTz6fbXRBRzUA0G4ZS4-0XG6wn7g01-0wIao4c6PNLcqVeujvnjfL',
    clusterId: 1
  },
  {
    id: 'INC-9102',
    type: 'bus_lane',
    title: 'Bus Lane Obstruction',
    time: '14:01:45',
    detail: 'Hatchback (KA-04-DE-4321) • Station area',
    meta: '80 Feet Ring Road • EWR: 45%',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKUUimumdSNERHVhvVMcZPvCrN60OhNU_FFChuYDfHwoHU-ugH7l9QLKq4nOCFMzOqIMEfLHvJzLYJtW84-L07diQ2P3lRAsinr_TzJnL71m5qh_gbWVyhNvPCWZKBTrvRMAsaf-5R-3RNMqNplIhCddnTtRwJed7Awmuu51ba5iFrHXBpOFAGFUA2FaegJJQYxg9HcIzhQfpPLcLEsky3Y2lR1TLuCvfHar3HSLz5jK-7xT9jLejPT_Y8RnzZqtce13pued7TSphC',
    clusterId: 2
  },
  {
    id: 'INC-8884',
    type: 'sidewalk',
    title: 'Sidewalk Encroachment',
    time: '13:58:22',
    detail: 'Sedan (KA-01-AB-5678) • Blocking crosswalk',
    meta: 'Shivajinagar PS Area • Pedestrian Hazard',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_eTOXNCZpLC7km5ijkeGzTRq0Xn8RSPMiYbDjxo0znZ5TZZxiGpYj4nfSoKuQWrpnlzzEerHMl9kfcA6Z3_qGNR7Ir_81eRJ1kiZSLMzBRmpYWIcUKUrBvzpNfdTW6m5i4qvGwhBNjY4f2eQqMAStbl6c1Yz49YK-3hPwJyi_aMFR7nvkCpfCiGpxnnI1g3YQ30d4TcOtSshHgtNMNFAlO6ntJVl47ml6cS8LJzxTzFNYgbhh2HvcEsci3nCkwcWZ0AodoE6od64N',
    clusterId: 1
  }
];

export default function ControlCenter({ hotspots, activeHotspotId, setActiveHotspotId, customReportCount, showToast }: ControlCenterProps) {

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
        meta: 'Shivajinagar PS Junction • SPI: 64%',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_eTOXNCZpLC7km5ijkeGzTRq0Xn8RSPMiYbDjxo0znZ5TZZxiGpYj4nfSoKuQWrpnlzzEerHMl9kfcA6Z3_qGNR7Ir_81eRJ1kiZSLMzBRmpYWIcUKUrBvzpNfdTW6m5i4qvGwhBNjY4f2eQqMAStbl6c1Yz49YK-3hPwJyi_aMFR7nvkCpfCiGpxnnI1g3YQ30d4TcOtSshHgtNMNFAlO6ntJVl47ml6cS8LJzxTzFNYgbhh2HvcEsci3nCkwcWZ0AodoE6od64N',
        clusterId: 1
      });
    }
  }

  const handleEventClick = (clusterId: number, title: string) => {
    setActiveHotspotId(clusterId);
    showToast?.(`Focused live map on ${title}`, 'info');
  };

  return (
    <div className="mesh-gradient min-h-full bg-[#051424] text-[#d4e4fa] px-6 py-8 max-w-7xl mx-auto w-full transition-all duration-300">
      
      {/* Header Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Active Violations */}
        <div className="glass-panel rounded-2xl p-6 border border-outline-variant/30 bg-[#0d2238]/60 transition-all duration-300 hover:border-primary/40">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#8eb0d4] mb-2">Active Violations</p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-bold text-primary">{18 + customReportCount}</h2>
            <span className="text-[#8eb0d4]/60 text-xs mb-1">Ongoing Hotspots</span>
          </div>
          <div className="w-full bg-[#051424] h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              style={{ width: `${Math.min(100, 40 + (customReportCount * 8))}%` }}
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

        {/* Est. Delay Penalty Cost */}
        <div className="glass-panel rounded-2xl p-6 border border-outline-variant/30 bg-[#0d2238]/60 transition-all duration-300 hover:border-primary/40">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#8eb0d4] mb-2">Est. Congestion Loss</p>
          <h2 className="text-4xl font-bold text-primary">${(14.2 + (customReportCount * 0.4)).toFixed(1)}k/hr</h2>
          <div className="flex gap-1 mt-4 items-end h-8">
            <div className="flex-1 bg-primary/25 rounded-t h-[40%]"></div>
            <div className="flex-1 bg-primary/25 rounded-t h-[60%]"></div>
            <div className="flex-1 bg-primary/25 rounded-t h-[80%]"></div>
            <div className="flex-1 bg-primary/40 rounded-t h-[55%]"></div>
            <div className="flex-1 bg-primary/60 rounded-t h-[90%]"></div>
            <div className="flex-1 bg-primary rounded-t h-full shadow-[0_0_10px_#00f0ff]"></div>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map panel */}
        <div className="lg:col-span-8 glass-panel rounded-3xl overflow-hidden border border-outline-variant/30 bg-[#0d2238]/60 relative h-125 flex flex-col">
          <div className="p-4 bg-[#0d2238] border-b border-outline-variant/30 flex justify-between items-center z-10">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-primary">Live Enforcement Heatmap</p>
              <p className="text-xs text-[#8eb0d4] mt-0.5">Bengaluru Active Traffic Nodes</p>
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
                hotspots={hotspots}
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
            {dynamicEvents.map((event) => {
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
