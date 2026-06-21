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

interface LandingPageProps {
  isLoggedIn: boolean;
  userRole: 'operator' | 'citizen' | null;
}

export default function LandingPage({ isLoggedIn, userRole }: LandingPageProps) {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeRef = useRef<HTMLDivElement>(null);

  // Default to dark mode (remove light mode class)
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

  const handleCTA = () => {
    if (isLoggedIn) {
      navigate(userRole === 'operator' ? '/dashboard' : '/reporting');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="relative min-h-screen text-on-surface select-none overflow-x-hidden pt-24 pb-32">
      {/* Background Neural Flow WebGL Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 -z-10 w-full h-full pointer-events-none opacity-40" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-24">
        
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center">
          <div className="max-w-4xl mx-auto">
            {/* 3D Data Core (Stagger 1) */}
            <ScrollReveal direction="up" delay={0}>
              <div ref={threeRef} className="mx-auto w-80 h-80 flex items-center justify-center" />
            </ScrollReveal>

            {/* Title / Description / CTA Buttons (Stagger 2 & 3) */}
            <div className="mt-4 space-y-6">
              <ScrollReveal direction="up" delay={150}>
                <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container border border-outline-variant/40 text-xs font-bold uppercase tracking-widest">
                  URBAN MOBILITY 2.0
                </span>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={300}>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  AI-Driven Congestion &amp; <br />
                  <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Parking Intelligence
                  </span>
                </h1>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={450}>
                <p className="text-sm md:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                  Detecting illegal parking hotspots and quantifying traffic congestion impact in real time. We enable municipal traffic authorities to deploy targeted enforcement and restore road capacities.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={600}>
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
          </div>
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
            {/* Step 1: Slide in from Left */}
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

            {/* Step 2: Slide in from Bottom (Up) */}
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

            {/* Step 3: Slide in from Right */}
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

        {/* Comparison Section */}
        <section className="py-12">
          <ScrollReveal direction="up">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center mb-16">
              Gridlock Status Quo vs. AI-Optimized Infrastructure
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Card: Traditional Gridlock (Slide in from Left) */}
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

            {/* Right Card: AI Optimized (Slide in from Right) */}
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
                  A unified control grid tracking active cameras, edge sensors, and live patrol deployments on a dynamic map dashboard.
                </p>
              </div>
            </ScrollReveal>
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
