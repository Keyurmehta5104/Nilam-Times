import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, Watch } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 text-white"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)" }}
    >
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
          <Watch className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-6xl font-black tracking-widest">404</h1>
        <p className="mb-8 text-lg text-blue-200">This page doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#1e3a5f] shadow-sm transition-colors hover:bg-blue-50"
        >
          <Home className="h-4 w-4" /> Back to New Invoice
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
