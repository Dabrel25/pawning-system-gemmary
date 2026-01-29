import { cn } from "@/lib/utils.ts";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "./card.tsx";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  subtext?: string;
  icon: LucideIcon;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  subtext,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("shadow-card hover:shadow-card-hover transition-shadow duration-200", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-body font-medium text-text-tertiary">{label}</p>
            <p className="text-2xl font-heading font-bold text-text-primary">{value}</p>
            {change && (
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  changeType === "positive" && "text-success",
                  changeType === "negative" && "text-error",
                  changeType === "neutral" && "text-text-tertiary"
                )}
              >
                {changeType === "positive" && <TrendingUp className="w-4 h-4" />}
                {changeType === "negative" && <TrendingDown className="w-4 h-4" />}
                <span>{change}</span>
              </div>
            )}
            {subtext && (
              <p className="text-sm text-text-tertiary">{subtext}</p>
            )}
          </div>
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
