import { useState, useEffect } from 'react';

interface LoginProps {
  onLogin: (role: 'operator' | 'citizen') => void;
  setActivePage: (page: string) => void;
}

export default function Login({ onLogin, setActivePage }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<'operator' | 'citizen'>('operator');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Light mode background for landing/login pages
    document.documentElement.classList.add('light');
    return () => {
      document.documentElement.classList.remove('light');
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Mock verification
    setTimeout(() => {
      setLoading(false);
      if (selectedRole === 'operator') {
        // Mock operator credentials
        if (username.trim() === '' || password.trim() === '') {
          setError('Please fill in all fields.');
          return;
        }
        onLogin('operator');
      } else {
        // Citizen login (can be guest/quick login)
        onLogin('citizen');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface flex items-center justify-center p-6 pt-28 pb-20 transition-all duration-300">
      <div className="w-full max-w-md bg-white rounded-3xl border border-outline-variant shadow-2xl overflow-hidden flex flex-col p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-container text-primary mb-2">
            <span className="material-symbols-outlined text-2xl">traffic</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-primary">ASTraM ParkInsight</h2>
          <p className="text-xs text-on-surface-variant">Access the parking-induced congestion intelligence portal</p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 p-1 bg-surface-container rounded-xl border border-outline-variant/50">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('operator');
              setError(null);
            }}
            className={`py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              selectedRole === 'operator'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">shield</span>
            Traffic Officer
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedRole('citizen');
              setError(null);
            }}
            className={`py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              selectedRole === 'citizen'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">person</span>
            Citizen Reporter
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-error-container text-on-error-container rounded-xl text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          {selectedRole === 'operator' ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-wider text-outline uppercase block">Officer Badge ID</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">badge</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. OFFICER_884"
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant focus:outline-none focus:border-primary text-xs font-semibold text-on-surface"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-wider text-outline uppercase block">Security Passcode</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">lock</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant focus:outline-none focus:border-primary text-xs font-semibold text-on-surface"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-primary-container/20 text-on-primary-container rounded-2xl space-y-2 border border-primary/10">
              <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">campaign</span>
                Report violations anonymously
              </h4>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                As a citizen, you do not need badge credentials. You can report double-parking, sidewalk obstruction, and lane blockages directly to our AI routing engine.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-98 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <span>Authenticating Portal...</span>
                <span className="border-2 border-white/30 border-t-white h-4 w-4 rounded-full animate-spin"></span>
              </>
            ) : (
              <>
                <span>Enter Portal Console</span>
                <span className="material-symbols-outlined text-sm">login</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setActivePage('landing')}
            className="text-xs text-secondary font-bold hover:underline"
          >
            Back to Public Solutions Page
          </button>
        </div>
      </div>
    </div>
  );
}
