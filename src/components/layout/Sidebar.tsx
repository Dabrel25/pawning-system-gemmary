import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Plus,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import gemmaryLogo from "@/assets/gemmary_logo.jpg";
import { supabase } from "@/lib/supabase";

const SIDEBAR_STORAGE_KEY = "sidebar-collapsed";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  countKey?: string;
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "New Loan", href: "/loans/new", icon: Plus, badge: "Quick" },
  { name: "Active Loans", href: "/loans", icon: Package, countKey: "activeLoans" },
  { name: "Customers", href: "/customers", icon: Users, countKey: "customers" },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored === "true";
  });
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Fetch real counts from database
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [loansResult, customersResult] = await Promise.all([
          supabase.from('dim_loan').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('dim_customer').select('*', { count: 'exact', head: true }).eq('is_current', true),
        ]);

        setCounts({
          activeLoans: loansResult.count || 0,
          customers: customersResult.count || 0,
        });
      } catch (error) {
        console.error('Error fetching sidebar counts:', error);
      }
    };

    fetchCounts();

    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    navigate("/login");
  };

  return (
    <>
      <TooltipProvider delayDuration={0}>
        <aside
          className={cn(
            "bg-sidebar border-r border-sidebar-border shadow-sm flex flex-col h-full transition-all duration-300 relative",
            isCollapsed ? "w-[72px]" : "w-[280px]"
          )}
        >
          {/* Logo & Toggle */}
          <div className={cn(
            "border-b border-sidebar-border",
            isCollapsed ? "p-3" : "p-4"
          )}>
            <div className="flex items-center gap-3">
              {/* Hamburger Menu Toggle */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-md text-text-secondary hover:bg-sidebar-accent hover:text-sidebar-primary transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>

              {!isCollapsed && (
                <Link to="/" className="flex items-center gap-3">
                  <img
                    src={gemmaryLogo}
                    alt="Gemmary"
                    className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div>
                    <h1 className="font-heading font-bold text-lg text-text-primary italic">
                      Gemmary
                    </h1>
                    <p className="text-xs text-text-tertiary">Pawnshop & Jewellery</p>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              const linkContent = (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md font-body text-sm transition-colors duration-150",
                    isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-3",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-accent text-accent-foreground">
                          {item.badge}
                        </span>
                      )}
                      {item.countKey && counts[item.countKey] !== undefined && (
                        <span className="text-xs font-semibold text-text-tertiary">
                          {counts[item.countKey]}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="flex items-center gap-2">
                      {item.name}
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-accent text-accent-foreground">
                          {item.badge}
                        </span>
                      )}
                      {item.countKey && counts[item.countKey] !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          ({counts[item.countKey]})
                        </span>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className={cn(
              "flex items-center gap-3",
              isCollapsed ? "justify-center" : "px-4 py-3"
            )}>
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowLogoutConfirm(true)}
                      className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                    >
                      <span className="text-sm font-semibold text-primary">JS</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-medium">Juan Staff</p>
                    <p className="text-xs text-muted-foreground">Main Branch - Log out</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary">JS</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      Juan Staff
                    </p>
                    <p className="text-xs text-text-tertiary truncate">Main Branch</p>
                  </div>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="p-2 text-text-tertiary hover:text-primary transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>
      </TooltipProvider>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              This means that you would need to log in again with your credentials and receive a new verification code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
