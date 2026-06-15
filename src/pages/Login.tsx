import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

const WatchIllustration = () => (
  <svg viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-56 h-72 drop-shadow-2xl">
    {/* Watch strap top */}
    <rect x="72" y="0" width="56" height="55" rx="8" fill="url(#strapGrad)" />
    <rect x="80" y="4" width="40" height="4" rx="2" fill="rgba(255,255,255,0.15)" />
    <rect x="80" y="12" width="40" height="4" rx="2" fill="rgba(255,255,255,0.1)" />
    <rect x="80" y="20" width="40" height="4" rx="2" fill="rgba(255,255,255,0.1)" />
    <rect x="80" y="28" width="40" height="4" rx="2" fill="rgba(255,255,255,0.1)" />
    <rect x="80" y="36" width="40" height="4" rx="2" fill="rgba(255,255,255,0.1)" />
    <rect x="80" y="44" width="40" height="4" rx="2" fill="rgba(255,255,255,0.1)" />

    {/* Watch body */}
    <rect x="20" y="50" width="160" height="180" rx="36" fill="url(#bodyGrad)" />
    {/* Outer bezel */}
    <rect x="24" y="54" width="152" height="172" rx="33" fill="none" stroke="url(#bezelGrad)" strokeWidth="3" />
    {/* Inner bezel */}
    <circle cx="100" cy="140" r="68" fill="url(#dialGrad)" />
    <circle cx="100" cy="140" r="65" fill="none" stroke="rgba(255,215,0,0.3)" strokeWidth="1" />

    {/* Hour markers */}
    {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
      const rad = (deg - 90) * Math.PI / 180;
      const isMain = i % 3 === 0;
      const r1 = isMain ? 52 : 55;
      const r2 = isMain ? 60 : 58;
      const x1 = 100 + r1 * Math.cos(rad);
      const y1 = 140 + r1 * Math.sin(rad);
      const x2 = 100 + r2 * Math.cos(rad);
      const y2 = 140 + r2 * Math.sin(rad);
      return (
        <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={isMain ? "rgba(255,215,0,0.9)" : "rgba(255,215,0,0.4)"}
          strokeWidth={isMain ? 2.5 : 1.5} strokeLinecap="round" />
      );
    })}

    {/* Hour hand */}
    <line x1="100" y1="140" x2="100" y2="105" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
    {/* Minute hand */}
    <line x1="100" y1="140" x2="130" y2="118" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    {/* Second hand */}
    <line x1="100" y1="140" x2="85" y2="168" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
    {/* Center dot */}
    <circle cx="100" cy="140" r="4" fill="#FFD700" />
    <circle cx="100" cy="140" r="2" fill="white" />

    {/* Crown */}
    <rect x="178" y="128" width="12" height="24" rx="6" fill="url(#crownGrad)" />

    {/* Watch strap bottom */}
    <rect x="72" y="225" width="56" height="55" rx="8" fill="url(#strapGrad)" />
    <rect x="80" y="229" width="40" height="4" rx="2" fill="rgba(255,255,255,0.15)" />
    <rect x="80" y="237" width="40" height="4" rx="2" fill="rgba(255,255,255,0.1)" />
    <rect x="80" y="245" width="40" height="4" rx="2" fill="rgba(255,255,255,0.1)" />
    <rect x="80" y="253" width="40" height="4" rx="2" fill="rgba(255,255,255,0.1)" />
    <rect x="80" y="261" width="40" height="4" rx="2" fill="rgba(255,255,255,0.1)" />
    <rect x="80" y="269" width="40" height="4" rx="2" fill="rgba(255,255,255,0.1)" />

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
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0a0a1a 0%, #1a1a2e 40%, #16213e 100%)" }}
      >
        {/* Decorative rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-96 h-96 rounded-full border border-yellow-400/10 absolute -translate-x-1/2 -translate-y-1/2" />
          <div className="w-80 h-80 rounded-full border border-yellow-400/10 absolute -translate-x-1/2 -translate-y-1/2" style={{top:'-50%',left:'-50%'}}/>
          <div className="w-[500px] h-[500px] rounded-full border border-yellow-400/5 absolute" style={{top:'-50%',left:'-50%',transform:'translate(-50%,-50%)'}}/>
        </div>

        {/* Gold glow blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #FFD700, transparent 70%)", filter: "blur(40px)" }} />

        {/* Top branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full border-2 border-yellow-400 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
            </div>
            <span className="text-yellow-400 text-xs font-semibold tracking-[0.3em] uppercase">Nilam Times</span>
          </div>
        </div>

        {/* Center — watch + text */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          <WatchIllustration />
          <div className="text-center space-y-3">
            <h2 className="text-white text-3xl font-bold leading-snug">
              Precision in Every<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #FFD700, #FFA500)" }}>
                Bill & Invoice
              </span>
            </h2>
            <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
              The complete bill entry system for your watch business — fast, reliable, and elegant.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-8">
            {[{ label: "Invoices", val: "Fast" }, { label: "Clients", val: "Easy" }, { label: "Reports", val: "Smart" }].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-yellow-400 font-bold text-lg">{s.val}</p>
                <p className="text-gray-500 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-gray-600 text-xs text-center tracking-widest uppercase">
            © {new Date().getFullYear()} Nilam Times · All Rights Reserved
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-10 gap-2">
            <div className="w-12 h-12 rounded-full border-2 border-yellow-400 flex items-center justify-center bg-gray-900">
              <div className="w-4 h-4 rounded-full bg-yellow-400" />
            </div>
            <h1 className="text-2xl font-black tracking-widest text-gray-800">NILAM TIMES</h1>
            <p className="text-gray-400 text-xs tracking-widest uppercase">Bill Entry System</p>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Welcome back</h2>
            <p className="text-gray-400 mt-1.5 text-sm">Sign in to access your bill entry dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
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

            {/* Password */}
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

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                <span className="mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 mt-2"
              style={{
                background: loading
                  ? "#d1d5db"
                  : "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
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

          {/* Divider with feature badges */}
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
  );
};

export default Login;
