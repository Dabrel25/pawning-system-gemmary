import { cn } from "@/lib/utils.ts";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Plus,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import gemmaryLogo from "@/assets/gemmary_logo.jpg";
import { StatusBadge } from "@/components/ui/status-badge.tsx";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "New Loan", href: "/loans/new", icon: Plus, badge: "Quick" },
  { name: "Active Loans", href: "/loans", icon: Package, count: 127 },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-[280px] bg-sidebar border-r border-sidebar-border shadow-sm flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={gemmaryLogo}
            alt="Gemmary"
            className="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <h1 className="font-heading font-bold text-lg text-text-primary italic">
              Gemmary
            </h1>
            <p className="text-xs text-text-tertiary">Pawnshop & Jewellery</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md font-body text-sm transition-colors duration-150",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-accent text-accent-foreground">
                  {item.badge}
                </span>
              )}
              {item.count && (
                <span className="text-xs font-semibold text-text-tertiary">
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">JS</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              Juan Staff
            </p>
            <p className="text-xs text-text-tertiary truncate">J. Almirante corner R. Fernan St., Bogo City</p>
          </div>
          <button className="p-2 text-text-tertiary hover:text-primary transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
