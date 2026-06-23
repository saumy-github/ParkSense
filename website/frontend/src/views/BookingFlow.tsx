import { useState } from 'react';
import { Camera, MapPin, Navigation, Loader, ShieldCheck } from 'lucide-react';

interface BookingFlowProps {
  onReportSubmit?: () => void;
  showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function BookingFlow({ onReportSubmit, showToast }: BookingFlowProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedJunction, setSelectedJunction] = useState<string>('Shivajinagar - Tasker Town Hub');
  const [violationType, setViolationType] = useState<string>('Double Parking');
  const [vehicleNo, setVehicleNo] = useState<string>('KA-03-MM-1234');
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(null);
  
  // Geolocation states
  const [locationAddress, setLocationAddress] = useState<string>('Shivajinagar PS Junction, Bengaluru');
  const [locLoading, setLocLoading] = useState<boolean>(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToast?.('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setLocLoading(true);
    showToast?.('Retrieving device coordinates...', 'info');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocLoading(false);
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setLocationAddress(`My Location (Lat: ${lat}, Lng: ${lng})`);
        showToast?.('GPS Coordinates focused successfully!', 'success');
      },
      (error) => {
        setLocLoading(false);
        console.error(error);
        
        let errorMsg = 'Failed to fetch location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied. Please enter address manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'GPS signal unavailable. Please type location.';
        }
        
        showToast?.(errorMsg, 'warning');
      },
      { timeout: 8000 }
    );
  };

  const handleScanPhoto = () => {
    setLoadingAI(true);
    // Use the 6th infraction Mercedes (citizen report) as demonstration evidence photo
    setEvidencePhoto('/infraction_6.png');
    
    setTimeout(() => {
      setLoadingAI(false);
      showToast?.('AI Verification complete. License plate recognized.', 'success');
      setStep(3);
    }, 1500);
  };

  const handleSubmitReport = () => {
    if (onReportSubmit) {
      onReportSubmit();
    }
    setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    setEvidencePhoto(null);
    setVehicleNo('KA-03-MM-1234');
    setLocationAddress('Shivajinagar PS Junction, Bengaluru');
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex items-start justify-center p-4 md:p-6 lg:p-12 pt-24 md:pt-28 pb-12 md:pb-20 transition-all duration-300">
      
      {/* Frame Container */}
      <div className="w-full max-w-5xl md:glass-panel md:rounded-3xl md:border md:border-[#3e3b54]/50 overflow-hidden flex flex-col md:shadow-2xl min-h-fit md:min-h-[550px] bg-[#0c0a15]/50 md:bg-[#0c0a15]/85 md:backdrop-blur-md">
        {/* Browser Top bar mock */}
        <div className="hidden md:flex bg-[#07060c]/90 px-6 py-3 items-center gap-3 border-b border-[#3e3b54]/40">
          <div className="flex gap-1.5 shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
          </div>
          <div className="bg-[#131221]/80 rounded-md px-4 py-1 text-[11px] text-gray-400 flex-grow max-w-md mx-auto border border-[#3e3b54]/30 flex items-center justify-center gap-1 font-mono">
            <span className="material-symbols-outlined text-[12px] text-[#a6c8ff]">lock</span>
            <span className="text-[#a6c8ff]">citizen.astram-parkinsight.gov.in/report</span>
          </div>
        </div>

        {/* Content Area: Split View */}
        <div className="flex flex-col lg:flex-row flex-grow md:overflow-hidden">
          {/* Left Side: Citizen Instructions */}
          <div className="hidden lg:flex flex-col justify-center p-8 lg:p-12 lg:w-1/2 space-y-6 bg-[#110e24]/30">
            <span className="inline-flex px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-[10px] uppercase tracking-wider w-fit">
              CIVIC CONGESTION VIGIL
            </span>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Report violations, <br />
              <span className="text-[#a6c8ff]">restore traffic flow</span>.
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              Help Bengaluru Traffic Police map on-street illegal parking and double-parking hotspots. Upload a photo of the offending vehicle; our AI engine automatically extracts plate numbers and dispatches nearby enforcement officers.
            </p>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <Camera className="text-indigo-400 w-5 h-5" />
                <span className="text-xs text-gray-200 font-semibold">Optical Bounding &amp; license plate OCR extraction</span>
              </div>
              <div className="flex items-center gap-3">
                <Navigation className="text-indigo-400 w-5 h-5" />
                <span className="text-xs text-gray-200 font-semibold">GPS and Manual Geolocation support</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-indigo-400 w-5 h-5" />
                <span className="text-xs text-gray-200 font-semibold">Tamper-proof municipal challan queue sync</span>
              </div>
            </div>
          </div>

          {/* Right Side: Mobile Mockup */}
          <div className="w-full lg:w-1/2 flex items-center justify-center bg-transparent lg:bg-[#07060c]/30 p-2 sm:p-4 md:p-6 lg:border-l border-[#3e3b54]/40">
            {/* Mobile Phone Mock */}
            <div className="w-full max-w-md lg:w-[305px] lg:h-[525px] bg-[#0f0e1a]/90 lg:bg-[#0f0e1a] rounded-2xl lg:rounded-[2.5rem] border border-[#3e3b54]/40 lg:border-[8px] lg:border-[#5227FF]/70 relative overflow-hidden shadow-xl lg:shadow-2xl flex flex-col shrink-0 min-h-[500px] lg:min-h-0">
              {/* Mobile Top bar */}
              <div className="hidden lg:flex h-8 w-full justify-between items-center px-6 pt-3 shrink-0 text-gray-400">
                <span className="text-[9px] font-bold">9:41 AM</span>
                <div className="flex gap-1 items-center">
                  <span className="material-symbols-outlined text-[10px]">signal_cellular_4_bar</span>
                  <span className="material-symbols-outlined text-[10px]">wifi</span>
                  <span className="material-symbols-outlined text-[10px]">battery_full</span>
                </div>
              </div>

              {/* Mobile screen view scroll container */}
              <div className="flex-grow flex flex-col p-4 sm:p-5 md:p-6 overflow-y-auto relative justify-between text-gray-200">
                
                {/* Step 1: Info Form */}
                {step === 1 && (
                  <div className="space-y-4 flex flex-col justify-between h-full">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-lg lg:text-base font-bold text-white">Report Violation</h2>
                        <p className="text-xs lg:text-[10px] text-gray-400">Flag curbside obstructions causing delays</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="p-3 lg:p-2.5 bg-[#131224]/70 rounded-xl border border-[#3e3b54]/50">
                          <label className="text-[9px] lg:text-[8px] text-indigo-400 font-bold uppercase tracking-wider block">NEAREST TRAFFIC ZONE</label>
                          <select 
                            value={selectedJunction} 
                            onChange={(e) => setSelectedJunction(e.target.value)}
                            className="bg-transparent border-none p-0 focus:outline-none text-sm lg:text-xs font-semibold w-full text-white mt-1 cursor-pointer"
                          >
                            <option value="Shivajinagar - Tasker Town Hub" className="bg-[#100f1a] text-white">Shivajinagar PS Junction</option>
                            <option value="Malleshwaram - Orion Ring Road" className="bg-[#100f1a] text-white">Malleshwaram PS Ring Road</option>
                          </select>
                        </div>

                        {/* Location Details with Geolocation */}
                        <div className="p-3 lg:p-2.5 bg-[#131224]/70 rounded-xl border border-[#3e3b54]/50 space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] lg:text-[8px] text-indigo-400 font-bold uppercase tracking-wider block">LOCATION ADDRESS</label>
                            <button
                              type="button"
                              onClick={handleGetLocation}
                              disabled={locLoading}
                              className="text-[10px] lg:text-[9px] text-[#a6c8ff] hover:text-[#ff9ffc] font-bold flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-none"
                            >
                              {locLoading ? (
                                <Loader className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <MapPin className="w-3.5 h-3.5 lg:w-3 lg:h-3" />
                              )}
                              Use GPS
                            </button>
                          </div>
                          
                          <input 
                            type="text"
                            value={locationAddress}
                            onChange={(e) => setLocationAddress(e.target.value)}
                            placeholder="Type street name manually..."
                            className="bg-transparent border-none p-0 focus:outline-none text-sm lg:text-xs font-semibold w-full text-white" 
                          />
                        </div>

                        <div className="p-3 lg:p-2.5 bg-[#131224]/70 rounded-xl border border-[#3e3b54]/50">
                          <label className="text-[9px] lg:text-[8px] text-indigo-400 font-bold uppercase tracking-wider block">VIOLATION TYPE</label>
                          <select 
                            value={violationType} 
                            onChange={(e) => setViolationType(e.target.value)}
                            className="bg-transparent border-none p-0 focus:outline-none text-sm lg:text-xs font-semibold w-full text-white mt-1 cursor-pointer"
                          >
                            <option value="Double Parking" className="bg-[#100f1a] text-white">Double Parking (Blocks Carriageway)</option>
                            <option value="Sidewalk Parking" className="bg-[#100f1a] text-white">Sidewalk Parking (Pedestrian Hazard)</option>
                            <option value="Bus Lane Obstruction" className="bg-[#100f1a] text-white">Bus Lane Obstruction (Public Transit Delay)</option>
                            <option value="No Parking Zone" className="bg-[#100f1a] text-white">No Parking Zone</option>
                          </select>
                        </div>

                        <div className="p-3 lg:p-2.5 bg-[#131224]/70 rounded-xl border border-[#3e3b54]/50">
                          <label className="text-[9px] lg:text-[8px] text-indigo-400 font-bold uppercase tracking-wider block">VEHICLE LICENSE PLATE</label>
                          <input 
                            type="text"
                            value={vehicleNo}
                            onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                            className="bg-transparent border-none p-0 focus:outline-none text-sm lg:text-xs font-semibold w-full text-white mt-1 font-mono uppercase" 
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (!locationAddress.trim()) {
                          showToast?.('Please specify the location.', 'warning');
                          return;
                        }
                        setStep(2);
                      }}
                      className="w-full bg-gradient-to-r from-[#2563eb] to-[#5227FF] text-white py-3 lg:py-2.5 rounded-xl font-bold text-sm lg:text-xs flex items-center justify-center gap-1 group hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-98 cursor-pointer border-none mt-4"
                    >
                      Next: Upload Evidence
                      <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-0.5">arrow_forward</span>
                    </button>
                  </div>
                )}

                {/* Step 2: Upload Evidence */}
                {step === 2 && (
                  <div className="space-y-4 flex flex-col justify-between h-full">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setStep(1)}
                          className="material-symbols-outlined text-[#a6c8ff] hover:text-white p-1 hover:bg-white/5 rounded-full text-base lg:text-sm cursor-pointer bg-transparent border-none"
                        >
                          arrow_back
                        </button>
                        <h2 className="text-lg lg:text-base font-bold text-white">Upload Proof</h2>
                      </div>
                      
                      <div className="border-2 border-dashed border-[#3e3b54]/50 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center bg-[#0f0e1a]/40 min-h-[220px] lg:min-h-[180px] space-y-4 lg:space-y-3">
                        <Camera className="text-indigo-400 w-12 h-12 lg:w-10 lg:h-10 animate-pulse" />
                        <div className="space-y-1">
                          <p className="text-sm lg:text-xs font-bold text-white">Upload Offense Photo</p>
                          <p className="text-xs lg:text-[9px] text-gray-400">Ensure vehicle license plate is visible</p>
                        </div>
                        
                        <button
                          onClick={handleScanPhoto}
                          className="px-5 py-2 lg:px-4 lg:py-1.5 bg-[#2563eb]/10 border border-[#2563eb]/30 hover:bg-[#2563eb]/20 text-[#a6c8ff] font-bold text-xs lg:text-[10px] rounded-lg transition-colors cursor-pointer"
                        >
                          Use Demo Offense Photo
                        </button>
                      </div>
                    </div>

                    <button 
                      disabled={loadingAI}
                      onClick={handleScanPhoto}
                      className={`w-full py-3 lg:py-2.5 rounded-xl font-bold text-sm lg:text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer border-none mt-4 ${
                        loadingAI 
                          ? 'bg-indigo-900/40 text-indigo-200/55 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-[#2563eb] to-[#5227FF] text-white font-bold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                      }`}
                    >
                      {loadingAI ? (
                        <>
                          <span>AI Extracting Plate OCR...</span>
                          <Loader className="w-4 h-4 lg:w-3.5 lg:h-3.5 animate-spin" />
                        </>
                      ) : (
                        <span>Verify with AI Engine</span>
                      )}
                    </button>
                  </div>
                )}

                {/* Step 3: AI Scan Results Verification */}
                {step === 3 && (
                  <div className="space-y-4 flex flex-col justify-between h-full">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setStep(2)}
                          className="material-symbols-outlined text-[#a6c8ff] hover:text-white p-1 hover:bg-white/5 rounded-full text-base lg:text-sm cursor-pointer bg-transparent border-none"
                        >
                          arrow_back
                        </button>
                        <h2 className="text-lg lg:text-base font-bold text-white">AI Verification</h2>
                      </div>
                      
                      {/* Image Preview & Extracted OCR */}
                      <div className="rounded-xl overflow-hidden border border-[#3e3b54]/60 shadow-sm relative h-36 lg:h-28 bg-black">
                        {evidencePhoto && <img src={evidencePhoto} alt="Evidence" className="w-full h-full object-cover opacity-60" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e1a] via-[#0f0e1a]/50 to-transparent flex flex-col justify-end p-3">
                          <span className="text-[9px] lg:text-[8px] text-emerald-400 font-bold tracking-widest">PLATE OCR SCANNER STATUS: SUCCESS</span>
                          <h4 className="text-base lg:text-sm font-mono font-bold text-white tracking-wider">{vehicleNo}</h4>
                        </div>
                      </div>

                      {/* Analytics details */}
                      <div className="p-3.5 bg-[#131224]/80 text-white border border-[#3e3b54]/30 rounded-xl space-y-2 text-xs lg:text-[10px]">
                        <div className="flex justify-between">
                          <span className="opacity-75">Extracted Location</span>
                          <span className="font-bold truncate max-w-[150px] lg:max-w-[120px]">{locationAddress}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-75">Space Pressure Index (SPI)</span>
                          <span className="text-[#a6c8ff] font-bold font-mono">64.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-75">Effective Width Reduction</span>
                          <span className="text-[#a6c8ff] font-bold font-mono">36.0%</span>
                        </div>
                        <div className="h-px bg-[#3e3b54]/30 my-1"></div>
                        <div className="flex justify-between">
                          <span className="opacity-75">Incident Severity Level</span>
                          <span className="bg-red-500/20 border border-red-500/30 text-red-400 px-2 py-0.5 rounded text-[9px] lg:text-[8px] font-bold font-mono">CRITICAL</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleSubmitReport}
                      className="w-full bg-gradient-to-r from-[#2563eb] to-[#5227FF] text-white py-3 lg:py-2.5 rounded-xl font-bold text-sm lg:text-xs flex items-center justify-center gap-1 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-98 transition-all shadow-md cursor-pointer border-none font-bold mt-4"
                    >
                      File Official Incident
                    </button>
                  </div>
                )}

                {/* Step 4: Submission Success Ticket */}
                {step === 4 && (
                  <div className="flex flex-col items-center justify-between h-full text-center py-2">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="relative">
                        <div className="w-14 h-14 lg:w-12 lg:h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center">
                          <svg className="w-7 h-7 lg:w-6 lg:h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 lg:w-3.5 lg:h-3.5 bg-emerald-500 rounded-full border-2 border-[#0f0e1a] animate-pulse"></div>
                      </div>
                      
                      <div>
                        <h2 className="text-base lg:text-sm font-bold text-white">Report Logged</h2>
                        <p className="text-xs lg:text-[9px] text-gray-400 px-2 mt-1">AI engine has broadcasted details to nearest traffic police console.</p>
                      </div>
                    </div>

                    {/* Receipt Card */}
                    <div className="w-full bg-[#131224]/90 rounded-xl border border-[#3e3b54]/40 shadow-md overflow-hidden flex flex-col my-4">
                      <div className="p-3 bg-[#0a0a14] border-b border-dashed border-[#3e3b54]/40 flex justify-between items-center text-left">
                        <div>
                          <div className="text-[8px] lg:text-[7px] font-bold text-indigo-400 uppercase font-mono">INCIDENT ID</div>
                          <div className="text-sm lg:text-xs font-black font-mono">INC-8894 (OCR Verified)</div>
                        </div>
                        <span className="material-symbols-outlined text-[#a6c8ff] text-xl lg:text-base">qr_code_2</span>
                      </div>
                      <div className="p-4 lg:p-3 flex flex-col items-center justify-center bg-[#100f1a]/25">
                        <div className="w-24 h-24 lg:w-20 lg:h-20 bg-[#090812] rounded-lg flex items-center justify-center border border-[#3e3b54]/30">
                          <div className="grid grid-cols-4 gap-1 opacity-70">
                            <div className="w-3.5 h-3.5 lg:w-3 lg:h-3 bg-[#2563eb]"></div>
                            <div className="w-3.5 h-3.5 lg:w-3 lg:h-3 bg-transparent border border-[#2563eb]"></div>
                            <div className="w-3.5 h-3.5 lg:w-3 lg:h-3 bg-[#2563eb]"></div>
                            <div className="w-3.5 h-3.5 lg:w-3 lg:h-3 bg-[#2563eb]"></div>
                            <div className="w-3.5 h-3.5 lg:w-3 lg:h-3 bg-[#2563eb]"></div>
                            <div className="w-3.5 h-3.5 lg:w-3 lg:h-3 bg-[#2563eb]"></div>
                            <div className="w-3.5 h-3.5 lg:w-3 lg:h-3 bg-transparent border border-[#2563eb]"></div>
                            <div className="w-3.5 h-3.5 lg:w-3 lg:h-3 bg-[#2563eb]"></div>
                            <div className="w-3.5 h-3.5 lg:w-3 lg:h-3 bg-transparent border border-[#2563eb]"></div>
                            <div className="w-3.5 h-3.5 lg:w-3 lg:h-3 bg-[#2563eb]"></div>
                            <div className="w-3.5 h-3.5 lg:w-3 lg:h-3 bg-[#2563eb]"></div>
                            <div className="w-3.5 h-3.5 lg:w-3 lg:h-3 bg-transparent border border-[#2563eb]"></div>
                            <div className="w-3.5 h-3.5 lg:w-3 lg:h-3 bg-[#2563eb]"></div>
                            <div className="w-3.5 h-3.5 lg:w-3 lg:h-3 bg-[#2563eb]"></div>
                            <div className="w-3.5 h-3.5 lg:w-3 lg:h-3 bg-transparent border border-[#2563eb]"></div>
                            <div className="w-3.5 h-3.5 lg:w-3 lg:h-3 bg-[#2563eb]"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleReset} 
                      className="text-[#a6c8ff] hover:text-[#ff9ffc] font-bold text-sm lg:text-xs hover:underline mt-2 cursor-pointer bg-transparent border-none"
                    >
                      Report Another Incident
                    </button>
                  </div>
                )}

              </div>

              {/* Home Indicator */}
              <div className="hidden lg:flex h-4 w-full justify-center pb-2 shrink-0 animate-pulse">
                <div className="w-20 h-1 bg-[#3e3b54]/60 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
