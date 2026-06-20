import { useEffect, useState } from 'react';
import MapComponent from '../components/MapComponent';

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

interface InfrastructureMapProps {
  hotspots: HotspotSummary[];
  activeHotspotId: number | null;
  setActiveHotspotId: (id: number | null) => void;
}

export default function InfrastructureMap({ hotspots, activeHotspotId, setActiveHotspotId }: InfrastructureMapProps) {
  const [selectedLayer, setSelectedLayer] = useState<'occupancy' | 'sensors'>('occupancy');
  
  // Find current selected hotspot details
  const activeHotspot = hotspots.find(h => h.cluster_id === activeHotspotId) || hotspots[0];

  useEffect(() => {
    document.documentElement.classList.remove('light');
  }, []);

  return (
    <div className="h-[calc(100vh-80px)] w-full relative overflow-hidden bg-[#020b14] text-on-surface transition-all duration-300">
      
      {/* Full-Bleed Map Canvas */}
      <div className="absolute inset-0 z-0">
        <MapComponent 
          hotspots={hotspots}
          selectedId={activeHotspotId}
          onSelectHotspot={setActiveHotspotId}
        />
      </div>

      {/* Floating Map Layer Control (Bottom Left) */}
      <div className="absolute bottom-8 left-8 z-20 flex gap-4">
        <div className="glass-panel px-4 py-2.5 rounded-full flex items-center gap-3 shadow-lg border border-primary/20 bg-surface/90">
          <div className="flex items-center gap-2 cursor-pointer">
            <input 
              checked={selectedLayer === 'occupancy'} 
              onChange={() => setSelectedLayer('occupancy')}
              className="w-4 h-4 text-primary bg-surface-container focus:ring-primary border-outline-variant cursor-pointer" 
              id="occupancy" 
              name="layer" 
              type="radio"
            />
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant cursor-pointer" htmlFor="occupancy">Occupancy</label>
          </div>
          <div className="w-px h-4 bg-outline-variant/30"></div>
          <div className="flex items-center gap-2 cursor-pointer">
            <input 
              checked={selectedLayer === 'sensors'} 
              onChange={() => setSelectedLayer('sensors')}
              className="w-4 h-4 text-primary bg-surface-container focus:ring-primary border-outline-variant cursor-pointer" 
              id="sensors" 
              name="layer" 
              type="radio"
            />
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant cursor-pointer" htmlFor="sensors">Sensors</label>
          </div>
        </div>
      </div>

      {/* Detail Drill-down Panel (Right Sidebar) */}
      {activeHotspot && (
        <div className="absolute top-6 bottom-6 right-6 w-96 z-30 glass-panel rounded-2xl p-6 flex flex-col shadow-2xl border border-primary/10 overflow-y-auto bg-[#0d2238]/90">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-primary font-bold text-[10px] uppercase tracking-widest block">Selected Facility</span>
              <h2 className="text-xl font-bold text-on-surface mt-1 leading-snug">{activeHotspot.cluster_name}</h2>
              <p className="text-on-surface-variant text-xs flex items-center gap-1 mt-1 font-mono">
                <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                {activeHotspot.representative_junction}
              </p>
            </div>
            {activeHotspotId && (
              <button 
                onClick={() => setActiveHotspotId(null)}
                className="p-1.5 hover:bg-surface-container-high rounded-lg transition-colors flex items-center justify-center text-on-surface-variant hover:text-primary"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>

          {/* Status Glow Header */}
          <div className="relative bg-surface-container-high/40 rounded-xl p-4 mb-6 border border-outline-variant/20 overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary ai-pulse"></div>
            <div className="flex justify-between items-center relative z-10">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase text-primary/70 tracking-wide">Congestion Impact</span>
                <span className="text-sm text-on-surface font-extrabold mt-0.5">
                  {activeHotspot.priority_level} LEVEL
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-primary">
                  {activeHotspot.congestion_impact_score}<span className="text-xs font-normal opacity-70"> idx</span>
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-surface-container-low/50 border border-outline-variant/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-on-surface-variant mb-1">
                <span className="material-symbols-outlined text-sm">directions_car</span>
                <span className="text-[9px] font-bold uppercase tracking-wider">Incidents</span>
              </div>
              <div className="font-mono text-lg font-bold text-on-surface">
                {activeHotspot.total_incident_count} <span className="text-[10px] text-on-surface-variant font-normal">LOGGED</span>
              </div>
            </div>
            <div className="bg-surface-container-low/50 border border-outline-variant/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-on-surface-variant mb-1">
                <span className="material-symbols-outlined text-sm">bolt</span>
                <span className="text-[9px] font-bold uppercase tracking-wider">EV Status</span>
              </div>
              <div className="font-mono text-lg font-bold text-secondary">
                08 <span className="text-[10px] text-on-surface-variant font-normal">FREE</span>
              </div>
            </div>
          </div>

          {/* Live Sensor Feed */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">Sensor Health</h3>
              <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-primary/20">98.4% ONLINE</span>
            </div>
            
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 bg-surface-container-lowest/30 border border-outline-variant/15 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,219,233,0.6)]"></span>
                  <span className="text-xs font-semibold">Entry Cam L1-A</span>
                </div>
                <span className="text-[10px] text-on-surface-variant font-mono">Active</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-container-lowest/30 border border-outline-variant/15 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,219,233,0.6)]"></span>
                  <span className="text-xs font-semibold">Junction Radar Array</span>
                </div>
                <span className="text-[10px] text-on-surface-variant font-mono">Calibrated</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-error-container/10 border border-error/15 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                  <span className="text-xs font-semibold text-error">Exit Barrier B</span>
                </div>
                <span className="text-[10px] text-error font-mono font-bold">Offline</span>
              </div>
            </div>
          </div>

          {/* Occupancy Trends Graph */}
          <div className="mt-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3">Junction Peak Load</h3>
            <div className="h-28 w-full flex items-end gap-1 px-1">
              <div className="flex-1 bg-primary/20 hover:bg-primary/45 transition-colors h-[40%] rounded-t-sm" title="08:00"></div>
              <div className="flex-1 bg-primary/20 hover:bg-primary/45 transition-colors h-[55%] rounded-t-sm" title="09:00"></div>
              <div className="flex-1 bg-primary/20 hover:bg-primary/45 transition-colors h-[85%] rounded-t-sm" title="10:00"></div>
              <div className="flex-1 bg-primary/40 hover:bg-primary/75 transition-colors h-[95%] rounded-t-sm border-t border-primary" title="11:00"></div>
              <div className="flex-1 bg-primary/40 hover:bg-primary/75 transition-colors h-[90%] rounded-t-sm border-t border-primary" title="12:00"></div>
              <div className="flex-1 bg-primary/20 hover:bg-primary/45 transition-colors h-[75%] rounded-t-sm" title="13:00"></div>
              <div className="flex-1 bg-primary/20 hover:bg-primary/45 transition-colors h-[60%] rounded-t-sm" title="14:00"></div>
              <div className="flex-1 bg-primary/20 hover:bg-primary/45 transition-colors h-[50%] rounded-t-sm" title="15:00"></div>
            </div>
            <div className="flex justify-between mt-2 px-1 text-[9px] text-on-surface-variant font-mono">
              <span>08:00 AM</span>
              <span>12:00 PM</span>
              <span>04:00 PM</span>
            </div>
          </div>

          <button className="mt-6 w-full py-3.5 glass-panel border-primary/30 text-primary font-bold text-xs rounded-xl hover:bg-primary hover:text-on-primary transition-all active:scale-98">
            Full Systems Report
          </button>
        </div>
      )}
    </div>
  );
}
