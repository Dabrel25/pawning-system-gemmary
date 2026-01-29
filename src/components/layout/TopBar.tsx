import { Bell, Search, Moon, Sun } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { format } from "date-fns";
import { useTheme } from "@/hooks/use-theme.tsx";

export function TopBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-card border-b border-border px-8 flex items-center justify-between">
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <Input
          type="text"
          placeholder="Search loans, customers..."
          className="pl-10 h-10 bg-muted/50 border-0 focus-visible:ring-1"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Date */}
        <span className="text-sm text-text-secondary">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </span>

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
        </Button>
      </div>
    </header>
  );
}
