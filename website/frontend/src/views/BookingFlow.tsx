import { useEffect, useState } from 'react';

interface BookingFlowProps {
  onReportSubmit?: () => void;
}

export default function BookingFlow({ onReportSubmit }: BookingFlowProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedJunction, setSelectedJunction] = useState<string>('Shivajinagar - Tasker Town Hub');
  const [violationType, setViolationType] = useState<string>('Double Parking');
  const [vehicleNo, setVehicleNo] = useState<string>('KA-03-MM-1234');
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(null);

  useEffect(() => {
    // Light mode theme for client-facing simulator
    document.documentElement.classList.add('light');
    return () => {
      document.documentElement.classList.remove('light');
    };
  }, []);

  const handleScanPhoto = () => {
    setLoadingAI(true);
    // Set a mock evidence photo
    setEvidencePhoto('https://lh3.googleusercontent.com/aida-public/AB6AXuD_eTOXNCZpLC7km5ijkeGzTRq0Xn8RSPMiYbDjxo0znZ5TZZxiGpYj4nfSoKuQWrpnlzzEerHMl9kfcA6Z3_qGNR7Ir_81eRJ1kiZSLMzBRmpYWIcUKUrBvzpNfdTW6m5i4qvGwhBNjY4f2eQqMAStbl6c1Yz49YK-3hPwJyi_aMFR7nvkCpfCiGpxnnI1g3YQ30d4TcOtSshHgtNMNFAlO6ntJVl47ml6cS8LJzxTzFNYgbhh2HvcEsci3nCkwcWZ0AodoE6od64N');
    setTimeout(() => {
      setLoadingAI(false);
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
  };

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface flex items-center justify-center p-6 md:p-12 pt-28 pb-20 transition-all duration-300">
      {/* Responsive frame container - removed rigid aspect-16/10 and max-h constraint */}
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-outline-variant overflow-hidden flex flex-col shadow-2xl min-h-[550px]">
        {/* Browser Top bar mock */}
        <div className="bg-surface-container-highest px-6 py-3 flex items-center gap-3 border-b border-outline-variant/60">
          <div className="flex gap-1.5 shrink-0">
            <div className="w-3 h-3 rounded-full bg-error/40"></div>
            <div className="w-3 h-3 rounded-full bg-secondary-container/40"></div>
            <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
          </div>
          <div className="bg-white rounded-md px-4 py-1 text-[11px] text-on-surface-variant flex-grow max-w-md mx-auto border border-outline-variant/60 flex items-center justify-center gap-1 font-mono">
            <span className="material-symbols-outlined text-[12px]">lock</span>
            citizen.astram-parkinsight.gov.in/report
          </div>
        </div>

        {/* Content Area: Split View */}
        <div className="flex flex-col lg:flex-row flex-grow overflow-hidden">
          {/* Left Side: Desktop Marketing Context */}
          <div className="flex flex-col justify-center p-8 lg:p-12 lg:w-1/2 space-y-6 bg-surface-container-lowest">
            <span className="inline-flex px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-[10px] uppercase tracking-wider w-fit">
              CIVIC ENGAGEMENT PORTAL
            </span>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-primary leading-tight">
              Report Parking violations, <span className="text-secondary">Reduce Congestion</span>.
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Use your mobile device to snap and upload evidence of on-street double-parking or sidewalk blockages. Our AI-driven engine instantly assesses its traffic congestion impact and alerts nearby traffic patrols.
            </p>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">photo_camera</span>
                <span className="text-xs text-on-surface font-semibold">Instant Optical Character Recognition (OCR)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">query_stats</span>
                <span className="text-xs text-on-surface font-semibold">Space Pressure Index (SPI) Impact Calculations</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">electric_moped</span>
                <span className="text-xs text-on-surface font-semibold">Targeted patrol dispatch in under 5 minutes</span>
              </div>
            </div>
          </div>

          {/* Right Side: Mobile Mockup */}
          <div className="w-full lg:w-1/2 flex items-center justify-center bg-surface-container-low p-6 lg:border-l border-outline-variant/60">
            {/* Mobile Phone Mock */}
            <div className="w-[300px] h-[520px] bg-white rounded-[2.5rem] border-[8px] border-primary relative overflow-hidden shadow-2xl flex flex-col shrink-0">
              {/* Mobile Top bar */}
              <div className="h-8 w-full flex justify-between items-center px-6 pt-3 shrink-0">
                <span className="text-[9px] font-bold">9:41 AM</span>
                <div className="flex gap-1 items-center">
                  <span className="material-symbols-outlined text-[10px]">signal_cellular_4_bar</span>
                  <span className="material-symbols-outlined text-[10px]">wifi</span>
                  <span className="material-symbols-outlined text-[10px]">battery_full</span>
                </div>
              </div>

              {/* Mobile screen view scroll container */}
              <div className="flex-grow flex flex-col p-5 overflow-hidden relative justify-between">
                
                {/* Step 1: Selection Form */}
                {step === 1 && (
                  <div className="space-y-4 flex flex-col justify-between h-full">
                    <div className="space-y-3">
                      <div>
                        <h2 className="text-base font-bold text-on-surface">Report Infraction</h2>
                        <p className="text-[10px] text-on-surface-variant">Flag illegal parking causing congestion</p>
                      </div>
                      
                      <div className="space-y-2.5">
                        <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant">
                          <label className="text-[8px] text-outline font-bold uppercase tracking-wider block">SELECT NEAREST HUB</label>
                          <select 
                            value={selectedJunction} 
                            onChange={(e) => setSelectedJunction(e.target.value)}
                            className="bg-transparent border-none p-0 focus:outline-none text-xs font-semibold w-full text-on-surface mt-1"
                          >
                            <option value="Shivajinagar - Tasker Town Hub">Shivajinagar PS Junction</option>
                            <option value="Malleshwaram - Orion Ring Road">Malleshwaram PS Ring Road</option>
                          </select>
                        </div>

                        <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant">
                          <label className="text-[8px] text-outline font-bold uppercase tracking-wider block">VIOLATION TYPE</label>
                          <select 
                            value={violationType} 
                            onChange={(e) => setViolationType(e.target.value)}
                            className="bg-transparent border-none p-0 focus:outline-none text-xs font-semibold w-full text-on-surface mt-1"
                          >
                            <option value="Double Parking">Double Parking (Blocks Carriageway)</option>
                            <option value="Sidewalk Parking">Sidewalk Parking (Pedestrian Hazard)</option>
                            <option value="Bus Lane Obstruction">Bus Lane Obstruction (Public Transit Delay)</option>
                            <option value="No Parking Zone">No Parking Zone</option>
                          </select>
                        </div>

                        <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant">
                          <label className="text-[8px] text-outline font-bold uppercase tracking-wider block">VEHICLE LICENSE PLATE</label>
                          <input 
                            type="text"
                            value={vehicleNo}
                            onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                            className="bg-transparent border-none p-0 focus:outline-none text-xs font-semibold w-full text-on-surface mt-1 font-mono uppercase" 
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setStep(2)}
                      className="w-full bg-primary text-on-primary py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 group hover:opacity-90 transition-all active:scale-98"
                    >
                      Next: Upload Evidence
                      <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-0.5">arrow_forward</span>
                    </button>
                  </div>
                )}

                {/* Step 2: Upload Evidence */}
                {step === 2 && (
                  <div className="space-y-4 flex flex-col justify-between h-full">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setStep(1)}
                          className="material-symbols-outlined text-on-surface p-1 hover:bg-surface-container rounded-full text-sm"
                        >
                          arrow_back
                        </button>
                        <h2 className="text-base font-bold text-on-surface">Upload Proof</h2>
                      </div>
                      
                      <div className="border-2 border-dashed border-outline-variant/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-surface-container-highest/20 min-h-[180px] space-y-3">
                        <span className="material-symbols-outlined text-outline text-3xl">photo_camera</span>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-on-surface">Upload Offense Photo</p>
                          <p className="text-[9px] text-on-surface-variant">Ensure license plate is readable</p>
                        </div>
                        
                        <button
                          onClick={handleScanPhoto}
                          className="px-4 py-1.5 bg-secondary/15 hover:bg-secondary/25 text-secondary font-bold text-[10px] rounded-lg transition-colors"
                        >
                          Select Simulated Photo
                        </button>
                      </div>
                    </div>

                    <button 
                      disabled={loadingAI}
                      onClick={handleScanPhoto}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 ${
                        loadingAI 
                          ? 'bg-primary/20 text-on-primary/60 cursor-not-allowed' 
                          : 'bg-primary text-on-primary'
                      }`}
                    >
                      {loadingAI ? (
                        <>
                          <span>AI Extracting Plate OCR...</span>
                          <span className="border-2 border-primary border-t-transparent h-3.5 w-3.5 rounded-full animate-spin"></span>
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
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setStep(2)}
                          className="material-symbols-outlined text-on-surface p-1 hover:bg-surface-container rounded-full text-sm"
                        >
                          arrow_back
                        </button>
                        <h2 className="text-base font-bold text-on-surface">AI Verification</h2>
                      </div>
                      
                      {/* Image Preview & Extracted OCR */}
                      <div className="rounded-xl overflow-hidden border border-outline-variant/60 shadow-sm relative h-28 bg-black">
                        {evidencePhoto && <img src={evidencePhoto} alt="Evidence" className="w-full h-full object-cover opacity-70" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-2.5">
                          <span className="text-[8px] text-green-400 font-bold tracking-widest">PLATE OCR SCANNER STATUS: SUCCESS</span>
                          <h4 className="text-sm font-mono font-bold text-white tracking-wider">{vehicleNo}</h4>
                        </div>
                      </div>

                      {/* Analytics details */}
                      <div className="p-3 bg-primary-container text-on-primary-container rounded-xl space-y-1.5 text-[10px]">
                        <div className="flex justify-between">
                          <span className="opacity-75">Estimated Congestion Score</span>
                          <span className="font-bold text-white">85.2 / 100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-75">Space Pressure Index (SPI)</span>
                          <span className="text-secondary font-bold">64.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-75">Effective Width Reduction</span>
                          <span className="text-secondary font-bold">36.0%</span>
                        </div>
                        <div className="h-px bg-white/10 my-1"></div>
                        <div className="flex justify-between">
                          <span className="opacity-75">Incident Priority Level</span>
                          <span className="bg-error px-1.5 py-0.5 rounded text-[8px] font-bold text-white">CRITICAL</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleSubmitReport}
                      className="w-full bg-secondary text-on-secondary py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 active:scale-98 transition-all shadow-md"
                    >
                      File Official Incident
                    </button>
                  </div>
                )}

                {/* Step 4: Submission Success Ticket */}
                {step === 4 && (
                  <div className="flex flex-col items-center justify-between h-full text-center py-1">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="relative">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-600 rounded-full border-2 border-white animate-pulse"></div>
                      </div>
                      
                      <div>
                        <h2 className="text-sm font-bold text-on-surface">Report Logged</h2>
                        <p className="text-[9px] text-on-surface-variant px-2 mt-0.5">AI engine has broadcasted details to nearest traffic police console.</p>
                      </div>
                    </div>

                    {/* QR Code / Digital Receipt */}
                    <div className="w-full bg-white rounded-xl border border-outline-variant shadow-md overflow-hidden flex flex-col my-3">
                      <div className="p-2.5 bg-surface-container-low border-b border-dashed border-outline-variant flex justify-between items-center text-left">
                        <div>
                          <div className="text-[7px] font-bold text-outline uppercase">INCIDENT ID</div>
                          <div className="text-xs font-black">INC-8894 (OCR Verified)</div>
                        </div>
                        <span className="material-symbols-outlined text-secondary text-base">qr_code_2</span>
                      </div>
                      <div className="p-3 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-surface-container rounded-lg flex items-center justify-center">
                          <div className="grid grid-cols-4 gap-1 opacity-60">
                            <div className="w-3 h-3 bg-primary"></div>
                            <div className="w-3 h-3 bg-transparent border border-primary"></div>
                            <div className="w-3 h-3 bg-primary"></div>
                            <div className="w-3 h-3 bg-primary"></div>
                            <div className="w-3 h-3 bg-primary"></div>
                            <div className="w-3 h-3 bg-primary"></div>
                            <div className="w-3 h-3 bg-transparent border border-primary"></div>
                            <div className="w-3 h-3 bg-primary"></div>
                            <div className="w-3 h-3 bg-transparent border border-primary"></div>
                            <div className="w-3 h-3 bg-primary"></div>
                            <div className="w-3 h-3 bg-primary"></div>
                            <div className="w-3 h-3 bg-transparent border border-primary"></div>
                            <div className="w-3 h-3 bg-primary"></div>
                            <div className="w-3 h-3 bg-primary"></div>
                            <div className="w-3 h-3 bg-transparent border border-primary"></div>
                            <div className="w-3 h-3 bg-primary"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleReset} 
                      className="text-secondary font-bold text-xs hover:underline mt-1"
                    >
                      Report Another Incident
                    </button>
                  </div>
                )}

              </div>

              {/* Home Indicator */}
              <div className="h-4 w-full flex justify-center pb-2 shrink-0">
                <div className="w-20 h-1 bg-outline-variant/60 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
