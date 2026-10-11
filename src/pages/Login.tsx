import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Mail, Lock, Eye, EyeOff, FilePlus2, Users, BarChart3, ShieldCheck } from "lucide-react";

const NAVY_GRADIENT = "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)";
const GOLD_GRADIENT = "linear-gradient(90deg, #f5d27a, #d4a017)";

/** Watch-dial ring of minute/hour ticks drawn around the logo. */
const DialRing = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
    <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
    <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(245,210,122,0.25)" strokeWidth="1" />
    {Array.from({ length: 60 }).map((_, i) => {
      const isHour = i % 5 === 0;
      const rad = ((i * 6 - 90) * Math.PI) / 180;
      const r1 = isHour ? 82 : 86;
      const r2 = 92;
      return (
        <line
          key={i}
          x1={100 + r1 * Math.cos(rad)}
          y1={100 + r1 * Math.sin(rad)}
          x2={100 + r2 * Math.cos(rad)}
          y2={100 + r2 * Math.sin(rad)}
          stroke={isHour ? "rgba(245,210,122,0.9)" : "rgba(255,255,255,0.25)"}
          strokeWidth={isHour ? 2 : 1}
          strokeLinecap="round"
        />
      );
    })}
  </svg>
);

/** The company logo (gold NT monogram) on its black tile. */
const LogoBadge = ({ size = "md" }: { size?: "sm" | "md" }) => (
  <div
    className={`flex items-center justify-center rounded-2xl bg-black ring-1 ring-[#d4a017]/50 shadow-lg shadow-black/40 ${
      size === "sm" ? "h-14 w-14" : "h-20 w-20"
    }`}
  >
    <img src="/logo.png" alt="Nilam Times" width={48} height={48} className="h-12 w-12" />
  </div>
);

const features = [
  { icon: FilePlus2, title: "Quick bill entry", text: "GST invoices with auto totals and round off" },
  { icon: Users, title: "Client records", text: "Every client's bills in one place" },
  { icon: BarChart3, title: "Sales reports", text: "Client-wise, weekly and monthly totals" },
];

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
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">

      {/* ── LEFT PANEL (desktop only) ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden text-white"
        style={{ background: NAVY_GRADIENT }}
      >
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full border border-white/10" />

        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-lg ring-1 ring-[#d4a017]/40" />
          <div className="leading-tight">
            <p className="font-black tracking-widest text-sm">NILAM TIMES</p>
            <p className="text-[10px] uppercase tracking-widest text-blue-300">Bill Entry System</p>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex h-72 w-72 items-center justify-center">
            <DialRing className="absolute inset-0 h-full w-full" />
            <LogoBadge />
          </div>

          <h2 className="mt-6 text-center text-3xl font-bold leading-snug">
            Precision in every{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: GOLD_GRADIENT }}>
              bill &amp; invoice
            </span>
          </h2>
          <p className="mt-2 max-w-sm text-center text-sm leading-relaxed text-blue-200">
            The bill entry system for the Nilam Times watch business.
          </p>

          <div className="mt-8 w-full max-w-sm space-y-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#d4a017]/15">
                  <Icon className="h-4 w-4 text-[#f5d27a]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="truncate text-xs text-blue-200">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-center text-xs uppercase tracking-widest text-blue-300/70">
          © {new Date().getFullYear()} Nilam Times · Rajkot
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-1/2 flex flex-col lg:justify-center">

        {/* Mobile top banner */}
        <div
          className="lg:hidden relative overflow-hidden flex flex-col items-center px-6 pt-10 pb-14 text-white"
          style={{ background: NAVY_GRADIENT }}
        >
          <div className="relative flex h-44 w-44 items-center justify-center">
            <DialRing className="absolute inset-0 h-full w-full" />
            <LogoBadge size="sm" />
          </div>
          <p className="mt-3 font-black tracking-[0.3em] text-lg">NILAM TIMES</p>
          <p className="text-[11px] uppercase tracking-widest text-blue-300">Bill Entry System</p>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-start lg:items-center justify-center px-4 sm:px-6 pb-10 lg:p-6 -mt-8 lg:mt-0">
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5">

            <div className="mb-7">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Welcome back</h1>
              <p className="mt-1.5 text-sm text-slate-500">Sign in to your bill entry dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-sm font-medium text-slate-700">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-sm placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-[#1d4ed8] focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-password" className="text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-sm placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-[#1d4ed8] focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div role="alert" className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                  <span className="mt-0.5">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-950/25 hover:brightness-110 disabled:opacity-70 disabled:shadow-none"
                style={{ background: NAVY_GRADIENT }}
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

            <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Only authorised Nilam Times staff can sign in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
