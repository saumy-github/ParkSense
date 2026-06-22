import { useEffect, useRef } from 'react';

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

interface RiskCell {
  predicted_risk: string;
  confidence: number;
}

interface MapComponentProps {
  hotspots: HotspotSummary[];
  selectedId?: number | null;
  onSelectHotspot?: (id: number) => void;
  riskOverride?: Map<number, RiskCell>;
  visibleLayers?: Set<string>;
}

export default function MapComponent({ hotspots, selectedId, onSelectHotspot, riskOverride, visibleLayers }: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  const L = (window as any).L;

  useEffect(() => {
    if (!mapRef.current && L && mapContainerRef.current) {
      const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([12.9716, 77.5946], 12);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [L]);

  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current || hotspots.length === 0 || !L) return;

    markersGroupRef.current.clearLayers();

    // Which PS jurisdiction does the selected hotspot belong to?
    const selectedPsName = selectedId
      ? hotspots.find(h => h.cluster_id === selectedId)?.police_station_jurisdiction ?? null
      : null;

    hotspots.forEach(spot => {
      const lat = spot.center_latitude;
      const lng = spot.center_longitude;
      if (!lat || !lng) return;

      // Determine color, pulse, and layer key
      let markerColor = '#eab308'; // Yellow = MEDIUM default
      let isPulse = false;
      let layerKey = spot.priority_level;

      if (riskOverride && riskOverride.has(spot.cluster_id)) {
        const cell = riskOverride.get(spot.cluster_id)!;
        if (cell.predicted_risk === 'HIGH' && cell.confidence >= 0.8) {
          markerColor = '#ef4444'; isPulse = true; layerKey = 'CRITICAL';
        } else if (cell.predicted_risk === 'HIGH') {
          markerColor = '#f97316'; layerKey = 'HIGH';
        } else {
          markerColor = '#4b5563'; layerKey = 'LOW';
        }
      } else {
        if (spot.priority_level === 'CRITICAL') { markerColor = '#ef4444'; isPulse = true; }
        else if (spot.priority_level === 'HIGH') markerColor = '#f97316';
      }

      // Respect layer visibility
      if (visibleLayers && !visibleLayers.has(layerKey)) return;

      const customIcon = L.divIcon({
        className: 'custom-pulsing-marker-wrapper',
        html: `
          <div class="glowing-marker" style="color: ${markerColor}">
            <div class="marker-pin" style="background-color: ${markerColor}"></div>
            ${isPulse ? '<div class="marker-pulse"></div>' : ''}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const popupContent = `
        <div style="font-family: 'Geist', sans-serif; font-size: 12px; line-height: 1.4; color: #d4e4fa;">
          <b style="font-size: 14px; display: block; margin-bottom: 4px; color: #00f0ff">${spot.representative_junction}</b>
          <div style="color: #b9cacb; margin-bottom: 6px;">👮 Police Station: ${spot.police_station_jurisdiction}</div>
          <hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; gap: 8px;">
            <span style="font-weight: 700; color: ${markerColor}">${spot.priority_level} Priority</span>
            <span style="background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.12)">Impact: ${spot.congestion_impact_score}</span>
          </div>
        </div>
      `;

      const marker = L.marker([lat, lng], { icon: customIcon })
        .addTo(markersGroupRef.current)
        .bindPopup(popupContent);

      if (onSelectHotspot) {
        marker.on('click', () => onSelectHotspot(spot.cluster_id));
      }

      if (selectedId === spot.cluster_id) {
        setTimeout(() => {
          marker.openPopup();
          mapRef.current.setView([lat, lng], 14, { animate: true, duration: 0.8 });
        }, 100);
      }
    });

    // Police station markers
    if (!visibleLayers || visibleLayers.has('POLICE')) {
      const policeStations = new Map<string, { lat: number; lng: number }>();
      hotspots.forEach(spot => {
        if (!policeStations.has(spot.police_station_jurisdiction)) {
          policeStations.set(spot.police_station_jurisdiction, {
            lat: spot.center_latitude,
            lng: spot.center_longitude,
          });
        }
      });

      policeStations.forEach((coords, name) => {
        const isSelected = name === selectedPsName;

        const psIcon = L.divIcon({
          className: 'police-station-marker',
          html: isSelected
            ? `<div style="position: relative; width: 28px; height: 28px;">
                <span class="animate-ping" style="position: absolute; display: inline-flex; height: 28px; width: 28px; border-radius: 50%; background-color: #00f0ff; opacity: 0.6;"></span>
                <div style="background: #00f0ff; border: 2px solid white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(0,240,255,0.9); position: absolute; top: 0; left: 0; z-index: 1;">
                  <span class="material-symbols-outlined" style="color: #051424; font-size: 16px;">local_police</span>
                </div>
              </div>`
            : `<div style="background: #3b82f6; border: 2px solid white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(59,130,246,0.8); position: relative;">
                <span class="material-symbols-outlined" style="color: white; font-size: 16px;">local_police</span>
              </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const psPopup = `
          <div style="font-family: 'Geist', sans-serif; font-size: 14px; font-weight: bold; color: ${isSelected ? '#00f0ff' : '#3b82f6'}; margin-bottom: 4px;">${name}</div>
          <div style="font-size: 12px; color: #4b5563;">Police Station</div>
        `;

        L.marker([coords.lat + 0.001, coords.lng], { icon: psIcon })
          .addTo(markersGroupRef.current)
          .bindPopup(psPopup);
      });
    }

    if (!selectedId) {
      try {
        const bounds = hotspots.map(s => [s.center_latitude, s.center_longitude]);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      } catch (e) {
        console.error('Error fitting bounds:', e);
      }
    }
  }, [hotspots, selectedId, riskOverride, visibleLayers, L]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-outline-variant/30">
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '300px' }} />
    </div>
  );
}
