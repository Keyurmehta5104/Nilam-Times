import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { FileText, Search, BarChart3, Plus, Menu, X, LogOut, Watch } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/", label: "New Invoice", icon: Plus },
  { href: "/invoices", label: "All Invoices", icon: FileText },
  { href: "/search", label: "Search Client", icon: Search },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Navigation */}
      <nav className="no-print hidden xl:block sticky top-0 z-50 shadow-md"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Watch className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-white font-black text-base tracking-widest">NILAM TIMES</span>
                <span className="text-blue-300 text-[10px] tracking-widest uppercase">Bill Entry System</span>
              </div>
            </Link>

            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-blue-100 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-blue-100 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 ml-2 border border-white/20"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="no-print xl:hidden sticky top-0 shadow-md" style={{ zIndex: 1000, background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)" }}>
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-white/10 text-white"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <Link to="/" className="flex items-center gap-2">
                <Watch className="h-4 w-4 text-blue-300" />
                <span className="text-white font-black tracking-widest text-sm">NILAM TIMES</span>
              </Link>
            </div>
            {navItems.map((item) => {
              if (location.pathname === item.href) {
                const Icon = item.icon;
                return (
                  <div key={item.href} className="bg-white/20 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-white" />
                    <span className="text-white text-xs font-medium">{item.label}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {isMobileMenuOpen && (
            <div className="pb-4 border-t border-white/10">
              <div className="pt-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium",
                        isActive
                          ? "bg-white text-blue-700"
                          : "text-blue-100 hover:bg-white/10"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 transition-colors text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="xl:hidden fixed inset-0 bg-black/40 backdrop-blur-sm no-print"
          style={{ zIndex: 998, marginTop: "56px" }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className="min-h-[calc(100vh-56px)] xl:min-h-[calc(100vh-64px)]">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg mobile-bottom-nav no-print" style={{ zIndex: 999 }}>
        <div className="grid grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-3 text-xs transition-all",
                  isActive
                    ? "text-blue-600"
                    : "text-slate-400 hover:text-blue-500"
                )}
              >
                <div className={cn("p-1.5 rounded-lg mb-0.5 transition-all", isActive ? "bg-blue-50" : "")}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 1279px) {
          main { padding-bottom: 72px; }
          .mobile-bottom-nav { z-index: 999 !important; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
