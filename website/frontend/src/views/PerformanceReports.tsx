import { useEffect } from 'react';
import { Clock, TrendingUp, ShieldAlert, Award, FileText, Download, Share2 } from 'lucide-react';

export default function PerformanceReports() {
  useEffect(() => {
    document.documentElement.classList.remove('light');
  }, []);

  // Top hotspots derived from notebooks
  const topHotspots = [
    { rank: 1, name: 'Shivajinagar Junction', jurisdiction: 'Shivajinagar PS', score: 92.4, status: 'Critical' },
    { rank: 2, name: 'Malleshwaram Orion Ring Rd', jurisdiction: 'Malleshwaram PS', score: 68.1, status: 'High' },
    { rank: 3, name: 'MG Road Metro Access', jurisdiction: 'Cubbon Park PS', score: 58.5, status: 'Medium' },
    { rank: 4, name: 'Commercial Street Entrance', jurisdiction: 'Commercial St PS', score: 54.2, status: 'Medium' },
    { rank: 5, name: 'Indiranagar 100ft Rd Hub', jurisdiction: 'Indiranagar PS', score: 49.8, status: 'Low' }
  ];

  return (
    <div className="min-h-full bg-[#051424] text-[#d4e4fa] px-6 py-8 max-w-7xl mx-auto space-y-10 w-full relative">
      
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">Congestion Analytics Console</h2>
          <p className="text-[#8eb0d4] text-sm mt-1">Spatial correlation metrics and AI parking violation forecasting model results.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0d2238]/60 px-4 py-2 rounded-lg border border-outline-variant/30">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-mono text-[#8eb0d4]">Active Cycle: 30D</span>
          </div>
          <div className="flex items-center gap-2 bg-[#0d2238]/60 px-4 py-2 rounded-lg border border-outline-variant/30">
            <span className="material-symbols-outlined text-sm text-primary">filter_alt</span>
            <span className="text-xs font-mono text-[#8eb0d4]">All Jurisdictions</span>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="glass-panel p-6 rounded-2xl bg-[#0d2238]/60 border border-outline-variant/30 flex flex-col justify-between hover:border-primary/45 transition-all duration-300">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8eb0d4] mb-1">Avg Delay Propagated</p>
            <h3 className="text-4xl font-bold text-primary">14.8m</h3>
          </div>
          <div className="flex items-center gap-2 mt-4 text-primary">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">+18.5% in peak hours</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-6 rounded-2xl bg-[#0d2238]/60 border border-outline-variant/30 flex flex-col justify-between hover:border-primary/45 transition-all duration-300">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8eb0d4] mb-1">Avg Speed Reduction</p>
            <h3 className="text-4xl font-bold text-primary">53.4%</h3>
          </div>
          <div className="flex items-center gap-2 mt-4 text-primary">
            <span className="material-symbols-outlined text-xs">speed</span>
            <span className="text-xs font-bold">Effective width down 36%</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-6 rounded-2xl bg-[#0d2238]/60 border border-outline-variant/30 flex flex-col justify-between hover:border-error/45 transition-all duration-300">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8eb0d4] mb-1">Critical Hotspots</p>
            <h3 className="text-4xl font-bold text-error">02</h3>
          </div>
          <div className="flex items-center gap-2 mt-4 text-error">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Shivajinagar & Malleshwaram</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-6 rounded-2xl bg-[#0d2238]/60 border border-outline-variant/30 flex flex-col justify-between hover:border-secondary/45 transition-all duration-300">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8eb0d4] mb-1">Patrol Dispatch Rate</p>
            <h3 className="text-4xl font-bold text-secondary">84.6%</h3>
          </div>
          <div className="flex items-center gap-2 mt-4 text-secondary">
            <Award className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">AI Autopilot dispatcher</span>
          </div>
        </div>
      </section>

      {/* Charts & Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Violations per Month Trend */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl bg-[#0d2238]/60 border border-outline-variant/30 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-bold text-primary">Violations Per Month Trend</h4>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8eb0d4] mt-1">Monthly aggregate of detected on-street parking offenses</p>
            </div>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_#00f0ff]"></span>
              <span className="w-3 h-3 rounded-full bg-secondary shadow-[0_0_8px_#c0c1ff]"></span>
            </div>
          </div>
          
          <div className="h-72 w-full relative flex items-end justify-between border-l border-b border-outline-variant/20 pb-2 px-2">
            {/* SVG Forecast Line */}
            <div className="absolute inset-0 top-12 opacity-15 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
                <path 
                  d="M0,320 L200,280 L400,220 L600,160 L800,100 L1000,40 V400 H0 Z" 
                  fill="url(#chart-gradient)"
                />
                <defs>
                  <linearGradient id="chart-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00f0ff" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="absolute inset-0 top-12 pointer-events-none">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 400" preserveAspectRatio="none">
                <path 
                  d="M0,320 L200,280 L400,220 L600,160 L800,100 L1000,40" 
                  fill="none" 
                  stroke="#00f0ff" 
                  strokeWidth="4" 
                  className="line-draw"
                />
              </svg>
            </div>

            <span className="text-[10px] text-[#8eb0d4]/60 font-mono">MAY</span>
            <span className="text-[10px] text-[#8eb0d4]/60 font-mono">JUN</span>
            <span className="text-[10px] text-[#8eb0d4]/60 font-mono">JUL</span>
            <span className="text-[10px] text-[#8eb0d4]/60 font-mono">AUG</span>
            <span className="text-[10px] text-[#8eb0d4]/60 font-mono">SEP</span>
            <span className="text-[10px] text-[#8eb0d4]/60 font-mono">OCT</span>
          </div>
        </div>

        {/* Severity by Vehicle Type Ring Gauge */}
        <div className="glass-panel p-8 rounded-3xl bg-[#0d2238]/60 border border-outline-variant/30 flex flex-col justify-between">
          <h4 className="text-lg font-bold text-primary mb-6">Offense by Vehicle Size</h4>
          <div className="flex flex-col items-center gap-8">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-[#051424]" cx="80" cy="80" fill="transparent" r="68" stroke="currentColor" strokeWidth="10"></circle>
                <circle 
                  className="text-primary animate-draw-ring" 
                  cx="80" 
                  cy="80" 
                  fill="transparent" 
                  r="68" 
                  stroke="currentColor" 
                  strokeDasharray="427" 
                  strokeDashoffset="140" 
                  strokeLinecap="round" 
                  strokeWidth="10"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-primary">68%</span>
                <span className="text-[9px] font-bold text-[#8eb0d4] tracking-wider">COMMERCIAL / SUV</span>
              </div>
            </div>

            <div className="w-full space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-[#8eb0d4] font-medium">Hatchbacks & Sedans</span>
                  <span className="font-mono text-primary font-bold">22%</span>
                </div>
                <div className="w-full h-1.5 bg-[#051424] rounded-full overflow-hidden">
                  <div className="bg-secondary h-full w-[22%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-[#8eb0d4] font-medium">Two-Wheelers</span>
                  <span className="font-mono text-primary font-bold">10%</span>
                </div>
                <div className="w-full h-1.5 bg-[#051424] rounded-full overflow-hidden">
                  <div className="bg-secondary h-full w-[10%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Violation Peaks & Top Hotspots Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Hourly Parking Violations Peak */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl bg-[#0d2238]/60 border border-outline-variant/30">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-bold text-primary">Hourly Parking Violations cycle</h4>
              <p className="text-xs text-[#8eb0d4] mt-1">Average hourly violations frequency (24h clock)</p>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-2.5 h-60 items-end px-2 border-b border-outline-variant/30 pb-2">
            {[15, 10, 8, 12, 35, 65, 85, 95, 92, 75, 78, 82].map((val, idx) => {
              const isPeak = val >= 85;
              const hours = ['06AM', '08AM', '10AM', '12PM', '02PM', '04PM', '06PM', '08PM', '10PM', '12AM', '02AM', '04AM'];
              return (
                <div 
                  key={idx} 
                  className={`group relative rounded-t-sm transition-all duration-300 cursor-pointer ${
                    isPeak ? 'bg-error/80 hover:bg-error' : 'bg-primary/50 hover:bg-primary/80'
                  }`}
                  style={{ height: `${val}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-[10px] text-white px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg border border-outline-variant/30 z-10">
                    {hours[idx]}: {val} reports
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 px-1 text-[9px] text-[#8eb0d4]/60 font-mono">
            <span>06:00 AM</span>
            <span>04:00 PM</span>
            <span>04:00 AM</span>
          </div>
        </div>

        {/* Top 10 Critical Hotspots ranked list */}
        <div className="glass-panel p-8 rounded-3xl bg-[#0d2238]/60 border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold text-primary mb-4">Ranked Core Hotspots</h4>
            <p className="text-xs text-[#8eb0d4] mb-6">Priority zones ranked by congestion delay index</p>
            
            <div className="space-y-4">
              {topHotspots.map((hotspot) => (
                <div key={hotspot.rank} className="flex items-center justify-between p-3 rounded-xl bg-[#051424]/40 border border-outline-variant/10">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-primary-container text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {hotspot.rank}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white truncate max-w-[120px]">{hotspot.name}</h5>
                      <p className="text-[9px] text-[#8eb0d4]/60">{hotspot.jurisdiction}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold text-white ${
                    hotspot.status === 'Critical' ? 'bg-error' : hotspot.status === 'High' ? 'bg-warning text-black' : 'bg-secondary'
                  }`}>
                    {hotspot.score} idx
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Export Action Bar */}
      <div className="flex justify-center w-full pt-6">
        <div className="flex flex-wrap items-center justify-center gap-2 p-2 glass-panel rounded-full shadow-2xl border border-primary/20 bg-[#0d2238]/95">
          <button 
            onClick={() => alert('PDF Export complete. File downloaded.')}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-bold text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Export Analytics PDF</span>
          </button>
          <button 
            onClick={() => alert('CSV Export complete. File downloaded.')}
            className="flex items-center gap-2 px-6 py-3 bg-surface-container-high text-primary rounded-full font-bold text-sm hover:bg-surface-container-highest active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <div className="w-px h-8 bg-outline-variant mx-2"></div>
          <button 
            onClick={() => alert('Shareable link copied to clipboard.')}
            className="p-3 rounded-full hover:bg-surface-container-high transition-colors text-primary cursor-pointer"
          >
            <Share2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
