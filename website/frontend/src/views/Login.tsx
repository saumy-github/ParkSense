import React, { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, AlertCircle, ArrowLeft } from 'lucide-react';
// @ts-ignore
const Lightfall = React.lazy(() => import('../components/Lightfall'));

interface LoginProps {
  onLogin: (role: 'operator' | 'citizen') => void;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function Login({ onLogin, showToast }: LoginProps) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'operator' | 'citizen'>('operator');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'operator') {
      if (!username.trim() || !password.trim()) {
        showToast('Badge ID and Passcode are required.', 'error');
        return;
      }
      setLoading(true);
      try {
        await fetch('/api/login', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }) 
        });
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
      onLogin('operator');
    } else {
      setLoading(true);
      try {
        await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'citizen' })
        });
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
      onLogin('citizen');
    }
  };

  return (
    <div
      className="relative h-screen w-screen flex items-center justify-center overflow-hidden"
      style={{ background: '#121318', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Background canvas wrapper */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Suspense fallback={<div className="w-full h-full bg-[#0A29FF]" />}>
          <Lightfall
            colors={['#A6C8FF', '#5227FF', '#FF9FFC']}
            backgroundColor="#0A29FF"
            speed={0.5}
            streakCount={2}
            streakWidth={1}
            streakLength={1}
            glow={1}
            density={0.6}
            twinkle={1}
            zoom={3}
            backgroundGlow={0.5}
            opacity={1}
            mouseInteraction
            mouseStrength={0.5}
            mouseRadius={1}
            color1="#A6C8FF"
            color2="#5227FF"
            color3="#FF9FFC"
          />
        </Suspense>
      </div>

      {/* Card — max 90vh so it never overflows */}
      <main
        className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row overflow-hidden rounded-2xl border border-white/5 shadow-2xl mx-4"
        style={{ height: 'min(90vh, 640px)' }}
      >
        {/* ── LEFT: Brand visual panel ── */}
        <section
          className="hidden md:flex md:w-1/2 relative flex-col justify-between p-10 overflow-hidden shrink-0"
          style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #121318 100%)' }}
        >
          {/* Brand */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl text-blue-300">traffic</span>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tighter text-white leading-none">ParkSense</h1>
                <p className="text-sm font-medium text-blue-300/80 tracking-wide">ParkInsight Portal</p>
              </div>
            </div>
            <p className="text-blue-100/55 leading-relaxed text-sm">
              Advanced Surveillance &amp; Traffic Management. Secure law enforcement access for Bengaluru's parking-induced congestion intelligence system.
            </p>


          </div>

          {/* Illustration */}
          <div className="absolute inset-0 z-0 opacity-25 mix-blend-lighten pointer-events-none">
            <img
              alt="Civic Intelligence Illustration"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvr49N5ui7UKFxVOiay83B5KYsm1Oyc5jMrWKpPTe0xfOAv9CmBthsEgdtGRmJLux6Ic0xfG9SetfEsNxV0IdtXhI_-a1sAzdEOdtcyp12fPLkcp-HKtnQaCiGEInzmbXLPPNuoxbexqNO_LJ6rwrmwYfL84Gj6yyaYxzLXVT05JP4-3gcdnjXxdk7vq9rhd3ZF8jT1xCMaXFq6BiGay08-g2hIpIYbiT6BcdA_15YpVLznz5l6o0Ku02PHDyqIN4SNzf3Qi5rFIk"
            />
          </div>


        </section>

        {/* ── RIGHT: Form panel ── */}
        <section
          className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-12 py-8 overflow-y-auto"
          style={{ background: '#1a1b21' }}
        >
          {/* Mobile branding */}
          <div className="md:hidden mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="material-symbols-outlined text-xl text-blue-400">traffic</span>
              <h1 className="text-xl font-extrabold tracking-tighter text-white">ParkSense</h1>
            </div>
            <p className="text-xs text-blue-400 font-semibold">ParkInsight Portal</p>
          </div>

          {/* Header row: Welcome + Return to Home */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-0.5">Welcome back</h2>
              <p className="text-gray-400 text-xs">Authorization required</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-[13px] font-medium text-gray-300 bg-[#2a2b32] hover:bg-[#38393f] border border-[#38393f] hover:border-gray-500 px-3 py-2 rounded-lg transition-all shrink-0 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Home
            </button>
          </div>

          {/* Role toggle — smooth sliding indicator */}
          <div
            className="relative flex p-1 rounded-lg mb-6 gap-1"
            style={{ background: '#2a2b32' }}
          >
            {/* Sliding background pill */}
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md transition-all duration-300 ease-in-out"
              style={{
                background: '#2563eb',
                left: selectedRole === 'operator' ? '4px' : 'calc(50% + 0px)',
                boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
              }}
            />
            <button
              type="button"
              onClick={() => setSelectedRole('operator')}
              className="relative z-10 flex-1 py-2.5 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-colors duration-200 cursor-pointer"
              style={{ color: selectedRole === 'operator' ? '#fff' : '#9ca3af' }}
            >
              <Shield className="w-3.5 h-3.5" />
              Traffic Officer
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('citizen')}
              className="relative z-10 flex-1 py-2.5 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-colors duration-200 cursor-pointer"
              style={{ color: selectedRole === 'citizen' ? '#fff' : '#9ca3af' }}
            >
              <User className="w-3.5 h-3.5" />
              Citizen Reporter
            </button>
          </div>

          {/* Auth form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="h-39 flex flex-col justify-center">
              {selectedRole === 'operator' ? (
                <div className="space-y-4">
                  {/* Badge ID */}
                  <div className="relative">
                    <label
                      className="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-blue-400 z-10"
                      style={{ background: '#1a1b21' }}
                    >
                      Badge ID
                    </label>
                    <div
                      className="flex items-center border-2 rounded-lg px-3 py-2.5 transition-colors duration-200 focus-within:border-blue-500"
                      style={{ borderColor: '#38393f' }}
                    >
                      <svg className="w-4 h-4 text-gray-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                      </svg>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="BTP-Badge-No"
                        className="bg-transparent border-none focus:ring-0 focus:outline-none text-white w-full placeholder-gray-600 text-sm"
                      />
                    </div>
                  </div>

                  {/* Passcode */}
                  <div className="relative">
                    <label
                      className="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-blue-400 z-10"
                      style={{ background: '#1a1b21' }}
                    >
                      Security Passcode
                    </label>
                    <div
                      className="flex items-center border-2 rounded-lg px-3 py-2.5 transition-colors duration-200 focus-within:border-blue-500"
                      style={{ borderColor: '#38393f' }}
                    >
                      <svg className="w-4 h-4 text-gray-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                      </svg>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="bg-transparent border-none focus:ring-0 focus:outline-none text-white w-full placeholder-gray-600 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <span className="text-[11px] text-gray-600 hover:text-blue-400 transition-colors cursor-pointer">
                      Forgot passcode?
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className="p-4 rounded-xl border space-y-2"
                  style={{ background: 'rgba(99,102,241,0.07)', borderColor: 'rgba(99,102,241,0.18)' }}
                >
                  <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Anonymized Citizen Report Flow
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    No badge credentials required. Log in instantly to flag double-parking and sidewalk blockages. Your identity is anonymized.
                  </p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 font-bold text-white rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer text-sm tracking-widest uppercase"
              style={{ background: '#2563eb' }}
              onMouseEnter={(e) => {
                if (!loading) {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = '#3b82f6';
                  el.style.boxShadow = '0 0 20px rgba(99,102,241,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = '#2563eb';
                el.style.boxShadow = 'none';
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="border-2 border-white/30 border-t-white h-4 w-4 rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                'Login to System'
              )}
            </button>
          </form>


        </section>
      </main>
    </div>
  );
}
