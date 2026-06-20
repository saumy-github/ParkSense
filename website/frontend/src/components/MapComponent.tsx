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

interface MapComponentProps {
  hotspots: HotspotSummary[];
  selectedId: number | null;
  onSelectHotspot: (id: number) => void;
}

export default function MapComponent({ hotspots, selectedId, onSelectHotspot }: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  // Access Leaflet from window global loaded via CDN
  const L = (window as any).L;

  useEffect(() => {
    if (!mapRef.current && L && mapContainerRef.current) {
      // Create Map centered around Bengaluru center
      const map = L.map(mapContainerRef.current, {
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

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [L]);

  // Update map markers when hotspots load or change
  useEffect(() => {
    if (mapRef.current && markersGroupRef.current && hotspots.length > 0 && L) {
      markersGroupRef.current.clearLayers();

      hotspots.forEach(spot => {
        const lat = spot.center_latitude;
        const lng = spot.center_longitude;

        if (lat && lng) {
          let markerColor = '#00f0ff'; // Neon Cyan for MEDIUM / standard
          if (spot.priority_level === 'CRITICAL') {
            markerColor = '#ffb4ab'; // Soft red
          } else if (spot.priority_level === 'HIGH') {
            markerColor = '#c0c1ff'; // Light Indigo / secondary
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
            <div style="font-family: 'Geist', sans-serif; font-size: 12px; line-height: 1.4; color: #d4e4fa;">
              <b style="font-size: 14px; display: block; margin-bottom: 4px; color: #00f0ff">${spot.cluster_name}</b>
              <div style="color: #b9cacb; margin-bottom: 2px;">📍 Junction: ${spot.representative_junction}</div>
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

          marker.on('click', () => {
            onSelectHotspot(spot.cluster_id);
          });

          // Open popup if this marker is selected
          if (selectedId === spot.cluster_id) {
            setTimeout(() => {
              marker.openPopup();
              mapRef.current.setView([lat, lng], 14, { animate: true, duration: 0.8 });
            }, 100);
          }
        }
      });

      // Fit map bounds to encompass all markers if nothing is selected
      if (!selectedId) {
        try {
          const bounds = hotspots.map(s => [s.center_latitude, s.center_longitude]);
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        } catch (e) {
          console.error('Error fitting bounds:', e);
        }
      }
    }
  }, [hotspots, selectedId, L]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-outline-variant/30">
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '300px' }} />
    </div>
  );
}
