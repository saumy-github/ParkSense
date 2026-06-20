import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

function ScrollReveal({ children, className = '', delay = 0 }: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={elementRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-12 scale-[0.98]'
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface LandingPageProps {
  isLoggedIn: boolean;
  userRole: 'operator' | 'citizen' | null;
}

export default function LandingPage({ isLoggedIn, userRole }: LandingPageProps) {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<string>('sensor-1');

  useEffect(() => {
    document.documentElement.classList.add('light');
    return () => {
      document.documentElement.classList.remove('light');
    };
  }, []);

  const handleCTA = () => {
    if (isLoggedIn) {
      navigate(userRole === 'operator' ? '/dashboard' : '/reporting');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface pt-24 pb-32 max-w-7xl mx-auto px-6 md:px-12 space-y-16 transition-all duration-300">
      
      {/* Hero Section */}
      <ScrollReveal>
        <section className="relative bg-surface-container-lowest p-8 md:p-12 rounded-3xl border border-outline-variant/60 shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-5">
              <span className="inline-block px-3.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-xs uppercase tracking-widest">
                URBAN MOBILITY 2.0
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-primary leading-tight tracking-tight">
                AI-Driven Congestion & Parking Intelligence
              </h1>
              <p className="text-sm md:text-base text-on-surface-variant leading-relaxed max-w-lg">
                Detecting illegal parking hotspots and quantifying traffic congestion impact in real time. We enable municipal traffic authorities to deploy targeted enforcement and restore road capacities.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button 
                  onClick={handleCTA}
                  className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:bg-secondary transition-all active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">login</span>
                  {isLoggedIn ? 'Open Console' : 'Get Started'}
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="border border-primary/30 text-primary bg-primary-container/10 px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary-container/20 transition-colors flex items-center gap-2 active:scale-[0.98]"
                >
                  Report a Violation <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-surface-container-low border border-outline-variant/40 p-4 flex items-center justify-center">
                <div className="relative w-full h-full rounded-xl overflow-hidden group shadow-md">
                  <img 
                    alt="Futuristic parking hub design"
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgQdR7w68-bx5FyAG1XRQvulijDFt36wBQJ8CQy92eXmNsPPaOsShhE3AEdIJZ_L98L_VVGXVsZVJeKruCHn_IP7238YNjNQ3gbbwCP3TqEPlRR2sOEVYpVgUHp6cx4HWAhjRJdSLns5BqIV-UCkVKbmejeyj41m1FEeUs503b5UOKHtjZBuSR1khaRb4KpaYFoyhslFZDXbIwCTWhxmWeLfjgSSvc65ZirMCWoyO4sUCyCBcNuK2jD_TrtbYIuKi6OApTArfTtfCS"
                  />
                  <div className="absolute inset-0 bg-linear-to-tr from-primary/10 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Scrollytelling Section */}
      <ScrollReveal>
        <section className="bg-surface p-8 rounded-3xl border border-outline-variant/60">
          <div className="mb-10 text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-primary tracking-tight">The Anatomy of Smart Parking</h2>
            <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">Witness the precision of our edge-AI infrastructure as it integrates seamlessly with existing urban environments.</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-6">
              <div 
                onMouseEnter={() => setActiveStep('sensor-1')}
                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  activeStep === 'sensor-1' ? 'bg-surface-container-low border-secondary shadow-sm scale-101' : 'border-transparent'
                }`}
              >
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-sm">01</div>
                  <div>
                    <h3 className="font-bold text-base text-primary mb-1">Distributed Edge Sensors</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">High-precision LiDAR and optical sensors detect vehicle occupancy with 99.9% accuracy, processing data at the edge for sub-millisecond latency.</p>
                  </div>
                </div>
              </div>

              <div 
                onMouseEnter={() => setActiveStep('sensor-2')}
                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  activeStep === 'sensor-2' ? 'bg-surface-container-low border-secondary shadow-sm scale-101' : 'border-transparent'
                }`}
              >
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-sm">02</div>
                  <div>
                    <h3 className="font-bold text-base text-primary mb-1">Neural Violation Detection</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">Automated identification of overstays and illegal parking zones using proprietary computer vision models trained on millions of urban scenarios.</p>
                  </div>
                </div>
              </div>

              <div 
                onMouseEnter={() => setActiveStep('sensor-3')}
                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  activeStep === 'sensor-3' ? 'bg-surface-container-low border-secondary shadow-sm scale-101' : 'border-transparent'
                }`}
              >
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-sm">03</div>
                  <div>
                    <h3 className="font-bold text-base text-primary mb-1">Real-time Orchestration</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">Centralized dashboard for city planners to adjust dynamic pricing, manage emergency access, and predict traffic bottlenecks before they happen.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphic Panel showing active states */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-6 flex items-center justify-center min-h-87.5">
              <div className="w-full max-w-sm relative">
                <svg className="w-full h-full text-outline-variant fill-none stroke-current" strokeWidth="1" viewBox="0 0 400 400">
                  <path className="opacity-20" d="M50 100 L350 100 M50 200 L350 200 M50 300 L350 300"></path>
                  <path className="opacity-20" d="M100 50 L100 350 M200 50 L200 350 M300 50 L300 350"></path>
                  <rect className="stroke-outline" height="240" rx="6" strokeWidth="2" width="240" x="80" y="80"></rect>
                  
                  {/* Sensors */}
                  <circle 
                    cx="120" cy="120" r={activeStep === 'sensor-1' ? '12' : '7'} 
                    className={`transition-all duration-300 stroke-secondary fill-surface-container-highest ${
                      activeStep === 'sensor-1' ? 'fill-secondary stroke-secondary' : ''
                    }`} 
                    strokeWidth="2"
                  ></circle>
                  <circle 
                    cx="280" cy="120" r={activeStep === 'sensor-2' ? '12' : '7'} 
                    className={`transition-all duration-300 stroke-secondary fill-surface-container-highest ${
                      activeStep === 'sensor-2' ? 'fill-secondary stroke-secondary' : ''
                    }`} 
                    strokeWidth="2"
                  ></circle>
                  <circle 
                    cx="200" cy="280" r={activeStep === 'sensor-3' ? '12' : '7'} 
                    className={`transition-all duration-300 stroke-secondary fill-surface-container-highest ${
                      activeStep === 'sensor-3' ? 'fill-secondary stroke-secondary' : ''
                    }`} 
                    strokeWidth="2"
                  ></circle>
                  
                  {/* Line */}
                  <path 
                    className={`stroke-secondary transition-all duration-300 ${activeStep === 'sensor-2' ? 'opacity-100' : 'opacity-0'}`} 
                    d="M120 120 Q 200 60 280 120" 
                    strokeWidth="2.5"
                  ></path>
                </svg>
                
                <div className="absolute bottom-2 left-2 flex gap-4 text-[9px] font-mono text-on-surface-variant">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>
                    <span>Selected Node</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-surface-container-highest border border-outline-variant"></div>
                    <span>Idle State</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Problem/Solution split */}
      <ScrollReveal>
        <section className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/60">
          <div className="grid md:grid-cols-2 gap-px bg-outline-variant/50">
            <div className="bg-surface p-8 md:p-12 space-y-6 flex flex-col justify-center">
              <div className="w-12 h-12 rounded-xl bg-error-container text-on-error-container flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">warning</span>
              </div>
              <h3 className="text-2xl font-bold text-primary">The Gridlock Status Quo</h3>
              <ul className="space-y-4 text-sm text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-error text-lg shrink-0">close</span>
                  <span>30% of urban traffic is caused by drivers searching for parking.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-error text-lg shrink-0">close</span>
                  <span>Billions lost annually in CO2 emissions and wasted productivity.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-error text-lg shrink-0">close</span>
                  <span>Inefficient manual enforcement and revenue leakage.</span>
                </li>
              </ul>
            </div>

            <div className="bg-primary-container p-8 md:p-12 space-y-6 text-on-primary-container flex flex-col justify-center">
              <div className="w-12 h-12 rounded-xl bg-secondary-container text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">bolt</span>
              </div>
              <h3 className="text-2xl font-bold text-white">AI-Optimized Infrastructure</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary-fixed text-lg shrink-0">check_circle</span>
                  <span>Pre-emptive routing reduces cruise-time traffic by up to 60%.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary-fixed text-lg shrink-0">check_circle</span>
                  <span>Dynamic demand-based pricing maximizes curb utilization.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary-fixed text-lg shrink-0">check_circle</span>
                  <span>Automated e-ticketing and 24/7 autonomous surveillance.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Bento Capabilities Grid */}
      <section className="space-y-6">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">System Capabilities</span>
              <h2 className="text-2xl font-bold text-primary mt-1.5">Data-Driven Governance</h2>
            </div>
            <span className="text-secondary font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer">
              View API Documentation <span className="material-symbols-outlined text-sm">open_in_new</span>
            </span>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScrollReveal delay={0} className="md:col-span-2 flex flex-col">
            <div className="bg-surface-container-lowest border border-outline-variant/60 p-8 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all h-full">
              <div className="space-y-2">
                <span className="material-symbols-outlined text-secondary text-3xl">monitoring</span>
                <h4 className="font-bold text-lg text-primary">Predictive Analytics Hub</h4>
                <p className="text-xs text-on-surface-variant max-w-md leading-relaxed">Our neural network forecasts parking demand up to 48 hours in advance, allowing for proactive urban management and traffic flow adjustments.</p>
              </div>
              
              <div className="mt-8 h-40 w-full bg-surface-container-low rounded-xl overflow-hidden relative border border-outline-variant/30">
                <div className="absolute inset-x-4 bottom-2 top-6 flex items-end justify-between gap-1.5">
                  <div className="w-full bg-secondary-fixed/50 rounded-t-sm" style={{ height: '40%' }}></div>
                  <div className="w-full bg-secondary-fixed/70 rounded-t-sm" style={{ height: '60%' }}></div>
                  <div className="w-full bg-secondary rounded-t-sm" style={{ height: '85%' }}></div>
                  <div className="w-full bg-secondary-fixed/50 rounded-t-sm" style={{ height: '45%' }}></div>
                  <div className="w-full bg-secondary-fixed/70 rounded-t-sm" style={{ height: '70%' }}></div>
                  <div className="w-full bg-secondary rounded-t-sm" style={{ height: '95%' }}></div>
                  <div className="w-full bg-secondary-fixed/50 rounded-t-sm" style={{ height: '55%' }}></div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <div className="bg-surface-container-lowest border border-outline-variant/60 p-8 rounded-2xl hover:shadow-md transition-all space-y-4 h-full">
              <span className="material-symbols-outlined text-secondary text-3xl">verified_user</span>
              <h4 className="font-bold text-lg text-primary">Automated Compliance</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">LPR (License Plate Recognition) integration for instant validation and frictionless payment processing across all facilities.</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="bg-primary text-on-primary p-8 rounded-2xl hover:shadow-md transition-all flex flex-col justify-between min-h-220px h-full">
              <span className="material-symbols-outlined text-secondary-fixed text-3xl">account_balance_wallet</span>
              <div className="space-y-1">
                <h4 className="font-bold text-lg text-white">Dynamic Yield Management</h4>
                <p className="text-on-primary-container text-xs leading-relaxed">Optimize municipal revenue through algorithmically adjusted pricing that balances city accessibility with commercial viability.</p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={450} className="md:col-span-2">
            <div className="bg-surface-container-lowest border border-outline-variant/60 p-8 rounded-2xl flex flex-col sm:flex-row items-center gap-6 hover:shadow-md transition-all overflow-hidden h-full">
              <div className="shrink-0 w-full sm:w-1/3 h-32 rounded-xl bg-cover bg-center border border-outline-variant/30" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBoNnInu5zPuH1H0D_GCJqHkJhunTrbY5-tQQdVXUnQd0nqu2pgPmIQez-Ma06SKms9CHd3Z3MjfUrOv8Gp6E8-C8kiieka4U1-X97qzXvHiPcf-I1WKQd1VzFNgSqfprE99zR0LrcZLMyrI46gsONUN4vI4DTzMQPH-2Pib1mT3rL3xPkGIhfCDcAtcUpwsRTRZAYV8-VgsK4bF-X0spAKcimD_UD5mXkII84cnjxCUvHDdG8moG7VhSctC42mtYnDBO2e7tTLsVMc')` }}>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-primary">Omnichannel Monitoring</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">Monitor single parking spots or entire city sectors from a unified command center accessible via web, mobile, or enterprise API.</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <ScrollReveal>
        <section className="bg-primary-container p-8 md:p-12 rounded-3xl relative overflow-hidden text-center text-on-primary-container border border-outline/10">
          <div className="relative z-10 space-y-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Ready to align your enforcement operations?</h2>
            <p className="text-sm text-on-primary-container/85 max-w-xl mx-auto leading-relaxed">Join the leading traffic authorities using ASTraM ParkInsight to restore traffic flow dynamics.</p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button 
                onClick={handleCTA}
                className="bg-secondary text-on-secondary px-8 py-3 rounded-lg font-bold text-xs hover:bg-white hover:text-primary transition-all active:scale-95 shadow-md shadow-secondary/15"
              >
                Access Portal Console
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="border border-on-primary-container text-white px-8 py-3 rounded-lg font-bold text-xs hover:bg-white/10 transition-all active:scale-95"
              >
                View Roadmap
              </button>
            </div>
          </div>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)`, backgroundSize: '24px 24px' }}></div>
        </section>
      </ScrollReveal>
    </div>
  );
}
