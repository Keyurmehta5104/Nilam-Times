import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { FileText, Search, BarChart3, Plus, Menu, X, LogOut } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Navigation */}
      <nav className="bg-blue-600 text-white shadow-lg no-print hidden xl:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <span className="text-2xl font-bold tracking-tight">NILAM TIMES</span>
              <span className="text-sm opacity-90">Bill Entry System</span>
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
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-white/20 text-white backdrop-blur-sm"
                        : "hover:bg-white/10"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-white/10 ml-2 border border-white/30"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="bg-blue-600 text-white shadow-lg no-print xl:hidden sticky top-0" style={{zIndex: 1000}}>
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-white/10"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link to="/" className="flex items-center gap-2">
                <span className="text-xl font-bold">NILAM TIMES</span>
              </Link>
            </div>
            
            {/* Mobile - Show only active page icon */}
            {navItems.map((item) => {
              if (location.pathname === item.href) {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="p-2 rounded-lg bg-white/20"
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              }
              return null;
            })}
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="pb-4 border-t border-white/20">
              <div className="pt-4 grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-colors",
                        isActive
                          ? "bg-white/20 text-white"
                          : "hover:bg-white/10"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-white/10 col-span-2 border border-white/30"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="xl:hidden fixed inset-0 bg-black bg-opacity-50 no-print"
          style={{zIndex: 998, marginTop: '64px'}}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="min-h-[calc(100vh-64px)]">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (for quick access) */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg mobile-bottom-nav no-print" style={{zIndex: 999}}>
        <div className="grid grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-3 text-xs transition-colors",
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Add padding to content for mobile bottom nav */}
      <style>{`
        @media (max-width: 1279px) {
          main {
            padding-bottom: 72px;
          }
        }
        
        /* Ensure bottom nav is above everything except modals */
        @media (max-width: 1279px) {
          .mobile-bottom-nav {
            z-index: 999 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
