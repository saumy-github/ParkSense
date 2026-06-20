import { useEffect } from 'react';

export default function Roadmap() {
  useEffect(() => {
    document.documentElement.classList.add('light');
    return () => {
      document.documentElement.classList.remove('light');
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface pt-24 pb-32 max-w-7xl mx-auto px-6 md:px-12 space-y-12 transition-all duration-300">
      
      {/* Hero Section */}
      <section className="bg-surface-container-lowest py-10 px-6 rounded-3xl border border-outline-variant/60 shadow-sm">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest inline-block">Business Intelligence</span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary leading-tight">Optimizing Urban Infrastructure with AI.</h1>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-lg">Deep dive into AiParking's growth metrics, architectural integrity, and the multi-year roadmap for smart city integration.</p>
            <div className="flex gap-8 pt-2">
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold text-secondary">24%</span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">Revenue Growth MoM</span>
              </div>
              <div className="w-px h-12 bg-outline-variant/60"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold text-secondary">8.4k</span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">Connected Hubs</span>
              </div>
            </div>
          </div>
          <div className="relative h-64 rounded-2xl overflow-hidden bg-cover bg-center border border-outline-variant/40" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBNGPPoCZWdrTfeHgX87mYLCrugQVmNGwMljJNsk3-hMpnK0cXMjFDhYmi7iQ4YVy50LrC7oo5KW57jGDn5rHOFMIvb_NnSM2KnOBGNBcqtFRW1XGAbrDdyfXa5Xmk0Fb3ACKvG_KQpLe40wUp9eng5sVTWfCm1r7zMMqpUzZ90Gbxb8HPKMMHxVxj2ajbTPf0k3WRz_aJvLcnS_fNQL7duQCOdx4YQ78px_jMXrwYkLGwQxWtNR_0fqfltOJ2nZv7eUs9YnyvIX3Qk')` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* 1. Analytics Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-primary tracking-tight">Performance Analytics</h2>
            <p className="text-xs text-on-surface-variant mt-1">Real-time revenue monitoring and peak occupancy trends.</p>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Trajectory */}
          <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 flex flex-col justify-between">
            <h3 className="text-base font-bold text-primary mb-6">Annual Revenue Trajectory</h3>
            <div className="h-44 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 300" preserveAspectRatio="none">
                <path className="fill-none stroke-secondary stroke-[4]" d="M0,250 C100,240 200,280 300,200 S500,100 600,150 S800,50 1000,80"></path>
                <path className="opacity-10 fill-secondary" d="M0,250 C100,240 200,280 300,200 S500,100 600,150 S800,50 1000,80 V300 H0 Z"></path>
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 pt-2 border-t border-outline-variant/40 text-[10px] text-on-surface-variant font-mono">
                <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
              </div>
            </div>
          </div>

          {/* Peak occupancy bars */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60">
            <h3 className="text-base font-bold text-primary mb-6">Peak Hour Occupancy</h3>
            <div className="flex items-end justify-between h-40 px-4 relative border-b border-outline-variant/40 pb-1">
              <div className="w-6 bg-primary/20 rounded-t-sm" style={{ height: '40%' }}></div>
              <div className="w-6 bg-secondary rounded-t-sm" style={{ height: '65%' }}></div>
              <div className="w-6 bg-primary rounded-t-sm" style={{ height: '90%' }}></div>
              <div className="w-6 bg-secondary-container rounded-t-sm" style={{ height: '75%' }}></div>
              <div className="w-6 bg-primary/20 rounded-t-sm" style={{ height: '30%' }}></div>
            </div>
            <div className="flex justify-between mt-2 text-[9px] text-on-surface-variant font-mono px-2">
              <span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>24:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Timeline Section */}
      <section className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/60">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-primary tracking-tight">Future Scope Roadmap</h2>
          <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">Strategic milestones for the next 36 months, moving from core infrastructure to autonomous ecosystem integration.</p>
        </div>

        <div className="relative max-w-2xl mx-auto">
          {/* Vertical central bar */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-outline-variant/60"></div>
          
          <div className="relative mb-8">
            <div className="flex items-center justify-between w-full">
              <div className="w-[45%] text-right pr-6">
                <h4 className="text-sm font-bold text-secondary">Q1 2025</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Edge-AI Deployment. Integration of hardware sensors with localized inference models for 99.9% detection accuracy.</p>
              </div>
              <div className="relative z-10 w-3 h-3 bg-secondary rounded-full border-2 border-white ring-4 ring-secondary/20"></div>
              <div className="w-[45%]"></div>
            </div>
          </div>

          <div className="relative mb-8">
            <div className="flex items-center justify-between w-full flex-row-reverse">
              <div className="w-[45%] text-left pl-6">
                <h4 className="text-sm font-bold text-secondary">Q3 2025</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Smart City API Integration. Direct data feeding to municipal traffic management centers and public transport hubs.</p>
              </div>
              <div className="relative z-10 w-3 h-3 bg-primary rounded-full border-2 border-white ring-4 ring-primary/20"></div>
              <div className="w-[45%]"></div>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between w-full">
              <div className="w-[45%] text-right pr-6">
                <h4 className="text-sm font-bold text-secondary">2026 & Beyond</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Autonomous Valet Protocol. Full communication layer for self-driving vehicles to navigate, park, and charge without human intervention.</p>
              </div>
              <div className="relative z-10 w-3 h-3 bg-secondary-container rounded-full border-2 border-white ring-4 ring-secondary-container/20"></div>
              <div className="w-[45%]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tech Architecture flowchart */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight">System Architecture</h2>
          <p className="text-xs text-on-surface-variant mt-1">Highly available cloud-native infrastructure with low-latency edge processing.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/60 shadow-sm">
          <div className="p-6 rounded-xl border border-outline-variant/40 text-center space-y-3 bg-surface">
            <div className="w-12 h-12 bg-secondary-fixed flex items-center justify-center rounded-lg mx-auto">
              <span className="material-symbols-outlined text-secondary">router</span>
            </div>
            <h4 className="font-bold text-sm">Edge Sensors</h4>
            <p className="text-xs text-on-surface-variant">Ultrasonic & Camera Array</p>
          </div>

          <div className="p-6 rounded-xl border border-primary/20 bg-primary-container text-center space-y-3 text-on-primary">
            <div className="w-12 h-12 bg-on-primary-container flex items-center justify-center rounded-lg mx-auto">
              <span className="material-symbols-outlined text-primary-container">cloud</span>
            </div>
            <h4 className="font-bold text-sm text-white">Cloud AI Engine</h4>
            <p className="text-xs text-on-primary-container/80">Real-time Analytics & Yield Optimization</p>
          </div>

          <div className="p-6 rounded-xl border border-outline-variant/40 text-center space-y-3 bg-surface">
            <div className="w-12 h-12 bg-secondary-fixed flex items-center justify-center rounded-lg mx-auto">
              <span className="material-symbols-outlined text-secondary">smartphone</span>
            </div>
            <h4 className="font-bold text-sm">End-User App</h4>
            <p className="text-xs text-on-surface-variant">Booking & Navigation Interface</p>
          </div>
        </div>
      </section>

      {/* 4. Strategic Model */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight">Strategic Growth Model</h2>
          <p className="text-xs text-on-surface-variant mt-1">Scalability and Return on Investment (ROI) breakdown.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 border border-outline-variant rounded-xl bg-surface-container-low transition-all hover:shadow-sm">
            <h5 className="text-[10px] font-extrabold text-secondary uppercase mb-3">Revenue Stream</h5>
            <ul className="space-y-2.5 text-xs text-on-surface">
              <li className="flex gap-2 items-center"><span className="material-symbols-outlined text-secondary text-sm">check_circle</span> Subscription SaaS</li>
              <li className="flex gap-2 items-center"><span className="material-symbols-outlined text-secondary text-sm">check_circle</span> Transaction Fees</li>
              <li className="flex gap-2 items-center"><span className="material-symbols-outlined text-secondary text-sm">check_circle</span> Data Licensing</li>
            </ul>
          </div>

          <div className="p-5 border border-outline-variant rounded-xl bg-surface-container-low transition-all hover:shadow-sm">
            <h5 className="text-[10px] font-extrabold text-secondary uppercase mb-3">Cost Structure</h5>
            <ul className="space-y-2.5 text-xs text-on-surface">
              <li className="flex gap-2 items-center"><span className="material-symbols-outlined text-secondary text-sm">check_circle</span> R&D / AI Training</li>
              <li className="flex gap-2 items-center"><span className="material-symbols-outlined text-secondary text-sm">check_circle</span> Hardware Installs</li>
              <li className="flex gap-2 items-center"><span className="material-symbols-outlined text-secondary text-sm">check_circle</span> Cloud Maintenance</li>
            </ul>
          </div>

          <div className="p-5 border border-outline-variant rounded-xl bg-surface-container-low transition-all hover:shadow-sm">
            <h5 className="text-[10px] font-extrabold text-secondary uppercase mb-3">Scaling Logic</h5>
            <ul className="space-y-2.5 text-xs text-on-surface">
              <li className="flex gap-2 items-center"><span className="material-symbols-outlined text-secondary text-sm">check_circle</span> 10x Hub Expansion</li>
              <li className="flex gap-2 items-center"><span className="material-symbols-outlined text-secondary text-sm">check_circle</span> Global Licensing</li>
              <li className="flex gap-2 items-center"><span className="material-symbols-outlined text-secondary text-sm">check_circle</span> B2B Partnerships</li>
            </ul>
          </div>

          <div className="p-5 border border-outline-variant rounded-xl bg-secondary-container text-on-secondary-container transition-all hover:shadow-md flex flex-col justify-between min-h-[140px]">
            <h5 className="text-[10px] font-extrabold text-on-secondary-container/85 uppercase tracking-wide">ROI Target</h5>
            <div className="mt-auto">
              <span className="text-3xl font-extrabold text-white block">18-24 Mo</span>
              <span className="text-xs mt-1 block">Projected Breakeven per installation site</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
