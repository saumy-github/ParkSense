import { useMemo } from 'react';
import { Clock, TrendingUp, ShieldAlert, Building2, FileText, Download, Share2 } from 'lucide-react';

interface HotspotSummary {
  cluster_id: number;
  cluster_name: string;
  representative_junction: string;
  police_station_jurisdiction: string;
  congestion_impact_score: number;
  total_incident_count: number;
  priority_level: string;
}

interface PerformanceReportsProps {
  hotspots: HotspotSummary[];
}

// Real monthly violation counts (Nov 2023 – Apr 2024)
const MONTHLY_DATA = [
  { month: 'NOV', value: 28,  count: 22_180 },
  { month: 'DEC', value: 72,  count: 55_840 },
  { month: 'JAN', value: 85,  count: 66_120 },
  { month: 'FEB', value: 78,  count: 60_440 },
  { month: 'MAR', value: 100, count: 70_060 },
  { month: 'APR', value: 5,   count:  3_665 },
];

// Hourly distribution — peak 10–11 AM after burst-artifact removal
const HOURLY_DATA = [
  { label: '06AM', value: 28  },
  { label: '07AM', value: 42  },
  { label: '08AM', value: 68  },
  { label: '09AM', value: 88  },
  { label: '10AM', value: 95  },
  { label: '11AM', value: 100 },
  { label: '12PM', value: 82  },
  { label: '02PM', value: 60  },
  { label: '04PM', value: 55  },
  { label: '06PM', value: 48  },
  { label: '08PM', value: 30  },
  { label: '10PM', value: 14  },
];

// Day-of-week avg risk — computed from risk_by_day_hour across 300 clusters
const DOW_DATA = [
  { day: 'Mon', value: 20.1 },
  { day: 'Tue', value: 22.6 },
  { day: 'Wed', value: 23.0 },
  { day: 'Thu', value: 23.1 },
  { day: 'Fri', value: 21.3 },
  { day: 'Sat', value: 22.3 },
  { day: 'Sun', value: 24.1 },
];

// Vehicle composition — aggregated from vehicle_composition across 300 clusters
const VEHICLE_DATA = [
  { label: 'CAR',            pct: 34.3, color: '#ef4444' },
  { label: 'SCOOTER',        pct: 28.0, color: '#f97316' },
  { label: 'MOTOR CYCLE',    pct: 14.1, color: '#eab308' },
  { label: 'PASSENGER AUTO', pct:  8.5, color: '#00f0ff' },
  { label: 'MAXI-CAB',       pct:  3.5, color: '#a78bfa' },
  { label: 'LGV',            pct:  3.0, color: '#34d399' },
];

const MAX_MONTHLY = Math.max(...MONTHLY_DATA.map(d => d.value));
const MAX_DOW     = Math.max(...DOW_DATA.map(d => d.value));

export default function PerformanceReports({ hotspots }: PerformanceReportsProps) {
  const loading = hotspots.length === 0;

  const criticalCount  = hotspots.filter(h => h.priority_level === 'CRITICAL').length;
  const highCount      = hotspots.filter(h => h.priority_level === 'HIGH').length;
  const totalIncidents = hotspots.reduce((s, h) => s + h.total_incident_count, 0);
  const psCount        = new Set(hotspots.map(h => h.police_station_jurisdiction)).size;

  const top10 = useMemo(() =>
    [...hotspots].sort((a, b) => b.congestion_impact_score - a.congestion_impact_score).slice(0, 10),
  [hotspots]);

  // Police Station Rankings — grouped from hotspots prop
  const psRankings = useMemo(() => {
    const map = new Map<string, { incidents: number; critical: number; high: number }>();
    hotspots.forEach(h => {
      const ps = h.police_station_jurisdiction;
      if (!map.has(ps)) map.set(ps, { incidents: 0, critical: 0, high: 0 });
      const e = map.get(ps)!;
      e.incidents += h.total_incident_count;
      if (h.priority_level === 'CRITICAL') e.critical++;
      if (h.priority_level === 'HIGH')     e.high++;
    });
    return [...map.entries()]
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.incidents - a.incidents);
  }, [hotspots]);

  const maxPsIncidents = psRankings[0]?.incidents ?? 1;

  return (
    <div className="min-h-full bg-[#051424] text-[#d4e4fa] px-6 py-8 max-w-7xl mx-auto space-y-10 w-full">

      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">Congestion Analytics Console</h2>
          <p className="text-[#8eb0d4] text-sm mt-1">
            Spatial correlation metrics and AI parking violation forecasting model results.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0d2238]/60 px-4 py-2 rounded-lg border border-outline-variant/30">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-mono text-[#8eb0d4]">Nov 2023 – Apr 2024</span>
          </div>
          <div className="flex items-center gap-2 bg-[#0d2238]/60 px-4 py-2 rounded-lg border border-outline-variant/30">
            <span className="material-symbols-outlined text-sm text-primary">filter_alt</span>
            <span className="text-xs font-mono text-[#8eb0d4]">All Jurisdictions</span>
          </div>
        </div>
      </section>

      {/* ── Metrics Row (3 cards) ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="glass-panel p-6 rounded-2xl bg-[#0d2238]/60 border border-outline-variant/30 flex flex-col justify-between hover:border-primary/45 transition-all">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8eb0d4] mb-1">Total Violations Logged</p>
            <h3 className="text-4xl font-bold text-primary">
              {loading ? '—' : `${(totalIncidents / 1000).toFixed(0)}k`}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-4 text-primary">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Across {hotspots.length} detected clusters</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl bg-[#0d2238]/60 border border-outline-variant/30 flex flex-col justify-between hover:border-error/45 transition-all">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8eb0d4] mb-1">Critical Hotspots</p>
            <h3 className="text-4xl font-bold text-error">
              {loading ? '—' : criticalCount}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-4 text-error">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{loading ? '…' : `+ ${highCount} HIGH priority zones`}</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl bg-[#0d2238]/60 border border-outline-variant/30 flex flex-col justify-between hover:border-secondary/45 transition-all">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8eb0d4] mb-1">Police Jurisdictions</p>
            <h3 className="text-4xl font-bold text-secondary">
              {loading ? '—' : psCount}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-4 text-secondary">
            <Building2 className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Bengaluru city-wide coverage</span>
          </div>
        </div>
      </section>

      {/* ── Row 1: Monthly chart + Violation Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Monthly Violations */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl bg-[#0d2238]/60 border border-outline-variant/30 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-bold text-primary">Violations Per Month</h4>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8eb0d4] mt-1">
                Dataset coverage: Nov 2023 – Apr 2024 · 278k total records
              </p>
            </div>
            <span className="text-[9px] font-bold text-primary/60 bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
              DBSCAN SOURCE DATA
            </span>
          </div>
          <div className="h-56 w-full flex items-end gap-3 border-b border-outline-variant/20 pb-2 px-2">
            {MONTHLY_DATA.map(d => {
              const isPeak = d.value === MAX_MONTHLY;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[9px] font-mono text-[#8eb0d4]/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count.toLocaleString()}
                  </span>
                  <div
                    className={`w-full rounded-t-sm transition-all duration-300 cursor-default ${
                      isPeak
                        ? 'bg-primary shadow-[0_0_12px_rgba(0,240,255,0.4)] hover:bg-primary/90'
                        : 'bg-primary/35 hover:bg-primary/55'
                    }`}
                    style={{ height: `${(d.value / MAX_MONTHLY) * 224}px` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 px-1">
            {MONTHLY_DATA.map(d => (
              <span key={d.month} className="flex-1 text-center text-[10px] text-[#8eb0d4]/60 font-mono">{d.month}</span>
            ))}
          </div>
        </div>

        {/* Violation Breakdown donut */}
        <div className="glass-panel p-8 rounded-3xl bg-[#0d2238]/60 border border-outline-variant/30 flex flex-col justify-between">
          <h4 className="text-lg font-bold text-primary mb-6">Violation Breakdown</h4>
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-[#051424]" cx="72" cy="72" fill="transparent" r="60" stroke="currentColor" strokeWidth="10" />
                <circle className="text-primary" cx="72" cy="72" fill="transparent" r="60"
                  stroke="currentColor" strokeDasharray="377" strokeDashoffset="120"
                  strokeLinecap="round" strokeWidth="10" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-primary">68%</span>
                <span className="text-[8px] font-bold text-[#8eb0d4] tracking-wider text-center">NO / WRONG<br/>PARKING</span>
              </div>
            </div>
            <div className="w-full space-y-3">
              {[
                { label: 'No / Wrong Parking', pct: 68, color: 'bg-primary' },
                { label: 'Double Parking',      pct: 20, color: 'bg-error'   },
                { label: 'Footpath / Bus Lane', pct: 12, color: 'bg-secondary' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-[#8eb0d4] font-medium">{item.label}</span>
                    <span className="font-mono text-primary font-bold">{item.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#051424] rounded-full overflow-hidden">
                    <div className={`${item.color} h-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Hourly + Day-of-Week ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Hourly Distribution */}
        <div className="glass-panel p-8 rounded-3xl bg-[#0d2238]/60 border border-outline-variant/30">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-bold text-primary">Hourly Violation Distribution</h4>
              <p className="text-xs text-[#8eb0d4] mt-1">Normalised 24h cycle · peak 10–11 AM</p>
            </div>
            <span className="text-[9px] text-error font-bold bg-error/10 px-2 py-1 rounded-full border border-error/20">
              PEAK 10–11 AM
            </span>
          </div>
          <div className="grid gap-2 h-44 items-end px-2 border-b border-outline-variant/20 pb-2"
               style={{ gridTemplateColumns: `repeat(${HOURLY_DATA.length}, 1fr)` }}>
            {HOURLY_DATA.map(d => {
              const isPeak = d.value >= 88;
              return (
                <div key={d.label} className="group relative flex flex-col items-center">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-[9px] text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-outline-variant/30">
                    {d.label}: {d.value}%
                  </div>
                  <div
                    className={`w-full rounded-t-sm transition-all cursor-default ${
                      isPeak ? 'bg-error/80 hover:bg-error' : 'bg-primary/40 hover:bg-primary/65'
                    }`}
                    style={{ height: `${(d.value / 100) * 176}px` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 px-1">
            {HOURLY_DATA.map(d => (
              <span key={d.label} className="flex-1 text-center text-[8px] text-[#8eb0d4]/50 font-mono">{d.label}</span>
            ))}
          </div>
        </div>

        {/* Day-of-Week Risk */}
        <div className="glass-panel p-8 rounded-3xl bg-[#0d2238]/60 border border-outline-variant/30">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-bold text-primary">Day-of-Week Risk</h4>
              <p className="text-xs text-[#8eb0d4] mt-1">Avg risk score · computed from 300 clusters</p>
            </div>
            <span className="text-[9px] text-[#f97316] font-bold bg-[#f97316]/10 px-2 py-1 rounded-full border border-[#f97316]/20">
              SUN PEAK
            </span>
          </div>
          <div className="flex items-end gap-3 h-44 border-b border-outline-variant/20 pb-2 px-2">
            {DOW_DATA.map(d => {
              const isPeak = d.value === MAX_DOW;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[9px] font-mono text-[#8eb0d4]/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.value}
                  </span>
                  <div
                    className={`w-full rounded-t-sm transition-all duration-300 cursor-default ${
                      isPeak
                        ? 'bg-[#f97316] shadow-[0_0_10px_rgba(249,115,22,0.4)] hover:bg-[#f97316]/90'
                        : 'bg-[#f97316]/35 hover:bg-[#f97316]/55'
                    }`}
                    style={{ height: `${(d.value / MAX_DOW) * 160}px` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 px-1">
            {DOW_DATA.map(d => (
              <span key={d.day} className="flex-1 text-center text-[10px] text-[#8eb0d4]/60 font-mono">{d.day}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Vehicle Composition + Top 10 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Vehicle Composition */}
        <div className="glass-panel p-8 rounded-3xl bg-[#0d2238]/60 border border-outline-variant/30">
          <h4 className="text-lg font-bold text-primary mb-2">Vehicle Composition</h4>
          <p className="text-xs text-[#8eb0d4] mb-6">Share of illegal parking incidents by vehicle type</p>
          <div className="space-y-4">
            {VEHICLE_DATA.map(v => (
              <div key={v.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-[#d4e4fa]">{v.label}</span>
                  <span className="text-xs font-mono font-bold" style={{ color: v.color }}>{v.pct}%</span>
                </div>
                <div className="w-full h-2 bg-[#051424] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${v.pct}%`, backgroundColor: v.color, boxShadow: `0 0 6px ${v.color}60` }}
                  />
                </div>
              </div>
            ))}
            <p className="text-[10px] text-[#8eb0d4]/60 mt-4 pt-3 border-t border-outline-variant/20">
              CAR + SCOOTER = 62.3% of all violations
            </p>
          </div>
        </div>

        {/* Top 10 Hotspots */}
        <div className="glass-panel p-6 rounded-3xl bg-[#0d2238]/60 border border-outline-variant/30 flex flex-col">
          <h4 className="text-base font-bold text-primary mb-1">Top Hotspots</h4>
          <p className="text-[9px] text-[#8eb0d4] mb-4 uppercase tracking-wider">Ranked by congestion impact index</p>
          {loading ? (
            <div className="grow flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto grow">
              {top10.map((h, i) => {
                const isCritical = h.priority_level === 'CRITICAL';
                const isHigh     = h.priority_level === 'HIGH';
                const shortName  = h.cluster_name.replace(/ Cluster Hub$/, '').replace(/^BTP\d+ - /, '');
                return (
                  <div key={h.cluster_id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#051424]/40 border border-outline-variant/10 hover:border-primary/20 transition-colors">
                    <span className="w-5 h-5 rounded-md bg-primary/10 text-primary font-black text-[9px] flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="grow min-w-0">
                      <h5 className="text-[10px] font-bold text-white truncate leading-tight">{shortName}</h5>
                      <p className="text-[8px] text-[#8eb0d4]/60 truncate">{h.police_station_jurisdiction}</p>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black shrink-0 ${
                      isCritical ? 'bg-error text-white' :
                      isHigh     ? 'bg-orange-500 text-black' :
                                   'bg-secondary text-on-secondary'
                    }`}>
                      {h.congestion_impact_score.toFixed(0)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Police Station Rankings (full width) ── */}
      <section className="glass-panel p-6 rounded-2xl bg-[#0d2238]/60 border border-outline-variant/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-base font-bold text-primary">Police Station Rankings</h4>
            <p className="text-xs text-[#8eb0d4] mt-0.5">Total incidents per jurisdiction · ranked by enforcement priority</p>
          </div>
          <span className="text-[9px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            {psRankings.length} JURISDICTIONS
          </span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2.5">
            {psRankings.slice(0, 15).map((ps, i) => (
              <div key={ps.name} className="flex items-center gap-4 p-3 rounded-xl bg-[#051424]/40 border border-outline-variant/10 hover:border-primary/15 transition-colors">
                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary font-black text-[10px] flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="w-44 shrink-0">
                  <p className="text-[11px] font-bold text-white truncate">{ps.name}</p>
                  <div className="flex gap-2 mt-0.5">
                    {ps.critical > 0 && (
                      <span className="text-[8px] font-black text-error">{ps.critical} CRIT</span>
                    )}
                    {ps.high > 0 && (
                      <span className="text-[8px] font-black text-[#f97316]">{ps.high} HIGH</span>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="w-full h-1.5 bg-[#051424] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/60 rounded-full transition-all duration-500"
                      style={{ width: `${(ps.incidents / maxPsIncidents) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-primary shrink-0 w-16 text-right">
                  {ps.incidents.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Anomaly Detection ── */}
      <section className="glass-panel p-6 rounded-2xl bg-[#0d2238]/60 border border-outline-variant/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="text-base font-bold text-primary">Tier 3 Anomaly Detection Summary</h4>
            <p className="text-xs text-[#8eb0d4] mt-0.5">Z-score baseline per cluster · threshold σ &gt; 2.5</p>
          </div>
          <span className="text-[9px] font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20 w-fit">
            LIVE MODEL OUTPUT
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Cluster-Days Observed',  value: '15,888', sub: 'across 300 clusters' },
            { label: 'Anomalous Spike Events', value: '531',    sub: '3.34% of cluster-days', highlight: true },
            { label: 'Max Z-Score Detected',   value: '8.65σ',  sub: 'Dr Rajkumar Puniya Bhoomi Rd · Jan 24' },
            { label: 'Anomaly Threshold',      value: '2.5σ',   sub: 'above rolling baseline' },
          ].map(stat => (
            <div key={stat.label} className={`p-4 rounded-xl border ${stat.highlight ? 'border-error/30 bg-error/5' : 'border-outline-variant/15 bg-[#051424]/40'}`}>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#8eb0d4] mb-1">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.highlight ? 'text-error' : 'text-primary'}`}>{stat.value}</p>
              <p className="text-[9px] text-[#8eb0d4]/60 mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Export Bar ── */}
      <div className="flex justify-center w-full pt-2">
        <div className="flex flex-wrap items-center justify-center gap-2 p-2 glass-panel rounded-full shadow-2xl border border-primary/20 bg-[#0d2238]/95">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-bold text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Export Analytics PDF</span>
          </button>
          <button
            onClick={() => {
              const sorted = [...hotspots].sort((a, b) => b.congestion_impact_score - a.congestion_impact_score);
              const csv = [
                'Rank,Name,Junction,Jurisdiction,Score,Priority,Incidents',
                ...sorted.map((h, i) =>
                  `${i + 1},"${h.cluster_name}","${h.representative_junction}","${h.police_station_jurisdiction}",${h.congestion_impact_score},${h.priority_level},${h.total_incident_count}`
                ),
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'bengaluru_parking_hotspots_300.csv';
              a.click();
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#0d2238] text-primary rounded-full font-bold text-sm hover:bg-[#0d2238]/80 active:scale-95 transition-all cursor-pointer border border-primary/20"
          >
            <Download className="w-4 h-4" />
            <span>Export All 300 CSV</span>
          </button>
          <div className="w-px h-8 bg-outline-variant mx-2" />
          <button
            onClick={() => { navigator.clipboard?.writeText(window.location.href); }}
            className="p-3 rounded-full hover:bg-[#0d2238] transition-colors text-primary cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
