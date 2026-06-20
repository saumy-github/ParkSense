import { useEffect, useState } from 'react';

interface AlertCard {
  id: string;
  type: 'critical' | 'warning';
  title: string;
  desc: string;
  time: string;
  img: string;
  confidence?: string;
  actions: string[];
}

interface AlertMonitoringProps {
  customReportCount: number;
  showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function AlertMonitoring({ customReportCount, showToast }: AlertMonitoringProps) {
  const [alertList, setAlertList] = useState<AlertCard[]>([
    {
      id: '#8891-A',
      type: 'critical',
      title: 'Double Parking Carriageway Block',
      desc: 'Vehicle KA-03-MM-1234 detected at Shivajinagar Junction. Computer vision confirms 36.0% effective width reduction on primary transit lane.',
      time: '02:14m ago',
      confidence: '98% OCR VERIFIED',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_eTOXNCZpLC7km5ijkeGzTRq0Xn8RSPMiYbDjxo0znZ5TZZxiGpYj4nfSoKuQWrpnlzzEerHMl9kfcA6Z3_qGNR7Ir_81eRJ1kiZSLMzBRmpYWIcUKUrBvzpNfdTW6m5i4qvGwhBNjY4f2eQqMAStbl6c1Yz49YK-3hPwJyi_aMFR7nvkCpfCiGpxnnI1g3YQ30d4TcOtSshHgtNMNFAlO6ntJVl47ml6cS8LJzxTzFNYgbhh2HvcEsci3nCkwcWZ0AodoE6od64N',
      actions: ['Dispatch Patrol', 'Issue Challan']
    },
    {
      id: '#9102-B',
      type: 'warning',
      title: 'Bus Lane Obstruction',
      desc: 'Hatchback KA-04-DE-4321 detected parked in dedicated BRTS corridor. Bus traversal delay is estimated at +11.2 minutes.',
      time: '12:45m ago',
      confidence: '85% CONFIDENCE',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKUUimumdSNERHVhvVMcZPvCrN60OhNU_FFChuYDfHwoHU-ugH7l9QLKq4nOCFMzOqIMEfLHvJzLYJtW84-L07diQ2P3lRAsinr_TzJnL71m5qh_gbWVyhNvPCWZKBTrvRMAsaf-5R-3RNMqNplIhCddnTtRwJed7Awmuu51ba5iFrHXBpOFAGFUA2FaegJJQYxg9HcIzhQfpPLcLEsky3Y2lR1TLuCvfHar3HSLz5jK-7xT9jLejPT_Y8RnzZqtce13pued7TSphC',
      actions: ['Dispatch Patrol', 'Issue Challan']
    }
  ]);

  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [dispatchedIds, setDispatchedIds] = useState<string[]>([]);

  useEffect(() => {
    // Set theme to dark for alerts console
    document.documentElement.classList.remove('light');
  }, []);

  // Prepend citizen submitted reports
  useEffect(() => {
    if (customReportCount > 0) {
      const citizenAlert: AlertCard = {
        id: `#CIT-00${customReportCount}`,
        type: 'critical',
        title: 'Citizen Reported Obstruction',
        desc: 'Citizen submitted photo of Double Parking obstruction at Shivajinagar PS Junction. License plate KA-03-MM-1234.',
        time: 'Just Now',
        confidence: '95% CONFIDENCE',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_eTOXNCZpLC7km5ijkeGzTRq0Xn8RSPMiYbDjxo0znZ5TZZxiGpYj4nfSoKuQWrpnlzzEerHMl9kfcA6Z3_qGNR7Ir_81eRJ1kiZSLMzBRmpYWIcUKUrBvzpNfdTW6m5i4qvGwhBNjY4f2eQqMAStbl6c1Yz49YK-3hPwJyi_aMFR7nvkCpfCiGpxnnI1g3YQ30d4TcOtSshHgtNMNFAlO6ntJVl47ml6cS8LJzxTzFNYgbhh2HvcEsci3nCkwcWZ0AodoE6od64N',
        actions: ['Dispatch Patrol', 'Issue Challan']
      };

      setAlertList(prev => {
        // Prevent duplicate pushes for same report index
        if (prev.some(a => a.id === citizenAlert.id)) return prev;
        return [citizenAlert, ...prev];
      });
    }
  }, [customReportCount]);

  const handleDispatch = (id: string) => {
    showToast?.(`Patrol Unit dispatched to verify ${id}. ETA: 4 minutes.`, 'success');
    setDispatchedIds(prev => [...prev, id]);
  };

  const handleIssueChallan = (id: string) => {
    showToast?.(`E-Challan generated for ${id}. RTO database synced.`, 'success');
    setResolvedIds(prev => [...prev, id]);
  };

  const visibleAlerts = alertList.filter(alert => !resolvedIds.includes(alert.id));

  return (
    <div className="min-h-full bg-[#051424] text-[#d4e4fa] px-6 py-8 max-w-7xl mx-auto transition-all duration-300 w-full">
      {/* System Health Bar */}
      <section className="mb-10">
        <div className="glass-panel p-5 rounded-2xl flex flex-wrap items-center justify-between gap-6 border border-outline-variant/20 bg-[#0d2238]/60">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8eb0d4]">Enforcement Status</span>
              <span className="text-primary font-bold flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-primary status-glow animate-pulse"></span>
                Operational
              </span>
            </div>
            
            <div className="h-8 w-px bg-outline-variant/30 hidden md:block"></div>
            
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8eb0d4]">AI Engine Load</span>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-24 h-1.5 bg-[#051424] rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[42%]"></div>
                </div>
                <span className="text-xs font-mono font-bold">42%</span>
              </div>
            </div>
            
            <div className="h-8 w-px bg-outline-variant/30 hidden md:block"></div>
            
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8eb0d4]">Active Patrols</span>
              <span className="font-bold mt-1 text-secondary">14/20 Units</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#8eb0d4]/60 font-mono">Last Update: Just Now</span>
            <button 
              onClick={() => {
                setResolvedIds([]);
                setDispatchedIds([]);
              }}
              className="text-xs bg-[#0d2238] px-4 py-1.5 rounded-lg text-primary hover:bg-primary/10 font-bold border border-primary/20 transition-all active:scale-95"
            >
              RESET QUEUE
            </button>
          </div>
        </div>
      </section>

      {/* Grid Feed Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Side: Alerts list */}
        <div className="xl:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary tracking-tight">Active Infraction Queue</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-error-container text-on-error-container text-[10px] font-bold border border-error/20">
                {visibleAlerts.filter(a => a.type === 'critical').length} CRITICAL
              </span>
              <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-bold border border-outline-variant/20">
                {visibleAlerts.length} PENDING
              </span>
            </div>
          </div>

          {visibleAlerts.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-outline-variant/20 bg-[#0d2238]/30 flex flex-col items-center justify-center space-y-4">
              <span className="material-symbols-outlined text-secondary text-5xl">verified_user</span>
              <h3 className="text-lg font-bold text-white">All Clear</h3>
              <p className="text-sm text-[#8eb0d4] max-w-sm">No unresolved parking violations detected on-street. Monitor stream logs for updates.</p>
            </div>
          ) : (
            visibleAlerts.map((alert) => {
              const isCritical = alert.type === 'critical';
              const isDispatched = dispatchedIds.includes(alert.id);
              
              return (
                <article 
                  key={alert.id} 
                  className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 hover:translate-x-1 border border-outline-variant/20 bg-[#0d2238]/40 ${
                    isCritical ? 'shadow-[0_0_20px_rgba(239,68,68,0.1)] border-l-2 border-l-error' : ''
                  }`}
                >
                  <div className="p-6 flex flex-col md:flex-row gap-6">
                    {/* Camera Bounding Box Thumbnail */}
                    <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0 border border-outline-variant/30 bg-black">
                      <img alt={alert.title} className="w-full h-full object-cover opacity-80" src={alert.img} />
                      <div className="absolute inset-0 bg-error/10 mix-blend-overlay"></div>
                      <div className="absolute top-2 left-2 bg-error text-on-error text-[9px] font-black px-2 py-0.5 rounded">
                        {alert.confidence}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`font-mono text-[10px] tracking-widest uppercase font-bold ${isCritical ? 'text-error' : 'text-secondary'}`}>
                            Violation {alert.id}
                          </span>
                          <h3 className="text-lg font-bold text-white hover:text-primary transition-colors mt-0.5">{alert.title}</h3>
                        </div>
                        <span className="text-[10px] text-[#8eb0d4]/60 font-mono">{alert.time}</span>
                      </div>
                      
                      <p className="text-sm text-[#8eb0d4] mb-5 leading-relaxed">{alert.desc}</p>
                      
                      <div className="flex flex-wrap gap-2.5">
                        <button 
                          disabled={isDispatched}
                          onClick={() => handleDispatch(alert.id)}
                          className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all ${
                            isDispatched 
                              ? 'bg-[#051424] text-[#8eb0d4]/40 border border-[#8eb0d4]/10 cursor-not-allowed'
                              : 'bg-primary text-on-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">local_police</span>
                          {isDispatched ? 'Patrol Dispatched' : 'Dispatch Unit'}
                        </button>
                        
                        <button 
                          onClick={() => handleIssueChallan(alert.id)}
                          className="px-4 py-2 bg-secondary text-on-secondary hover:bg-secondary/90 text-on-surface rounded-lg font-bold text-xs hover:bg-surface-variant active:scale-95 transition-all"
                        >
                          Issue E-Challan
                        </button>
                        
                        <button 
                          onClick={() => handleIssueChallan(alert.id)}
                          className="p-2 glass-panel border border-outline-variant text-[#d4e4fa] rounded-lg hover:text-primary active:scale-95 transition-all flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-primary/70 bg-[#0d2238]/60 border border-outline-variant/10">
              <div className="flex justify-between mb-2">
                <span className="text-[9px] font-bold text-primary uppercase tracking-wider">CCTV Node Status</span>
                <span className="text-[10px] text-[#8eb0d4]/60 font-mono">45m ago</span>
              </div>
              <h4 className="font-bold text-sm text-white">Camera Node CAM-12 Offline</h4>
              <p className="text-xs text-[#8eb0d4] mt-1.5 leading-relaxed">Optical stream at Shivajinagar Junction reported frame drop. Initiating diagnostic auto-reboot sequence.</p>
            </div>
            
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-outline/70 bg-[#0d2238]/60 border border-outline-variant/10">
              <div className="flex justify-between mb-2">
                <span className="text-[9px] font-bold text-outline uppercase tracking-wider">System Log</span>
                <span className="text-[10px] text-[#8eb0d4]/60 font-mono">1h ago</span>
              </div>
              <h4 className="font-bold text-sm text-white">RTO DB Sync Successful</h4>
              <p className="text-xs text-[#8eb0d4] mt-1.5 leading-relaxed">National vehicle registration database synchronized. ANPR license plate lookups operational.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Stream logs */}
        <div className="xl:col-span-4 space-y-6">
          <div className="glass-panel rounded-3xl overflow-hidden border border-outline-variant/20 bg-[#0d2238]/60 flex flex-col h-[520px]">
            <div className="p-4 border-b border-outline-variant/30 bg-[#0d2238] flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Live Activity Stream</h3>
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-1 p-4 space-y-4 hide-scrollbar">
              <div className="flex gap-4 pl-3 pb-4 border-b border-outline-variant/10">
                <span className="material-symbols-outlined text-primary text-xl shrink-0">psychology</span>
                <div>
                  <p className="text-xs font-semibold text-white">AI analysis complete for Sector 4</p>
                  <p className="text-[11px] text-[#8eb0d4] mt-0.5">12 vehicles scanned, 0 infractions detected.</p>
                  <p className="text-[9px] text-[#8eb0d4]/40 mt-1 font-mono">14:55:02</p>
                </div>
              </div>

              {dispatchedIds.length > 0 && (
                <div className="flex gap-4 pl-3 pb-4 border-b border-outline-variant/10">
                  <span className="material-symbols-outlined text-secondary text-xl shrink-0">local_police</span>
                  <div>
                    <p className="text-xs font-semibold text-white">Patrol Unit Dispatched</p>
                    <p className="text-[11px] text-[#8eb0d4] mt-0.5">Patrol dispatched to incident: {dispatchedIds[dispatchedIds.length - 1]}</p>
                    <p className="text-[9px] text-[#8eb0d4]/40 mt-1 font-mono">Just Now</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pl-3 pb-4 border-b border-outline-variant/10">
                <span className="material-symbols-outlined text-secondary text-xl shrink-0">local_police</span>
                <div>
                  <p className="text-xs font-semibold text-white">Unit 412 dispatched</p>
                  <p className="text-[11px] text-[#8eb0d4] mt-0.5">En-route to obstruction violation (Zone 1-A).</p>
                  <p className="text-[9px] text-[#8eb0d4]/40 mt-1 font-mono">14:52:11</p>
                </div>
              </div>

              <div className="flex gap-4 pl-3 pb-4 border-b border-outline-variant/10">
                <span className="material-symbols-outlined text-error text-xl shrink-0">sensors_off</span>
                <div>
                  <p className="text-xs font-semibold text-white">Optical feed interference</p>
                  <p className="text-[11px] text-[#8eb0d4] mt-0.5">Heavy occlusion reported at Malleshwaram CAM-03.</p>
                  <p className="text-[9px] text-[#8eb0d4]/40 mt-1 font-mono">14:48:33</p>
                </div>
              </div>
            </div>
            
            <button className="p-4 text-xs font-bold text-center text-[#8eb0d4] hover:text-primary bg-[#0d2238]/60 hover:bg-[#0d2238] transition-colors border-t border-outline-variant/20 active:scale-[0.99]">
              VIEW ALL HISTORY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
