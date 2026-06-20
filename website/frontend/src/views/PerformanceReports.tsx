import { useEffect } from 'react';

export default function PerformanceReports() {
  useEffect(() => {
    document.documentElement.classList.remove('light');
  }, []);

  return (
    <div className="min-h-full bg-background text-on-surface px-6 py-8 max-w-7xl mx-auto space-y-10 w-full relative">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">Performance Reports</h2>
          <p className="text-on-surface-variant text-sm mt-1">Real-time infrastructure ROI and efficiency metrics across all sectors.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-lg border border-outline-variant">
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            <span className="text-xs font-mono">Last 30 Days</span>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-lg border border-outline-variant">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            <span className="text-xs font-mono">Facility Type</span>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-lg border border-outline-variant">
            <span className="material-symbols-outlined text-sm">public</span>
            <span className="text-xs font-mono">Global Comparison</span>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-primary/45 transition-all duration-300">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">AVERAGE REVENUE PER USER</p>
            <h3 className="text-4xl font-bold text-primary">$42.80</h3>
          </div>
          <div className="flex items-center gap-2 mt-4 text-primary">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span className="text-xs font-bold">+12.4% from last period</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-primary/45 transition-all duration-300">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">CUSTOMER LIFETIME VALUE</p>
            <h3 className="text-4xl font-bold text-primary">$1,240</h3>
          </div>
          <div className="flex items-center gap-2 mt-4 text-primary">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span className="text-xs font-bold">+8.1% projected</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-error/45 transition-all duration-300">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">CHURN RATE</p>
            <h3 className="text-4xl font-bold text-error">2.1%</h3>
          </div>
          <div className="flex items-center gap-2 mt-4 text-error">
            <span className="material-symbols-outlined text-sm">trending_down</span>
            <span className="text-xs font-bold">-0.5% optimization win</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-secondary/45 transition-all duration-300">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">EFFICIENCY GAIN</p>
            <h3 className="text-4xl font-bold text-secondary">34.2%</h3>
          </div>
          <div className="flex items-center gap-2 mt-4 text-secondary">
            <span className="material-symbols-outlined text-sm">bolt</span>
            <span className="text-xs font-bold">AI Autopilot enabled</span>
          </div>
        </div>
      </section>

      {/* Charts & Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Line Chart */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-bold text-primary">Revenue Growth Forecast</h4>
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Multi-layered ecosystem revenue analysis</p>
            </div>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_#00f0ff]"></span>
              <span className="w-3 h-3 rounded-full bg-secondary shadow-[0_0_8px_#c0c1ff]"></span>
            </div>
          </div>
          
          <div className="h-72 w-full relative flex items-end justify-between border-l border-b border-outline-variant/30 pb-2 px-2">
            {/* SVG Forecast Line */}
            <div className="absolute inset-0 top-12 opacity-15 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
                <path 
                  d="M0,320 L100,280 L200,300 L300,200 L400,240 L500,160 L600,120 L700,140 L800,80 L900,60 L1000,40 V400 H0 Z" 
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
                  d="M0,320 L100,280 L200,300 L300,200 L400,240 L500,160 L600,120 L700,140 L800,80 L900,60 L1000,40" 
                  fill="none" 
                  stroke="#00f0ff" 
                  strokeWidth="4" 
                  className="line-draw"
                />
              </svg>
            </div>

            <span className="text-[10px] text-on-surface-variant font-mono">MAY</span>
            <span className="text-[10px] text-on-surface-variant font-mono">JUN</span>
            <span className="text-[10px] text-on-surface-variant font-mono">JUL</span>
            <span className="text-[10px] text-on-surface-variant font-mono">AUG</span>
            <span className="text-[10px] text-on-surface-variant font-mono">SEP</span>
            <span className="text-[10px] text-on-surface-variant font-mono">OCT</span>
          </div>
        </div>

        {/* Circular Gauge */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between">
          <h4 className="text-lg font-bold text-primary mb-6">Infrastructure ROI</h4>
          <div className="flex flex-col items-center gap-8">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-surface-container-highest" cx="80" cy="80" fill="transparent" r="68" stroke="currentColor" strokeWidth="10"></circle>
                <circle 
                  className="text-primary" 
                  cx="80" 
                  cy="80" 
                  fill="transparent" 
                  r="68" 
                  stroke="currentColor" 
                  strokeDasharray="427" 
                  strokeDashoffset="107" 
                  strokeLinecap="round" 
                  strokeWidth="10"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-primary">75%</span>
                <span className="text-[9px] font-bold text-on-surface-variant tracking-wider">OPTIMIZED</span>
              </div>
            </div>

            <div className="w-full space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-on-surface-variant font-medium">Fleet Utilization</span>
                  <span className="font-mono text-primary font-bold">88%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="bg-secondary h-full w-[88%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-on-surface-variant font-medium">Sensor Health</span>
                  <span className="font-mono text-primary font-bold">99.4%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[99%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Peak hour bar chart */}
      <section className="glass-panel p-8 rounded-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="text-lg font-bold text-primary">Peak Hour Efficiency</h4>
            <p className="text-xs text-on-surface-variant mt-1">Throughput vs Capacity (24h Cycle)</p>
          </div>
          <button className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
            View Detail <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </button>
        </div>
        <div className="grid grid-cols-12 gap-2.5 h-64 items-end px-4 border-b border-outline-variant/30 pb-2">
          {/* Simulated Bars */}
          {[30, 25, 15, 45, 94, 70, 60, 65, 95, 90, 60, 40].map((h, i) => {
            const isPeak = h >= 85;
            return (
              <div 
                key={i} 
                className={`group relative rounded-t-sm transition-all duration-300 cursor-pointer ${
                  isPeak ? 'bg-primary/80 hover:bg-primary' : 'bg-surface-container-highest hover:bg-secondary/40'
                }`}
                style={{ height: `${h}%` }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-[10px] text-white px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg border border-outline-variant/30 z-10">
                  {isPeak ? 'Peak: ' : ''}{h}%
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Floating Export Action Bar */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 glass-panel rounded-full shadow-2xl border border-primary/20 bg-[#0d2238]/90">
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-bold text-sm hover:brightness-110 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
          <span>Export PDF</span>
        </button>
        <button className="flex items-center gap-2 px-6 py-3 bg-surface-container-high text-primary rounded-full font-bold text-sm hover:bg-surface-container-highest active:scale-95 transition-all">
          <span className="material-symbols-outlined text-sm">csv</span>
          <span>Export CSV</span>
        </button>
        <div className="w-px h-8 bg-outline-variant mx-2"></div>
        <button className="p-3 rounded-full hover:bg-surface-container-high transition-colors text-primary">
          <span className="material-symbols-outlined">share</span>
        </button>
      </div>
    </div>
  );
}
