import { cn } from "@/lib/utils.ts";
import { LucideIcon, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  href: string;
  className?: string;
}

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  iconColor = "text-primary",
  href,
  className,
}: QuickActionCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        "block bg-card border border-border rounded-lg p-6 shadow-card",
        "hover:shadow-card-hover hover:border-primary/50 transition-all duration-200 group",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
          <Icon className={cn("w-8 h-8", iconColor)} />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-lg text-text-primary group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-text-secondary mt-1">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-text-tertiary group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}
