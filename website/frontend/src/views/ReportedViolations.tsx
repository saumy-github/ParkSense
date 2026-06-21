import { useEffect, useState } from 'react';
import { Search, Filter, MapPin, Eye, AlertTriangle, CheckCircle, X, Loader } from 'lucide-react';

interface CitizenViolation {
  id: string;
  reporterName: string;
  vehicleNo: string;
  violationType: string;
  location: string;
  timestamp: string;
  status: 'Pending Review' | 'Dispatched' | 'Challan Issued' | 'Dismissed';
  evidenceImg: string;
  spi: string;
  ewr: string;
  notes: string;
}

interface ReportedViolationsProps {
  customReportCount?: number;
  showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function ReportedViolations({ customReportCount = 0, showToast }: ReportedViolationsProps) {
  useEffect(() => {
    // Maintain operator dark theme
    document.documentElement.classList.remove('light');
  }, []);

  const [violations, setViolations] = useState<CitizenViolation[]>([
    {
      id: 'CIT-1025',
      reporterName: 'Ananth Kumar (Citizen)',
      vehicleNo: 'MH-14-DN-8982',
      violationType: 'Double Parking',
      location: 'Prabhat Corner, Deccan',
      timestamp: 'Just Now',
      status: 'Pending Review',
      evidenceImg: '/infraction_6.png',
      spi: '62.3%',
      ewr: '36.4%',
      notes: 'White luxury sedan (MH-14-DN-8982) parked on active roadway, blocking storefront access near Golden Punjab.'
    },
    {
      id: 'DET-1021',
      reporterName: 'CAM-12 (Shivajinagar)',
      vehicleNo: 'KA-03-MM-1234',
      violationType: 'Double Parking',
      location: 'Shivajinagar PS Junction, Bengaluru',
      timestamp: '15m ago',
      status: 'Pending Review',
      evidenceImg: '/infraction_1.png',
      spi: '64.5%',
      ewr: '36.0%',
      notes: 'Silver luxury sedan detected parked parallel to another vehicle, obstructing the left transit lane completely.'
    },
    {
      id: 'DET-1019',
      reporterName: 'CAM-08 (Malleshwaram)',
      vehicleNo: 'KA-04-DE-4321',
      violationType: 'Bus Lane Obstruction',
      location: '80 Feet Ring Road, Malleshwaram',
      timestamp: '45m ago',
      status: 'Dispatched',
      evidenceImg: '/infraction_2.png',
      spi: '48.0%',
      ewr: '45.0%',
      notes: 'Heavy tanker truck detected stationary inside the active bus lane, causing bus delays.'
    },
    {
      id: 'DET-1015',
      reporterName: 'CAM-15 (Commercial Street)',
      vehicleNo: 'KA-01-AB-5678',
      violationType: 'Double Parking',
      location: 'Commercial Street Entrance',
      timestamp: '2h ago',
      status: 'Challan Issued',
      evidenceImg: '/infraction_3.png',
      spi: '78.2%',
      ewr: '40.0%',
      notes: 'Hatchback detected double-parking on active carriageway, blocking commercial area traffic flow.'
    },
    {
      id: 'DET-1008',
      reporterName: 'CAM-03 (Outer Ring Road)',
      vehicleNo: 'KA-51-JK-7890',
      violationType: 'No Parking Zone',
      location: 'Modi Bridge Area, Bengaluru',
      timestamp: '3h ago',
      status: 'Pending Review',
      evidenceImg: '/infraction_4.png',
      spi: '88.0%',
      ewr: '55.0%',
      notes: 'Flatbed trailer transporting heavy metal coils parked illegally on the roadside lane.'
    },
    {
      id: 'DET-1002',
      reporterName: 'CAM-22 (NH-48 Highway)',
      vehicleNo: 'KA-02-XY-9876',
      violationType: 'No Parking Zone',
      location: 'NH-48 Highway Shoulder',
      timestamp: '4h ago',
      status: 'Dismissed',
      evidenceImg: '/infraction_5.jpg',
      spi: '22.0%',
      ewr: '10.0%',
      notes: 'Chemical tanker parked on high-speed highway shoulder, causing severe line-of-sight risk.'
    }
  ]);

  const [selectedViolation, setSelectedViolation] = useState<CitizenViolation | null>(null);
  const [activeTab, setActiveTab] = useState<'ai' | 'citizen'>('ai');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  // Prepend citizen submitted reports
  useEffect(() => {
    if (customReportCount > 0) {
      // Avoid duplicate keys
      const newId = `CIT-${1021 + customReportCount}`;
      setViolations(prev => {
        if (prev.some(v => v.id === newId)) return prev;
        
        const newReport: CitizenViolation = {
          id: newId,
          reporterName: 'Citizen Mobile Console',
          vehicleNo: 'KA-03-MM-1234',
          violationType: 'Double Parking',
          location: 'Shivajinagar PS Junction, Bengaluru',
          timestamp: 'Just Now',
          status: 'Pending Review',
          evidenceImg: '/infraction_1.png',
          spi: '64.5%',
          ewr: '36.0%',
          notes: 'Citizen submitted report of Double Parking via mobile console.'
        };
        
        return [newReport, ...prev];
      });
    }
  }, [customReportCount]);

  const updateStatus = (id: string, newStatus: 'Pending Review' | 'Dispatched' | 'Challan Issued' | 'Dismissed') => {
    setViolations(prev =>
      prev.map(v => (v.id === id ? { ...v, status: newStatus } : v))
    );
    if (selectedViolation && selectedViolation.id === id) {
      setSelectedViolation(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleDispatch = (violation: CitizenViolation) => {
    showToast?.(`Patrol Unit dispatched to ${violation.location}. Status updated.`, 'success');
    updateStatus(violation.id, 'Dispatched');
  };

  const handleIssueChallan = (violation: CitizenViolation) => {
    showToast?.(`E-Challan generated for vehicle ${violation.vehicleNo}. NIC database synced.`, 'success');
    updateStatus(violation.id, 'Challan Issued');
  };

  const handleDismiss = (violation: CitizenViolation) => {
    showToast?.(`Incident report ${violation.id} dismissed.`, 'info');
    updateStatus(violation.id, 'Dismissed');
  };

  // Filtered list
  const filteredViolations = violations.filter(v => {
    const isAiRecord = v.id.startsWith('DET-');
    const matchesTab = activeTab === 'ai' ? isAiRecord : !isAiRecord;

    const matchesSearch =
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.reporterName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    const matchesType = typeFilter === 'All' || v.violationType === typeFilter;

    return matchesTab && matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-full bg-[#051424] text-[#d4e4fa] px-6 py-8 max-w-7xl mx-auto w-full transition-all duration-300 relative flex flex-col space-y-6">
      
      {/* Header and Statistics */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">AI Infraction Detection Portal</h2>
          <p className="text-[#8eb0d4] text-sm mt-1">Review and process parking violations automatically detected by ASTraM AI models.</p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-3 flex-wrap">
          <div className="glass-panel px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-[#0d2238]/40 text-center">
            <p className="text-[10px] text-[#8eb0d4] uppercase font-bold tracking-wider">Awaiting Review</p>
            <h4 className="text-xl font-bold text-error mt-0.5">
              {violations.filter(v => v.status === 'Pending Review').length}
            </h4>
          </div>
          <div className="glass-panel px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-[#0d2238]/40 text-center">
            <p className="text-[10px] text-[#8eb0d4] uppercase font-bold tracking-wider">Dispatched</p>
            <h4 className="text-xl font-bold text-secondary mt-0.5">
              {violations.filter(v => v.status === 'Dispatched').length}
            </h4>
          </div>
          <div className="glass-panel px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-[#0d2238]/40 text-center">
            <p className="text-[10px] text-[#8eb0d4] uppercase font-bold tracking-wider">Challans Issued</p>
            <h4 className="text-xl font-bold text-primary mt-0.5">
              {violations.filter(v => v.status === 'Challan Issued').length}
            </h4>
          </div>
        </div>
      </section>

      {/* Tab Selectors */}
      <div className="flex gap-4 border-b border-outline-variant/20 pb-1">
        <button
          onClick={() => {
            setActiveTab('ai');
            setSelectedViolation(null);
          }}
          className={`pb-2 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'ai' ? 'border-primary text-primary' : 'border-transparent text-[#8eb0d4] hover:text-white'
          }`}
        >
          AI Model Detected Detections ({violations.filter(v => v.id.startsWith('DET-')).length})
        </button>
        <button
          onClick={() => {
            setActiveTab('citizen');
            setSelectedViolation(null);
          }}
          className={`pb-2 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'citizen' ? 'border-primary text-primary' : 'border-transparent text-[#8eb0d4] hover:text-white'
          }`}
        >
          Citizen Reported Infractions ({violations.filter(v => !v.id.startsWith('DET-')).length})
        </button>
      </div>

      {/* Filter and Search Panel */}
      <section className="glass-panel p-4 rounded-2xl border border-outline-variant/30 bg-[#0d2238]/30 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4.5 h-4.5 text-[#8eb0d4]/60 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Plate, ID, Source..."
            className="w-full bg-[#051424] border border-outline-variant/30 focus:border-primary/50 focus:outline-none rounded-xl py-2 pl-10 pr-4 text-xs placeholder:text-on-surface-variant/60 font-semibold"
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto items-center justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#8eb0d4]/60" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#051424] border border-outline-variant/30 focus:outline-none rounded-xl py-2 px-3 text-xs font-semibold text-on-surface"
            >
              <option value="All">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Challan Issued">Challan Issued</option>
              <option value="Dismissed">Dismissed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#051424] border border-outline-variant/30 focus:outline-none rounded-xl py-2 px-3 text-xs font-semibold text-on-surface"
            >
              <option value="All">All Violations</option>
              <option value="Double Parking">Double Parking</option>
              <option value="Sidewalk Parking">Sidewalk Parking</option>
              <option value="Bus Lane Obstruction">Bus Lane Obstruction</option>
              <option value="No Parking Zone">No Parking Zone</option>
            </select>
          </div>
          
          <button 
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('All');
              setTypeFilter('All');
            }}
            className="text-[10px] uppercase font-bold text-primary tracking-wider hover:underline"
          >
            Clear Filters
          </button>
        </div>
      </section>

      {/* Main Grid: Table & Info panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Table View */}
        <section className="glass-panel rounded-3xl overflow-hidden border border-outline-variant/20 bg-[#0d2238]/30 transition-all duration-300 lg:col-span-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-[#0d2238]/60 text-[#8eb0d4] uppercase text-[10px] font-bold tracking-wider">
                  <th className="p-4 pl-6">Detection ID</th>
                  <th className="p-4">Detection Source</th>
                  <th className="p-4 font-mono">Vehicle No</th>
                  <th className="p-4">Violation</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 text-xs">
                {filteredViolations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[#8eb0d4]/60">
                      No matching citizen infraction records found.
                    </td>
                  </tr>
                ) : (
                  filteredViolations.map((violation) => {
                    const isSelected = selectedViolation?.id === violation.id;
                    
                    let statusColor = 'text-error bg-error/10 border-error/20';
                    if (violation.status === 'Dispatched') statusColor = 'text-secondary bg-secondary/10 border-secondary/20';
                    else if (violation.status === 'Challan Issued') statusColor = 'text-primary bg-primary/10 border-primary/20';
                    else if (violation.status === 'Dismissed') statusColor = 'text-[#8eb0d4]/40 bg-surface-container-low border-outline-variant/25';

                    return (
                      <tr
                        key={violation.id}
                        className={`hover:bg-[#0d2238]/40 transition-colors cursor-pointer group ${
                          isSelected ? 'bg-[#0d2238]/80' : ''
                        }`}
                        onClick={() => setSelectedViolation(violation)}
                      >
                        <td className="p-4 pl-6 font-bold text-white group-hover:text-primary transition-colors whitespace-nowrap">
                          #{violation.id}
                        </td>
                        <td className="p-4 text-[#d4e4fa] font-medium whitespace-nowrap truncate max-w-[120px]" title={violation.reporterName}>
                          {violation.reporterName}
                        </td>
                        <td className="p-4 font-mono font-bold text-secondary uppercase whitespace-nowrap">
                          {violation.vehicleNo}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="font-semibold text-white">{violation.violationType}</span>
                        </td>
                        <td className="p-4 max-w-[200px] truncate text-[#8eb0d4] whitespace-nowrap" title={violation.location}>
                          {violation.location}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold ${statusColor}`}>
                            {violation.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setSelectedViolation(violation)}
                              className="p-1.5 hover:bg-[#0d2238] rounded-lg text-primary transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {violation.status === 'Pending Review' && (
                              <>
                                <button
                                  onClick={() => handleDispatch(violation)}
                                  className="p-1.5 hover:bg-[#0d2238] rounded-lg text-secondary transition-colors"
                                  title="Dispatch Patrol"
                                >
                                  <span className="material-symbols-outlined text-[18px]">local_police</span>
                                </button>
                                <button
                                  onClick={() => handleIssueChallan(violation)}
                                  className="p-1.5 hover:bg-[#0d2238] rounded-lg text-green-400 transition-colors"
                                  title="Issue E-Challan"
                                >
                                  <span className="material-symbols-outlined text-[18px]">gavel</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Details Popup Modal */}
        {selectedViolation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in" onClick={() => setSelectedViolation(null)}>
            <section 
              className="w-full max-w-2xl bg-[#0d2238]/95 border border-outline-variant/40 rounded-3xl p-6 md:p-8 flex flex-col space-y-6 shadow-2xl relative overflow-hidden glass-panel"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20">
                <div>
                  <span className="font-mono text-[9px] tracking-widest text-[#8eb0d4] uppercase">AI Detection File</span>
                  <h3 className="text-lg font-bold text-white">Detection #{selectedViolation.id}</h3>
                </div>
                <button 
                  onClick={() => setSelectedViolation(null)}
                  className="p-1.5 hover:bg-[#051424] rounded-full text-on-surface-variant hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content Grid */}
              <div className="grid md:grid-cols-2 gap-6 items-start">
                {/* Left Side: Photo Evidence */}
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden border border-outline-variant/40 bg-black relative h-44 md:h-52">
                    <img
                      src={selectedViolation.evidenceImg}
                      alt="Evidence Infraction"
                      className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#0d2238]/80 backdrop-blur-md px-2 py-0.5 rounded border border-primary/20 text-[9px] font-bold text-primary">
                      Curb Encroachment Scan
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#051424]/40 p-3 rounded-xl border border-outline-variant/10 text-center">
                      <span className="text-[9px] text-[#8eb0d4] uppercase tracking-wider block">Space Pressure</span>
                      <span className="text-xs font-bold text-white font-mono mt-0.5 block">{selectedViolation.spi}</span>
                    </div>
                    <div className="bg-[#051424]/40 p-3 rounded-xl border border-outline-variant/10 text-center">
                      <span className="text-[9px] text-[#8eb0d4] uppercase tracking-wider block">Width Reduction</span>
                      <span className="text-xs font-bold text-white font-mono mt-0.5 block">{selectedViolation.ewr}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Incident Specifications & Description */}
                <div className="space-y-4 text-xs">
                  <div className="space-y-2 bg-[#051424]/20 p-4 rounded-xl border border-outline-variant/15">
                    <div className="flex justify-between items-center">
                      <span className="text-[#8eb0d4] font-medium">Source:</span>
                      <span className="text-white font-bold">{selectedViolation.reporterName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8eb0d4] font-medium">Plate Number:</span>
                      <span className="text-secondary font-mono font-bold uppercase">{selectedViolation.vehicleNo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8eb0d4] font-medium">Type:</span>
                      <span className="text-white font-bold">{selectedViolation.violationType}</span>
                    </div>
                    <div className="flex justify-between items-start gap-3">
                      <span className="text-[#8eb0d4] font-medium shrink-0">Location:</span>
                      <span className="text-white font-bold text-right flex items-center gap-1 leading-snug">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        {selectedViolation.location}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8eb0d4] font-medium">Time Logged:</span>
                      <span className="text-[#8eb0d4] font-mono">{selectedViolation.timestamp}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-[#8eb0d4] uppercase font-bold tracking-wider">System AI Diagnostics</span>
                    <p className="p-3 bg-[#051424]/40 rounded-xl border border-outline-variant/10 text-on-surface-variant leading-relaxed text-[11px] max-h-24 overflow-y-auto">
                      {selectedViolation.notes}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
                {selectedViolation.status === 'Pending Review' ? (
                  <>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDispatch(selectedViolation)}
                        className="flex-1 py-2.5 bg-primary text-on-primary hover:brightness-110 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">local_police</span>
                        Dispatch Patrol
                      </button>
                      <button
                        onClick={() => handleIssueChallan(selectedViolation)}
                        className="flex-1 py-2.5 bg-secondary text-on-secondary hover:brightness-110 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">gavel</span>
                        Issue Challan
                      </button>
                    </div>
                    <button
                      onClick={() => handleDismiss(selectedViolation)}
                      className="w-full py-2 bg-error-container/20 text-error hover:bg-error-container/40 rounded-xl font-bold text-xs active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
                    >
                      Dismiss False Alarm
                    </button>
                  </>
                ) : (
                  <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 text-center flex items-center justify-center gap-2">
                    {selectedViolation.status === 'Challan Issued' ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                        <span className="font-bold text-xs text-primary uppercase">E-Challan Active (Synced with RTO)</span>
                      </>
                    ) : selectedViolation.status === 'Dispatched' ? (
                      <>
                        <Loader className="w-4 h-4 text-secondary shrink-0 animate-spin" />
                        <span className="font-bold text-xs text-secondary uppercase">Patrol Unit En Route (ETA 4m)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-on-surface-variant/40 shrink-0" />
                        <span className="font-bold text-xs text-on-surface-variant/50 uppercase">Report Dismissed</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
