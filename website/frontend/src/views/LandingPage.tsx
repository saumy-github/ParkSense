import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'left' | 'right' | 'up';
}

function ScrollReveal({ children, className = '', delay = 0, direction = 'up' }: ScrollRevealProps) {
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

  const getDirectionStyles = () => {
    if (isVisible) {
      return 'opacity-100 translate-x-0 translate-y-0 scale-100';
    }
    switch (direction) {
      case 'left':
        return 'opacity-0 -translate-x-16 scale-[0.98]';
      case 'right':
        return 'opacity-0 translate-x-16 scale-[0.98]';
      case 'up':
      default:
        return 'opacity-0 translate-y-16 scale-[0.98]';
    }
  };

  return (
    <div
      ref={elementRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${getDirectionStyles()} ${className}`}
    >
      {children}
    </div>
  );
}

interface HotspotSummary {
  cluster_id: number;
  cluster_name: string;
  center_latitude: number;
  center_longitude: number;
  representative_junction: string;
  police_station_jurisdiction: string;
  congestion_impact_score: number;
  total_incident_count: number;
  priority_level: string;
}

interface LandingPageProps {
  isLoggedIn: boolean;
  userRole: 'operator' | 'citizen' | null;
  hotspots?: HotspotSummary[];
}

export default function LandingPage({ isLoggedIn, userRole, hotspots = [] }: LandingPageProps) {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeRef = useRef<HTMLDivElement>(null);

  // --- Real ML Model Data Ingestion ---
  const totalIncidents = hotspots.length > 0 
    ? hotspots.reduce((acc, h) => acc + (h.total_incident_count || 0), 0)
    : 172900; // fallback if empty

  const totalHotspots = hotspots.length > 0
    ? hotspots.length
    : 42; // fallback

  const avgCongestionScore = hotspots.length > 0
    ? hotspots.reduce((acc, h) => acc + (h.congestion_impact_score || 0), 0) / hotspots.length
    : 68.4; // fallback

  // --- Live Analytics Ticker States ---
  const [dynamicIncidents, setDynamicIncidents] = useState(totalIncidents);
  const [clusteringLatency, setClusteringLatency] = useState(32.4);

  // Sync state if hotspots loads later
  useEffect(() => {
    setDynamicIncidents(totalIncidents);
  }, [totalIncidents]);

  // --- Visual ML Pipeline States ---
  const [activeStage, setActiveStage] = useState<number>(0);
  const [dbscanEpsilon, setDbscanEpsilon] = useState<number>(3.0);
  const [dbscanMinPts] = useState<number>(3);
  
  // Formula Weights
  const [weightDuration, setWeightDuration] = useState<number>(0.5);
  const [weightDensity, setWeightDensity] = useState<number>(0.3);
  const [weightObstruction, setWeightObstruction] = useState<number>(0.2);

  // Dispatch API Simulation State
  const [dispatchStatus, setDispatchStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS'>('IDLE');
  const [dispatchPayload, setDispatchPayload] = useState<string>('');

  // --- Q&A / FAQ Accordion States ---
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  // Default to dark mode
  useEffect(() => {
    document.documentElement.classList.remove('light');
  }, []);

  // WebGL Shader Background (Urban Neural Flow - Purplish Bluish Theme)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vertexShaderSrc = `
      attribute vec2 position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSrc = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      varying vec2 v_texCoord;

      void main() {
        vec2 uv = v_texCoord;
        vec2 p = -1.0 + 2.0 * uv;
        p.x *= u_resolution.x / u_resolution.y;

        float t = u_time * 0.15;
        vec2 mouse = u_mouse / u_resolution;
        
        float x = p.x * 2.0;
        float y = p.y * 2.0;
        
        for(float i = 1.0; i < 4.0; i++) {
          x += 0.5 / i * sin(i * y + t + mouse.x);
          y += 0.5 / i * cos(i * x + t + mouse.y);
        }
        
        // Purplish-bluish neural flow theme colors
        vec3 color1 = vec3(0.02, 0.04, 0.09); // Deep dark blue
        vec3 color2 = vec3(0.06, 0.05, 0.15); // Deep purple-blue
        vec3 accent = vec3(0.38, 0.25, 1.0);  // Indigo-violet glow
        
        float mask = sin(x + y) * 0.5 + 0.5;
        vec3 color = mix(color1, color2, mask);
        
        float pulse = pow(mask, 10.0) * 0.15;
        color += accent * pulse;
        
        float dist = length(v_texCoord - 0.5);
        color *= 1.0 - dist * 0.5;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const program = gl.createProgram();
    if (!program) return;
    const vs = compileShader(gl.VERTEX_SHADER, vertexShaderSrc);
    const fs = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSrc);
    if (!vs || !fs) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1
      ]),
      gl.STATIC_DRAW
    );

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');

    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    const render = (time: number) => {
      gl.uniform1f(timeLoc, time * 0.001);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform2f(mouseLoc, mouseX, mouseY);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  // Three.js 3D Core Sphere (Hero Visual)
  useEffect(() => {
    const container = threeRef.current;
    if (!container) return;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const violetLight = new THREE.PointLight(0x8a3ffc, 3, 20);
    violetLight.position.set(5, 5, 5);
    scene.add(violetLight);

    const cyanLight = new THREE.PointLight(0x00f0ff, 2, 20);
    cyanLight.position.set(-5, -5, 5);
    scene.add(cyanLight);

    const geometry = new THREE.IcosahedronGeometry(2, 2);
    const material = new THREE.MeshPhongMaterial({
      color: 0x0a0f28,
      emissive: 0x05081a,
      specular: 0x8a3ffc,
      shininess: 120,
      transparent: true,
      opacity: 0.85
    });
    
    const core = new THREE.Mesh(geometry, material);
    scene.add(core);

    const wireframeGeom = new THREE.IcosahedronGeometry(2.15, 2);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const wireframe = new THREE.Mesh(wireframeGeom, wireframeMat);
    scene.add(wireframe);

    const particlesGeom = new THREE.BufferGeometry();
    const particlesCount = 800;
    const posArray = new Float32Array(particlesCount * 3);
    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 8;
    }
    particlesGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.015,
      color: 0xc0c1ff
    });
    const particleSystem = new THREE.Points(particlesGeom, particlesMat);
    scene.add(particleSystem);

    let animationFrameId: number;
    const animate = () => {
      const time = Date.now() * 0.001;
      core.rotation.y += 0.003;
      wireframe.rotation.y -= 0.002;
      core.scale.setScalar(1 + Math.sin(time) * 0.03);
      wireframe.scale.setScalar(1 + Math.sin(time) * 0.03);
      particleSystem.rotation.y += 0.0008;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      wireframeGeom.dispose();
      wireframeMat.dispose();
      particlesGeom.dispose();
      particlesMat.dispose();
    };
  }, []);

  // --- Live Ticker Counting Simulation ---
  useEffect(() => {
    const timer = setInterval(() => {
      setDynamicIncidents(prev => prev + Math.floor(Math.random() * 2) + 1);
      setClusteringLatency(30.2 + Math.random() * 4.4);
    }, 2500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // --- Simulated API dispatch for ML Pipeline Node 4 ---
  const runSimulatedDispatch = () => {
    setDispatchStatus('SENDING');
    setDispatchPayload('');
    setTimeout(() => {
      setDispatchStatus('SUCCESS');
      setDispatchPayload(JSON.stringify({
        status: "BROADCASTED",
        incident_id: "INC-DET-883",
        severity_level: "CRITICAL",
        notified_hubs: ["Upparpet Police Station", "ASTraM Control Center"],
        response_latency_ms: 12.5
      }, null, 2));
    }, 1500);
  };

  const handleCTA = () => {
    if (isLoggedIn) {
      navigate(userRole === 'operator' ? '/dashboard' : '/reporting');
    } else {
      navigate('/login');
    }
  };

  // --- ML Pipeline Stages Metadata ---
  const pipelineStages = [
    { title: 'Data Ingestion', icon: 'cloud_download', subtitle: 'ASTraM Log Streaming' },
    { title: 'DBSCAN Spatial', icon: 'bubble_chart', subtitle: 'Spatial Clustering' },
    { title: 'Congestion Score', icon: 'calculate', subtitle: 'Telemetry Calculation' },
    { title: 'Orchestrated dispatch', icon: 'local_police', subtitle: 'Autonomous Alerts' },
  ];

  // --- DBSCAN Scatter Plot Simulation Data ---
  const dbscanPoints = [
    // Cluster 1 (Shivajinagar mockup)
    { x: 30, y: 35, clusterId: 1 },
    { x: 34, y: 32, clusterId: 1 },
    { x: 28, y: 38, clusterId: 1 },
    { x: 32, y: 40, clusterId: 1 },
    { x: 36, y: 36, clusterId: 1 },
    // Cluster 2 (Malleshwaram mockup)
    { x: 70, y: 65, clusterId: 2 },
    { x: 72, y: 60, clusterId: 2 },
    { x: 68, y: 68, clusterId: 2 },
    { x: 74, y: 62, clusterId: 2 },
    { x: 76, y: 66, clusterId: 2 },
    // Outliers (Noise)
    { x: 20, y: 75, clusterId: 0 },
    { x: 85, y: 25, clusterId: 0 },
    { x: 50, y: 48, clusterId: 0 }
  ];

  const getDistance = (p1: {x: number, y: number}, p2: {x: number, y: number}) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const getDBSCANPointColor = (pt: {x: number, y: number, clusterId: number}) => {
    if (dbscanEpsilon < 1.8) {
      return 'fill-[#849495] stroke-[#3b494b]'; // Noise
    }
    if (dbscanEpsilon >= 4.2) {
      return 'fill-[#00f0ff] stroke-[#008899] shadow-sm'; // All merged
    }
    // Normal clustering
    if (pt.clusterId === 1) return 'fill-[#00f0ff] stroke-[#00a2b0]';
    if (pt.clusterId === 2) return 'fill-[#c0c1ff] stroke-[#8183e8]';
    return 'fill-[#849495] stroke-[#3b494b]'; // Outlier
  };

  return (
    <div className="relative min-h-screen text-on-surface select-none overflow-x-hidden pt-24 pb-32">
      {/* Background WebGL Shader Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 -z-10 w-full h-full pointer-events-none opacity-40" />

      {/* Embedded CSS for grid backgrounds */}
      <style>{`
        .grid-bg {
          background-size: 20px 20px;
          background-image: 
            linear-gradient(to right, rgba(0, 240, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 240, 255, 0.04) 1px, transparent 1px);
        }
      `}</style>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-24">
        
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center">
          <div className="max-w-4xl mx-auto">
            
            {/* Title / Description / CTA Buttons (Stagger 1 & 2) */}
            <div className="space-y-6">
              <ScrollReveal direction="up" delay={0}>
                <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container border border-outline-variant/40 text-xs font-bold uppercase tracking-widest">
                  URBAN MOBILITY &amp; COMPLIANCE
                </span>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={150}>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  AI-Driven Congestion &amp; <br />
                  <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Parking Intelligence
                  </span>
                </h1>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={300}>
                <p className="text-sm md:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed font-inter">
                  Detecting illegal parking hotspots and quantifying traffic congestion impact in real time. We enable municipal traffic authorities to deploy targeted enforcement and restore road capacities.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={450}>
                <div className="flex flex-wrap justify-center gap-6 pt-4">
                  <button 
                    onClick={handleCTA}
                    className="bg-secondary text-on-secondary px-8 py-3 rounded-full font-bold text-sm hover:scale-[1.03] active:scale-[0.98] hover:shadow-[0_0_30px_rgba(192,193,255,0.35)] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">login</span>
                    {isLoggedIn ? 'Open Console' : 'Get Started'}
                  </button>
                  <button 
                    onClick={() => navigate('/login')}
                    className="glass-panel border border-outline-variant/60 text-on-surface px-8 py-3 rounded-full font-bold text-sm hover:bg-white/5 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    Report a Violation <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </ScrollReveal>
            </div>

            {/* 3D Data Globe (Hero Visual) - Moved below the Title & Buttons */}
            <ScrollReveal direction="up" delay={600}>
              <div ref={threeRef} className="mx-auto w-80 h-80 flex items-center justify-center mt-6" />
            </ScrollReveal>
          </div>
        </section>

        {/* Live Analytics Ticker Section */}
        <section className="relative z-10 -mt-10 py-6">
          <ScrollReveal direction="up" delay={100}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              
              {/* Stat 1: Incidents Ingested */}
              <div className="glass-panel p-6 rounded-2xl border border-outline-variant/40 shadow-md relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full pointer-events-none transition-all group-hover:bg-primary/10"></div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Incidents Ingested</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Telemetry Feed Active"></div>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-primary font-mono">
                    {dynamicIncidents.toLocaleString()}
                  </h3>
                  <p className="text-[10px] text-on-surface-variant mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-emerald-400">trending_up</span>
                    Total ASTraM violation dataset
                  </p>
                </div>
              </div>

              {/* Stat 2: Clustered Spatial Hotspots */}
              <div className="glass-panel p-6 rounded-2xl border border-outline-variant/40 shadow-md relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 blur-2xl rounded-full pointer-events-none transition-all group-hover:bg-secondary/10"></div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Spatial Hotspots</span>
                  <span className="material-symbols-outlined text-xs text-primary font-bold">hub</span>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-secondary font-mono">
                    {totalHotspots}
                  </h3>
                  <p className="text-[10px] text-on-surface-variant mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-primary font-bold">radar</span>
                    Density clusters identified
                  </p>
                </div>
              </div>

              {/* Stat 3: Average Congestion Score */}
              <div className="glass-panel p-6 rounded-2xl border border-outline-variant/40 shadow-md relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full pointer-events-none transition-all group-hover:bg-primary/10"></div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Avg Congestion Index</span>
                  <span className="material-symbols-outlined text-xs text-secondary font-bold">verified</span>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-primary font-mono">
                    {avgCongestionScore.toFixed(1)} idx
                  </h3>
                  <p className="text-[10px] text-on-surface-variant mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-secondary">update</span>
                    Calculated by ML model
                  </p>
                </div>
              </div>

              {/* Stat 4: Clustering Run-time Latency */}
              <div className="glass-panel p-6 rounded-2xl border border-outline-variant/40 shadow-md relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 blur-2xl rounded-full pointer-events-none transition-all group-hover:bg-secondary/10"></div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Clustering Speed</span>
                  <span className="material-symbols-outlined text-xs text-emerald-400">speed</span>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-secondary font-mono">
                    {clusteringLatency.toFixed(1)}ms
                  </h3>
                  <p className="text-[10px] text-on-surface-variant mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-emerald-400">timer</span>
                    DBSCAN execution latency
                  </p>
                </div>
              </div>

            </div>
          </ScrollReveal>
        </section>

        {/* The Anatomy of Smart Parking */}
        <section className="py-12">
          <ScrollReveal direction="up">
            <div className="mb-16 text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">The Anatomy of Smart Parking</h2>
              <div className="h-1 w-20 bg-secondary/80 mx-auto rounded-full mt-3"></div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Step 1 */}
            <ScrollReveal direction="left" delay={0}>
              <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group border border-outline-variant/60 shadow-sm hover:border-secondary/40 hover:-translate-y-1 transition-all h-full">
                <div className="absolute top-0 right-0 p-6 text-3xl font-black opacity-5 text-secondary italic">01</div>
                <div className="w-12 h-12 bg-secondary/15 rounded-xl flex items-center justify-center mb-6 border border-secondary/25">
                  <span className="material-symbols-outlined text-secondary">router</span>
                </div>
                <h3 className="text-lg font-bold mb-3">Distributed Edge Sensors</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  High-precision LiDAR and optical sensors detect vehicle occupancy with 99.9% accuracy, processing data at the edge for sub-millisecond latency.
                </p>
              </div>
            </ScrollReveal>

            {/* Step 2 */}
            <ScrollReveal direction="up" delay={200}>
              <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group border border-outline-variant/60 shadow-sm hover:border-secondary/40 hover:-translate-y-1 transition-all h-full">
                <div className="absolute top-0 right-0 p-6 text-3xl font-black opacity-5 text-secondary italic">02</div>
                <div className="w-12 h-12 bg-secondary/15 rounded-xl flex items-center justify-center mb-6 border border-secondary/25">
                  <span className="material-symbols-outlined text-secondary">psychology</span>
                </div>
                <h3 className="text-lg font-bold mb-3">Neural Violation Detection</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Automated identification of overstays and illegal parking zones using proprietary computer vision models trained on millions of urban scenarios.
                </p>
              </div>
            </ScrollReveal>

            {/* Step 3 */}
            <ScrollReveal direction="right" delay={400}>
              <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group border border-outline-variant/60 shadow-sm hover:border-secondary/40 hover:-translate-y-1 transition-all h-full">
                <div className="absolute top-0 right-0 p-6 text-3xl font-black opacity-5 text-secondary italic">03</div>
                <div className="w-12 h-12 bg-secondary/15 rounded-xl flex items-center justify-center mb-6 border border-secondary/25">
                  <span className="material-symbols-outlined text-secondary">settings_input_component</span>
                </div>
                <h3 className="text-lg font-bold mb-3">Real-time Orchestration</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Centralized dashboard for city planners to adjust dynamic pricing, manage emergency access, and predict traffic bottlenecks before they happen.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Visual ML Pipeline Flow */}
        <section className="py-12 grid-bg p-8 rounded-3xl border border-outline-variant/40 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

          <ScrollReveal direction="up">
            <div className="mb-12 text-center">
              <span className="text-xs font-bold text-secondary uppercase tracking-widest mb-2 block">System Engineering</span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Interactive ML Pipeline Showcase</h2>
              <div className="h-1 w-20 bg-secondary/80 mx-auto rounded-full mt-3"></div>
            </div>
          </ScrollReveal>

          {/* Flow Diagram Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10 mb-12">
            {pipelineStages.map((stage, idx) => {
              const isActive = activeStage === idx;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveStage(idx);
                    if (idx === 3) setDispatchStatus('IDLE');
                  }}
                  className={`glass-panel p-4 rounded-xl border transition-all text-center cursor-pointer relative group ${
                    isActive
                      ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'border-outline-variant/40 hover:border-secondary/40'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-3 transition-colors ${
                    isActive ? 'bg-primary text-[#00363a]' : 'bg-surface-container text-[#c0c1ff]'
                  }`}>
                    <span className="material-symbols-outlined text-sm">{stage.icon}</span>
                  </div>
                  <h4 className="text-[11px] font-bold tracking-wide uppercase text-on-surface">{stage.title}</h4>
                  <p className="text-[9px] text-on-surface-variant mt-1">{stage.subtitle}</p>

                  {/* Connective Line (Hidden on mobile) */}
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-2.5 w-5 h-[1.5px] -translate-y-1/2 z-20">
                      <div className={`h-full w-full ${isActive ? 'bg-primary animate-pulse' : 'bg-outline-variant/60'}`}></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Interactive Console Pane Below Flow */}
          <div className="glass-panel border border-outline-variant/60 rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-12">
            
            {/* Description Column (Col 5) */}
            <div className="md:col-span-5 p-8 border-b md:border-b-0 md:border-r border-outline-variant/40 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold font-mono tracking-widest text-primary uppercase">Pipeline Stage 0{activeStage + 1}</span>
                <h3 className="text-lg font-bold mt-2 text-on-surface">{pipelineStages[activeStage].title}</h3>
                
                {/* Dynamic explanations */}
                {activeStage === 0 && (
                  <p className="text-xs text-on-surface-variant leading-relaxed mt-4">
                    Ingests GPS metadata logs directly from municipal transit authority servers (ASTraM) alongside crowdsourced reports from the mobile compliance portal. Handles missing data coordinates and resolves baseline discrepancies.
                  </p>
                )}
                {activeStage === 1 && (
                  <p className="text-xs text-on-surface-variant leading-relaxed mt-4">
                    Applies the Density-Based Spatial Clustering (DBSCAN) algorithm over coordinates. Groups discrete coordinates into dense spatial regions, detecting multi-vehicle infractions while ignoring outlier noise reports.
                  </p>
                )}
                {activeStage === 2 && (
                  <p className="text-xs text-on-surface-variant leading-relaxed mt-4">
                    Calculates a weighted Congestion Impact Index. Integrates violation duration, local road width metrics, and cluster vehicle density to establish traffic severity levels: LOW, MEDIUM, or HIGH.
                  </p>
                )}
                {activeStage === 3 && (
                  <p className="text-xs text-on-surface-variant leading-relaxed mt-4">
                    Dispatches dynamic notification payloads directly to local patrol terminals. Initiates autopilot route guidance and syncs details in real time with the traffic monitoring database.
                  </p>
                )}
              </div>

              <div className="mt-8 pt-4 border-t border-outline-variant/30 flex items-center gap-2">
                <span className="material-symbols-outlined text-xs text-primary">analytics</span>
                <span className="text-[10px] font-mono text-on-surface-variant">Active Pipeline Node: Ready</span>
              </div>
            </div>

            {/* Interactive Panel Content Column (Col 7) */}
            <div className="md:col-span-7 p-8 bg-[#020a14] flex flex-col justify-center">
              
              {/* STAGE 1: Data Ingest JSON mockup */}
              {activeStage === 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
                    <span className="text-xs font-mono text-[#00f0ff]">Raw ASTraM Payload:</span>
                    <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">Live Stream</span>
                  </div>
                  <pre className="text-[10px] font-mono text-emerald-400 leading-relaxed overflow-x-auto select-text max-h-[180px] scrollbar-thin">
{`{
  "sensor_id": "ASTRAM-EDGE-MALL-04",
  "timestamp": "${new Date().toISOString()}",
  "location": {
    "latitude": 12.99042,
    "longitude": 77.57381
  },
  "raw_telemetry": {
    "road_occupancy": 0.82,
    "idle_count": 4,
    "avg_velocity_kmh": 4.5
  }
}`}
                  </pre>
                </div>
              )}

              {/* STAGE 2: DBSCAN scatter plot simulation */}
              {activeStage === 1 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs font-bold text-on-surface">Clustering Radius (Epsilon: {dbscanEpsilon.toFixed(1)} | MinPts: {dbscanMinPts})</span>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.2"
                      value={dbscanEpsilon}
                      onChange={(e) => setDbscanEpsilon(parseFloat(e.target.value))}
                      className="w-32 h-1 bg-[#122131] rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Scatter plot simulation using SVG */}
                  <div className="h-[180px] border border-outline-variant/30 rounded-xl relative overflow-hidden bg-[#051424] flex items-center justify-center">
                    <svg className="w-full h-full">
                      {/* Connection lines */}
                      {dbscanPoints.map((pt1, idx1) => {
                        return dbscanPoints.map((pt2, idx2) => {
                          if (idx1 >= idx2) return null;
                          const dist = getDistance(pt1, pt2);
                          if (dist <= dbscanEpsilon * 8) {
                            return (
                              <line
                                key={`${idx1}-${idx2}`}
                                x1={`${pt1.x}%`}
                                y1={`${pt1.y}%`}
                                x2={`${pt2.x}%`}
                                y2={`${pt2.y}%`}
                                className="stroke-primary/30 stroke-[0.75px]"
                              />
                            );
                          }
                          return null;
                        });
                      })}

                      {/* Epsilon radius guide (Draw on Hover/Interaction) */}
                      {dbscanPoints.map((pt, idx) => (
                        <circle
                          key={`rad-${idx}`}
                          cx={`${pt.x}%`}
                          cy={`${pt.y}%`}
                          r={dbscanEpsilon * 5}
                          className="fill-transparent stroke-primary/5 stroke-[0.5px]"
                        />
                      ))}

                      {/* Coordinate Nodes */}
                      {dbscanPoints.map((pt, idx) => (
                        <circle
                          key={`pt-${idx}`}
                          cx={`${pt.x}%`}
                          cy={`${pt.y}%`}
                          r="3.5"
                          className={`transition-colors duration-300 ${getDBSCANPointColor(pt)}`}
                        />
                      ))}
                    </svg>

                    {/* Legends */}
                    <div className="absolute bottom-2 left-2 flex gap-3 text-[8px] font-mono">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span>Cluster 1</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                        <span>Cluster 2</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#849495]"></div>
                        <span>Outliers</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 3: Congestion Formula builder */}
              {activeStage === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-outline-variant/30 pb-3 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-[#849495] uppercase">Congestion impact index equation:</span>
                    <span className="text-[11px] font-mono text-primary font-extrabold">
                      Score: {(weightDuration * 40 + weightDensity * 35 + weightObstruction * 25).toFixed(1)} idx
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Weight 1 */}
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[10px] font-mono text-on-surface-variant w-24">w₁ Duration</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={weightDuration}
                        onChange={(e) => setWeightDuration(parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-[#122131] rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-[10px] font-mono text-primary w-6 text-right">{(weightDuration).toFixed(1)}</span>
                    </div>

                    {/* Weight 2 */}
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[10px] font-mono text-on-surface-variant w-24">w₂ Density</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={weightDensity}
                        onChange={(e) => setWeightDensity(parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-[#122131] rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-[10px] font-mono text-primary w-6 text-right">{(weightDensity).toFixed(1)}</span>
                    </div>

                    {/* Weight 3 */}
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[10px] font-mono text-on-surface-variant w-24">w₃ Obstruction</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={weightObstruction}
                        onChange={(e) => setWeightObstruction(parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-[#122131] rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-[10px] font-mono text-primary w-6 text-right">{(weightObstruction).toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Indicator Box */}
                  <div className="bg-[#0b1c2d] border border-outline-variant/30 p-3 rounded-lg flex items-center justify-between mt-2">
                    <span className="text-[10px] text-on-surface-variant uppercase font-mono">Dynamic Priority Alert Level:</span>
                    <span className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded ${
                      (weightDuration * 40 + weightDensity * 35 + weightObstruction * 25) >= 30
                        ? 'bg-error-container text-error'
                        : 'bg-[#122131] text-[#00f0ff]'
                    }`}>
                      {(weightDuration * 40 + weightDensity * 35 + weightObstruction * 25) >= 30 ? 'CRITICAL LEVEL' : 'MEDIUM LEVEL'}
                    </span>
                  </div>
                </div>
              )}

              {/* STAGE 4: Autopilot Dispatch Simulation */}
              {activeStage === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
                    <span className="text-xs font-bold text-on-surface">Officer Dispatch API Terminal</span>
                    <span className="text-[9px] font-mono bg-[#122131] text-[#00f0ff] px-2 py-0.5 rounded">POST /v1/dispatch</span>
                  </div>

                  {dispatchStatus === 'IDLE' && (
                    <div className="text-center py-6">
                      <button
                        onClick={runSimulatedDispatch}
                        className="bg-primary text-[#00363a] font-bold text-xs px-6 py-3 rounded-xl hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer inline-flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">send</span>
                        Transmit Dispatch Request
                      </button>
                    </div>
                  )}

                  {dispatchStatus === 'SENDING' && (
                    <div className="flex flex-col items-center justify-center py-6 gap-3">
                      <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <span className="text-xs font-mono text-on-surface-variant animate-pulse">Encoding and transmitting payload...</span>
                    </div>
                  )}

                  {dispatchStatus === 'SUCCESS' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Broadcast dispatch payload succeeded
                      </div>
                      <pre className="text-[9px] font-mono text-[#00f0ff] leading-relaxed bg-[#0b1c2d] border border-outline-variant/30 p-3 rounded-lg overflow-x-auto">
                        {dispatchPayload}
                      </pre>
                      <button
                        onClick={() => setDispatchStatus('IDLE')}
                        className="text-[9px] font-mono text-[#849495] hover:text-[#00f0ff] transition-colors cursor-pointer"
                      >
                        [Reset Interface]
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-12">
          <ScrollReveal direction="up">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center mb-16">
              Gridlock Status Quo vs. AI-Optimized Infrastructure
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Card: Traditional Gridlock */}
            <ScrollReveal direction="left">
              <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-error/70 border-t-outline-variant/40 border-r-outline-variant/40 border-b-outline-variant/40 shadow-sm">
                <h3 className="text-lg font-bold mb-8 flex items-center gap-3 text-error">
                  <span className="material-symbols-outlined">dangerous</span> Traditional Gridlock
                </h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-error mt-0.5 shrink-0">close</span>
                    <div>
                      <p className="text-sm font-semibold">Reactive Patrols</p>
                      <p className="text-xs text-on-surface-variant mt-1">Human-dependent patrols with high response times and low coverage.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-error mt-0.5 shrink-0">close</span>
                    <div>
                      <p className="text-sm font-semibold">Curb Inefficiency</p>
                      <p className="text-xs text-on-surface-variant mt-1">30% of urban traffic is caused by drivers searching for street parking.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-error mt-0.5 shrink-0">close</span>
                    <div>
                      <p className="text-sm font-semibold">Economic Leakage</p>
                      <p className="text-xs text-on-surface-variant mt-1">Billions lost annually in CO2 emissions, lost productivity, and ticket bypasses.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </ScrollReveal>

            {/* Right Card: AI Optimized */}
            <ScrollReveal direction="right">
              <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-secondary/70 border-t-outline-variant/40 border-r-outline-variant/40 border-b-outline-variant/40 shadow-sm">
                <h3 className="text-lg font-bold mb-8 flex items-center gap-3 text-secondary">
                  <span className="material-symbols-outlined">bolt</span> AI-Optimized System
                </h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-secondary mt-0.5 shrink-0">check_circle</span>
                    <div>
                      <p className="text-sm font-semibold">Predictive Dispatch</p>
                      <p className="text-xs text-on-surface-variant mt-1">AI redirects enforcement officers to critical hotspots before gridlock clusters form.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-secondary mt-0.5 shrink-0">check_circle</span>
                    <div>
                      <p className="text-sm font-semibold">Dynamic Yield Controls</p>
                      <p className="text-xs text-on-surface-variant mt-1">Pre-emptive pricing and dynamic signage reduce curbside cruising time by 60%.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-secondary mt-0.5 shrink-0">check_circle</span>
                    <div>
                      <p className="text-sm font-semibold">Autonomous Compliance</p>
                      <p className="text-xs text-on-surface-variant mt-1">Instant digital validation, OCR license recognition, and frictionless citation flow.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* System Capabilities Grid */}
        <section className="py-12 space-y-12">
          <ScrollReveal direction="up">
            <div className="text-center">
              <span className="text-xs font-bold text-secondary uppercase tracking-widest mb-2 block">Core Infrastructure</span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">System Capabilities</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cap 1 */}
            <ScrollReveal direction="left" delay={0}>
              <div className="glass-panel p-6 rounded-2xl border border-outline-variant/60 shadow-sm hover:border-secondary/40 hover:-translate-y-1 transition-all h-full group">
                <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center mb-5 group-hover:text-secondary transition-colors">
                  <span className="material-symbols-outlined">monitoring</span>
                </div>
                <h4 className="text-sm font-bold mb-2">Predictive Analytics Hub</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Advanced forecasting of parking demand and congestion clusters using deep learning multi-modal models.
                </p>
              </div>
            </ScrollReveal>

            {/* Cap 2 */}
            <ScrollReveal direction="left" delay={150}>
              <div className="glass-panel p-6 rounded-2xl border border-outline-variant/60 shadow-sm hover:border-secondary/40 hover:-translate-y-1 transition-all h-full group">
                <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center mb-5 group-hover:text-secondary transition-colors">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <h4 className="text-sm font-bold mb-2">Automated Compliance</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Self-validating enforcement systems and OCR license extraction to streamline challan issuing.
                </p>
              </div>
            </ScrollReveal>

            {/* Cap 3 */}
            <ScrollReveal direction="right" delay={300}>
              <div className="glass-panel p-6 rounded-2xl border border-outline-variant/60 shadow-sm hover:border-secondary/40 hover:-translate-y-1 transition-all h-full group">
                <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center mb-5 group-hover:text-secondary transition-colors">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>
                <h4 className="text-sm font-bold mb-2">Dynamic Yield Management</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Algorithmically adjusted parking rates optimized to balance city accessibility with municipal commercial objectives.
                </p>
              </div>
            </ScrollReveal>

            {/* Cap 4 */}
            <ScrollReveal direction="right" delay={450}>
              <div className="glass-panel p-6 rounded-2xl border border-outline-variant/60 shadow-sm hover:border-secondary/40 hover:-translate-y-1 transition-all h-full group">
                <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center mb-5 group-hover:text-secondary transition-colors">
                  <span className="material-symbols-outlined">sensors</span>
                </div>
                <h4 className="text-sm font-bold mb-2">Omnichannel Monitoring</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  A unified control grid tracking active edge sensors and live patrol deployments on a dynamic map dashboard.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Interactive FAQ Accordion */}
        <section className="py-12 max-w-4xl mx-auto">
          <ScrollReveal direction="up">
            <div className="mb-12 text-center">
              <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2 block">Information Center</span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Deploy &amp; Scale Questions</h2>
              <div className="h-1 w-20 bg-primary/80 mx-auto rounded-full mt-3"></div>
            </div>
          </ScrollReveal>

          <div className="space-y-4">
            {[
              {
                q: "What is ASTraM and how does this application integrate with it?",
                a: "ASTraM (Actionable Intelligence for Sustainable Traffic Management) is the traffic management framework used by municipal authorities. Our application ingests ASTraM's spatial logs, matches them against citizen-reported violations, and provides automated, predictive hotspot analysis."
              },
              {
                q: "Why is DBSCAN used for spatial clustering instead of K-Means?",
                a: "DBSCAN (Density-Based Spatial Clustering of Applications with Noise) does not require specifying the number of clusters beforehand and excels at identifying arbitrarily-shaped congestion zones while discarding isolated outliers (noise), unlike K-Means which would force every single report into a cluster."
              },
              {
                q: "How does the citizen portal validate reports to prevent spam?",
                a: "Report verification uses a multi-faceted heuristic combining coordinate proximity, image timestamp validation, and user reputation scores. In a production setting, multiple matching citizen reports automatically elevates a violation's confidence score."
              },
              {
                q: "How is the Congestion Impact Score computed for each hotspot?",
                a: "The score (from 0 to 100) is calculated based on a weighted combination of total incident density within the DBSCAN spatial cluster, the average duration of parking violations, and local road width characteristics (obstruction level)."
              }
            ].map((faq, idx) => {
              const isOpen = openFAQ === idx;
              return (
                <ScrollReveal key={idx} direction="up" delay={idx * 100}>
                  <div className="glass-panel rounded-2xl overflow-hidden border border-outline-variant/60 transition-all duration-300">
                    <button
                      onClick={() => setOpenFAQ(isOpen ? null : idx)}
                      className="w-full text-left px-6 py-5 flex items-center justify-between text-on-surface hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <span className="text-sm font-bold tracking-wide">{faq.q}</span>
                      <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-on-surface-variant'}`}>
                        expand_more
                      </span>
                    </button>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-48 border-t border-outline-variant/30' : 'max-h-0'
                    }`}>
                      <div className="px-6 py-5 text-xs text-on-surface-variant leading-relaxed font-inter bg-[#0b1c2d]/20">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-12">
          <ScrollReveal direction="up">
            <div className="glass-panel p-12 md:p-16 rounded-3xl relative overflow-hidden border border-outline-variant/60 shadow-sm text-center">
              {/* Background accent glow */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full pointer-events-none"></div>
              
              <h2 className="text-xl md:text-3xl font-extrabold uppercase italic tracking-tight mb-8">
                Ready to align your enforcement operations?
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                <button 
                  onClick={handleCTA}
                  className="bg-secondary text-on-secondary px-8 py-3.5 rounded-full font-bold text-xs hover:scale-[1.03] active:scale-[0.98] hover:shadow-[0_0_20px_rgba(192,193,255,0.25)] transition-all w-full sm:w-auto cursor-pointer"
                >
                  Access Portal Console
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="glass-panel border border-outline-variant/60 text-on-surface px-8 py-3.5 rounded-full font-bold text-xs hover:bg-white/5 hover:scale-[1.03] active:scale-[0.98] transition-all w-full sm:w-auto cursor-pointer"
                >
                  View Roadmap
                </button>
              </div>
            </div>
          </ScrollReveal>
        </section>

      </div>
    </div>
  );
}
