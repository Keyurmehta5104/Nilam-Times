import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { FileText, Search, BarChart3, Plus } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-muted">
      <nav className="bg-primary text-primary-foreground shadow-lg no-print">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold">NILAM TIMES</span>
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
                      "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "hover:bg-primary-foreground/10"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
