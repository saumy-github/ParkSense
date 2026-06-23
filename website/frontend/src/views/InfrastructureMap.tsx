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

interface InfrastructureMapProps {
  hotspots: HotspotSummary[];
}

const LAYER_DEFS = [
  { key: 'CRITICAL', label: 'Critical',        color: '#ef4444' },
  { key: 'HIGH',     label: 'High',            color: '#f97316' },
  { key: 'MEDIUM',   label: 'Medium',          color: '#eab308' },
  { key: 'LOW',      label: 'Low',             color: '#4b5563' },
  { key: 'POLICE',   label: 'Police Stations', color: '#3b82f6' },
];

export default function InfrastructureMap({ hotspots }: InfrastructureMapProps) {
  const [visibleLayers, setVisibleLayers] = useState<Set<string>>(
    new Set(['CRITICAL', 'HIGH', 'MEDIUM', 'POLICE'])
  );

  useEffect(() => {
    document.documentElement.classList.remove('light');
  }, []);

  const toggleLayer = (layer: string) => {
    setVisibleLayers(prev => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer); else next.add(layer);
      return next;
    });
  };

  const counts = {
    CRITICAL: hotspots.filter(h => h.priority_level === 'CRITICAL').length,
    HIGH:     hotspots.filter(h => h.priority_level === 'HIGH').length,
    MEDIUM:   hotspots.filter(h => h.priority_level === 'MEDIUM').length,
    LOW:      hotspots.filter(h => h.priority_level === 'LOW').length,
  };

  return (
    <div className="h-[calc(100vh-80px)] w-full relative overflow-hidden bg-[#020b14] text-on-surface">

      {/* Full-bleed map */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={
          <div className="w-full h-full bg-[#051424] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        }>
          <MapComponent
            hotspots={hotspots}
            visibleLayers={visibleLayers}
          />
        </Suspense>
      </div>

      {/* Layer Controls — bottom left */}
      <div className="absolute bottom-8 left-6 z-20">
        <div className="rounded-xl p-4 border border-primary/20 shadow-2xl min-w-[170px]"
             style={{ background: 'rgba(5,20,36,0.92)', backdropFilter: 'blur(8px)' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#8eb0d4] mb-3">Layers</p>
          <div className="space-y-2.5">
            {LAYER_DEFS.map(layer => {
              const count = layer.key === 'POLICE' ? null : counts[layer.key as keyof typeof counts];
              return (
                <label key={layer.key} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={visibleLayers.has(layer.key)}
                    onChange={() => toggleLayer(layer.key)}
                    className="w-3.5 h-3.5 cursor-pointer accent-[#00f0ff] shrink-0"
                  />
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: layer.color }} />
                  <span className="text-[11px] font-medium text-[#8eb0d4] group-hover:text-white transition-colors flex-1">
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
  );
}
