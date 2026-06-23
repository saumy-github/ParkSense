import React, { useEffect, useState, useMemo, Suspense } from 'react';
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
  hotspotDetails: Record<string, any>;
  showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const BUCKETS = [
  { key: 'early_morning', label: 'Early AM',  hours: '05–09' },
  { key: 'late_morning',  label: 'Late AM',   hours: '09–12' },
  { key: 'afternoon',     label: 'Afternoon', hours: '12–17' },
  { key: 'evening',       label: 'Evening',   hours: '17–21' },
  { key: 'night',         label: 'Night',     hours: '21–05' },
];

const LAYER_DEFS = [
  { key: 'CRITICAL', label: 'Critical',        color: '#ef4444' },
  { key: 'HIGH',     label: 'High',            color: '#f97316' },
  { key: 'MEDIUM',   label: 'Medium',          color: '#eab308' },
  { key: 'LOW',      label: 'Low',             color: '#4b5563' },
  { key: 'POLICE',   label: 'Police Stations', color: '#3b82f6' },
];

function getBucketKey(hour: number): string {
  if (hour >= 5 && hour < 9)   return 'early_morning';
  if (hour >= 9 && hour < 12)  return 'late_morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export default function ControlCenter({ hotspots, activeHotspotId, setActiveHotspotId, hotspotDetails }: ControlCenterProps) {
  const [now, setNow] = useState(new Date());
  const [selectedDay, setSelectedDay]       = useState<string>(() => DAYS_FULL[new Date().getDay()]);
  const [selectedBucket, setSelectedBucket] = useState<string>(() => getBucketKey(new Date().getHours()));
  const [visibleLayers, setVisibleLayers]   = useState<Set<string>>(
    new Set(['CRITICAL', 'HIGH', 'MEDIUM', 'POLICE'])
  );

  useEffect(() => {
    document.documentElement.classList.remove('light');
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // riskOverride: cluster_id → { predicted_risk, confidence } for selected day+bucket
  const riskOverride = useMemo(() => {
    const map = new Map<number, { predicted_risk: string; confidence: number }>();
    if (!hotspotDetails || Object.keys(hotspotDetails).length === 0) return map;
    Object.entries(hotspotDetails).forEach(([id, detail]: [string, any]) => {
      const cell = detail?.priority_prediction?.[selectedDay]?.[selectedBucket];
      if (cell) map.set(Number(id), cell);
    });
    return map;
  }, [hotspotDetails, selectedDay, selectedBucket]);

  // Stats
  let highZoneCount = 0;
  riskOverride.forEach(cell => { if (cell.predicted_risk === 'HIGH') highZoneCount++; });
  const congestionPct = hotspots.length > 0
    ? ((highZoneCount / hotspots.length) * 100).toFixed(1)
    : '0';
  const congestionNum = parseFloat(congestionPct);

  // Layer counts — time-aware when riskOverride loaded, else static
  const layerCounts = useMemo(() => {
    if (riskOverride.size > 0) {
      let critical = 0, high = 0, low = 0;
      riskOverride.forEach(cell => {
        if (cell.predicted_risk === 'HIGH' && cell.confidence >= 0.8) critical++;
        else if (cell.predicted_risk === 'HIGH') high++;
        else low++;
      });
      return { CRITICAL: critical, HIGH: high, MEDIUM: 0, LOW: low };
    }
    return {
      CRITICAL: hotspots.filter(h => h.priority_level === 'CRITICAL').length,
      HIGH:     hotspots.filter(h => h.priority_level === 'HIGH').length,
      MEDIUM:   hotspots.filter(h => h.priority_level === 'MEDIUM').length,
      LOW:      hotspots.filter(h => h.priority_level === 'LOW').length,
    };
  }, [riskOverride, hotspots]);

  const toggleLayer = (layer: string) => {
    setVisibleLayers(prev => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer); else next.add(layer);
      return next;
    });
  };

  // Clock
  const hh = now.getHours(), mm = now.getMinutes(), ss = now.getSeconds();
  const ampm  = hh >= 12 ? 'PM' : 'AM';
  const h12   = hh % 12 || 12;
  const clockStr = `${String(h12).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')} ${ampm}`;
  const dateStr  = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const liveBucket       = BUCKETS.find(b => b.key === getBucketKey(hh));
  const selectedBucketObj = BUCKETS.find(b => b.key === selectedBucket);

  return (
    <div className="mesh-gradient min-h-full bg-[#051424] text-[#d4e4fa] px-6 py-8 max-w-7xl mx-auto w-full transition-all duration-300">

      {/* ── Stat Cards ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

        {/* Card A — Live Clock */}
        <div className="glass-panel rounded-2xl p-6 border border-outline-variant/30 bg-[#0d2238]/60 hover:border-primary/40 transition-all">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#8eb0d4] mb-2">System Clock</p>
          <h2 className="text-3xl font-mono font-bold text-primary tracking-wider">{clockStr}</h2>
          <p className="text-xs text-[#8eb0d4] mt-1">{dateStr}</p>
          <p className="text-[10px] font-bold text-secondary mt-1 uppercase tracking-wider">
            {liveBucket ? `${liveBucket.label} · ${liveBucket.hours}:00` : ''}
          </p>
        </div>

        {/* Card B — High Risk Zones */}
        <div className="glass-panel rounded-2xl p-6 border border-outline-variant/30 bg-[#0d2238]/60 hover:border-error/40 transition-all">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#8eb0d4] mb-2">High Risk Zones</p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-bold text-error">
              {riskOverride.size > 0
                ? highZoneCount
                : hotspots.filter(h => h.priority_level === 'CRITICAL' || h.priority_level === 'HIGH').length}
            </h2>
            <span className="text-[#8eb0d4]/60 text-xs mb-1">active zones</span>
          </div>
          <p className="text-[10px] text-[#8eb0d4] mt-2 uppercase tracking-wider">
            {selectedBucketObj?.label ?? '—'} · {selectedDay}
          </p>
        </div>

        {/* Card C — City Congestion % */}
        <div className="glass-panel rounded-2xl p-6 border border-outline-variant/30 bg-[#0d2238]/60 hover:border-primary/40 transition-all">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#8eb0d4] mb-2">City Congestion</p>
          <h2 className={`text-4xl font-bold ${
            congestionNum > 50 ? 'text-error' : congestionNum > 30 ? 'text-[#f97316]' : 'text-secondary'
          }`}>
            {riskOverride.size > 0 ? `${congestionPct}%` : '—'}
          </h2>
          <p className="text-xs text-[#8eb0d4] mt-2">of {hotspots.length} zones HIGH risk</p>
        </div>
      </section>

      {/* ── Day + Bucket Selectors ── */}
      <section className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-1.5 flex-wrap">
          {DAYS_FULL.map((day, i) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedDay === day
                  ? 'bg-primary text-on-primary shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                  : 'bg-[#0d2238]/60 text-[#8eb0d4] hover:text-white border border-outline-variant/30'
              }`}
            >
              {DAY_LABELS[i]}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {BUCKETS.map(b => (
            <button
              key={b.key}
              onClick={() => setSelectedBucket(b.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedBucket === b.key
                  ? 'bg-secondary text-on-secondary shadow-[0_0_8px_rgba(192,193,255,0.3)]'
                  : 'bg-[#0d2238]/60 text-[#8eb0d4] hover:text-white border border-outline-variant/30'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Map Panel ── */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-outline-variant/30 bg-[#0d2238]/60 relative h-[600px] flex flex-col">

        <div className="p-4 bg-[#0d2238] border-b border-outline-variant/30 flex justify-between items-center shrink-0 z-10">
          <div>
            <p className="text-xs uppercase font-bold tracking-wider text-primary">Live Enforcement Heatmap</p>
            <p className="text-xs text-[#8eb0d4] mt-0.5">
              Bengaluru · {selectedBucketObj?.label} · {selectedDay}
            </p>
          </div>
          {activeHotspotId && (
            <button
              onClick={() => setActiveHotspotId(null)}
              className="text-xs text-secondary hover:underline cursor-pointer"
            >
              Clear Selection
            </button>
          )}
        </div>

        <div className="grow relative">
          <Suspense fallback={
            <div className="w-full h-full bg-[#051424] flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          }>
            <MapComponent
              hotspots={hotspots}
              selectedId={activeHotspotId}
              onSelectHotspot={setActiveHotspotId}
              riskOverride={riskOverride}
              visibleLayers={visibleLayers}
            />
          </Suspense>

          {/* Layer Controls */}
          <div className="absolute bottom-4 left-4 z-20">
            <div className="rounded-xl p-3.5 border border-primary/20 shadow-2xl min-w-[165px]"
                 style={{ background: 'rgba(5,20,36,0.92)', backdropFilter: 'blur(8px)' }}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#8eb0d4] mb-2.5">Layers</p>
              <div className="space-y-2">
                {LAYER_DEFS.map(layer => {
                  const count = layer.key === 'POLICE'
                    ? null
                    : layerCounts[layer.key as keyof typeof layerCounts];
                  return (
                    <label key={layer.key} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={visibleLayers.has(layer.key)}
                        onChange={() => toggleLayer(layer.key)}
                        className="w-3.5 h-3.5 cursor-pointer accent-[#00f0ff] shrink-0"
                      />
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: layer.color }} />
                      <span className="text-[10px] font-medium text-[#8eb0d4] group-hover:text-white transition-colors flex-1">
                        {layer.label}
                      </span>
                      {count !== null && count !== undefined && (
                        <span className="text-[9px] font-mono text-[#8eb0d4]/50">{count}</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
