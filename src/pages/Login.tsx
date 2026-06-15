import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

const WatchIllustration = () => (
  <svg viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-48 h-64 drop-shadow-2xl">
    {/* Strap top */}
    <rect x="72" y="0" width="56" height="55" rx="8" fill="url(#strapGrad)" />
    {[4,12,20,28,36,44].map((y) => (
      <rect key={y} x="80" y={y} width="40" height="4" rx="2" fill="rgba(255,255,255,0.1)" />
    ))}
    {/* Watch body */}
    <rect x="20" y="50" width="160" height="180" rx="36" fill="url(#bodyGrad)" />
    <rect x="24" y="54" width="152" height="172" rx="33" fill="none" stroke="url(#bezelGrad)" strokeWidth="3" />
    <circle cx="100" cy="140" r="68" fill="url(#dialGrad)" />
    <circle cx="100" cy="140" r="65" fill="none" stroke="rgba(255,215,0,0.3)" strokeWidth="1" />
    {/* Hour markers */}
    {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
      const rad = (deg - 90) * Math.PI / 180;
      const isMain = i % 3 === 0;
      const r1 = isMain ? 52 : 55;
      const r2 = isMain ? 60 : 58;
      return (
        <line key={deg}
          x1={100 + r1 * Math.cos(rad)} y1={140 + r1 * Math.sin(rad)}
          x2={100 + r2 * Math.cos(rad)} y2={140 + r2 * Math.sin(rad)}
          stroke={isMain ? "rgba(255,215,0,0.9)" : "rgba(255,215,0,0.4)"}
          strokeWidth={isMain ? 2.5 : 1.5} strokeLinecap="round" />
      );
    })}
    {/* Hands */}
    <line x1="100" y1="140" x2="100" y2="105" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="100" y1="140" x2="130" y2="118" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="100" y1="140" x2="85" y2="168" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="100" cy="140" r="4" fill="#FFD700" />
    <circle cx="100" cy="140" r="2" fill="white" />
    {/* Crown */}
    <rect x="178" y="128" width="12" height="24" rx="6" fill="url(#crownGrad)" />
    {/* Strap bottom */}
    <rect x="72" y="225" width="56" height="55" rx="8" fill="url(#strapGrad)" />
    {[229,237,245,253,261,269].map((y) => (
      <rect key={y} x="80" y={y} width="40" height="4" rx="2" fill="rgba(255,255,255,0.1)" />
    ))}
    <defs>
      <linearGradient id="strapGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1a1a2e" />
        <stop offset="100%" stopColor="#16213e" />
      </linearGradient>
      <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#2d2d2d" />
        <stop offset="50%" stopColor="#1a1a1a" />
        <stop offset="100%" stopColor="#0d0d0d" />
      </linearGradient>
      <linearGradient id="bezelGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#FFA500" />
        <stop offset="100%" stopColor="#FFD700" />
      </linearGradient>
      <radialGradient id="dialGrad" cx="40%" cy="35%">
        <stop offset="0%" stopColor="#2a2a3e" />
        <stop offset="100%" stopColor="#0a0a1a" />
      </radialGradient>
      <linearGradient id="crownGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#888" />
        <stop offset="50%" stopColor="#ccc" />
        <stop offset="100%" stopColor="#888" />
      </linearGradient>
    </defs>
  </svg>
);

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── LEFT PANEL (desktop only) ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0a0a1a 0%, #1a1a2e 40%, #16213e 100%)" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #FFD700, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-yellow-400/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-yellow-400/5" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-yellow-400 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
          </div>
          <span className="text-yellow-400 text-xs font-semibold tracking-[0.3em] uppercase">Nilam Times</span>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          <WatchIllustration />
          <div className="text-center space-y-3">
            <h2 className="text-white text-3xl font-bold leading-snug">
              Precision in Every<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(90deg, #FFD700, #FFA500)" }}>
                Bill &amp; Invoice
              </span>
            </h2>
            <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
              The complete bill entry system for your watch business — fast, reliable, and elegant.
            </p>
          </div>
          <div className="flex gap-10">
            {[{ label: "Invoices", val: "Fast" }, { label: "Clients", val: "Easy" }, { label: "Reports", val: "Smart" }].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-yellow-400 font-bold text-lg">{s.val}</p>
                <p className="text-gray-500 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-gray-600 text-xs text-center tracking-widest uppercase">
            © {new Date().getFullYear()} Nilam Times · All Rights Reserved
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-1/2 flex flex-col lg:justify-center bg-gray-50">

        {/* Mobile top banner with watch */}
        <div
          className="lg:hidden relative overflow-hidden flex flex-col items-center pt-10 pb-8 px-6"
          style={{ background: "linear-gradient(145deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)" }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #FFD700, transparent 70%)", filter: "blur(30px)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-yellow-400/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-yellow-400/10" />

          <div className="relative z-10 flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full border-2 border-yellow-400 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
            </div>
            <span className="text-yellow-400 text-xs font-semibold tracking-[0.25em] uppercase">Nilam Times</span>
          </div>

          <div className="relative z-10">
            <WatchIllustration />
          </div>

          <div className="relative z-10 text-center mt-4">
            <h1 className="text-white text-xl font-bold">
              Precision in Every{" "}
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(90deg, #FFD700, #FFA500)" }}>
                Bill &amp; Invoice
              </span>
            </h1>
            <p className="text-gray-400 text-xs mt-1">Bill Entry System for Watch Business</p>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Welcome back</h2>
              <p className="text-gray-400 mt-1.5 text-sm">Sign in to access your bill entry dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-sm placeholder-gray-400 outline-none transition-all focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-11 py-3.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-sm placeholder-gray-400 outline-none transition-all focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                  <span className="mt-0.5">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: loading ? "#d1d5db" : "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                  color: loading ? "#6b7280" : "#FFD700",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(0,0,0,0.3)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-xs text-gray-400 mb-3">What you get access to</p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Invoice Entry", "Client Management", "Bill Reports", "PDF Export"].map((f) => (
                  <span key={f} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                    {f}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
