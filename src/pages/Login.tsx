import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Mail, Lock, Newspaper, Eye, EyeOff } from "lucide-react";

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
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #1a56db 50%, #0ea5e9 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(-30%, 30%)" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-5"
          style={{ background: "white", transform: "translate(-50%, -50%)" }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />

        {/* Top branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
              <Newspaper className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-black tracking-widest">NILAM TIMES</h1>
              <p className="text-blue-200 text-xs tracking-widest uppercase">Bill Entry System</p>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-white text-4xl font-bold leading-tight mb-3">
              Manage Your<br />
              <span className="text-blue-200">Newspaper Bills</span><br />
              Effortlessly.
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed max-w-xs">
              A smart, fast, and reliable bill entry system designed specifically for newspaper agencies.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {["Invoice Management", "Client Search", "Reports", "PDF Export"].map((f) => (
              <span key={f} className="bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/20">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <div className="border-l-2 border-blue-300/50 pl-4">
            <p className="text-blue-100 text-sm italic">"Simplifying billing, one invoice at a time."</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="bg-blue-600 p-2.5 rounded-xl">
              <Newspaper className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-blue-700 text-xl font-black tracking-widest">NILAM TIMES</h1>
              <p className="text-gray-400 text-xs tracking-widest uppercase">Bill Entry System</p>
            </div>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Welcome back</h2>
            <p className="text-gray-400 mt-1.5 text-sm">Sign in to access your dashboard</p>
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 text-sm placeholder-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 text-sm placeholder-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 mt-2"
              style={{
                background: loading
                  ? "#93c5fd"
                  : "linear-gradient(135deg, #1a56db 0%, #0ea5e9 100%)",
                boxShadow: loading ? "none" : "0 4px 15px rgba(26, 86, 219, 0.35)",
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

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-10">
            © {new Date().getFullYear()} Nilam Times · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
