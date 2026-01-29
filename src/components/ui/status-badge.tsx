import { cn } from "@/lib/utils.ts";
import { Circle, Clock, AlertCircle, CheckCircle } from "lucide-react";

type BadgeVariant = "success" | "warning" | "error" | "info" | "default";

interface StatusBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  default: "bg-muted text-text-secondary",
};

export function StatusBadge({ variant = "default", children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full font-body font-semibold text-xs uppercase gap-1",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface LoanStatusBadgeProps {
  status: 'active' | 'due-soon' | 'overdue' | 'redeemed';
  daysUntilDue?: number;
}

export function LoanStatusBadge({ status, daysUntilDue = 0 }: LoanStatusBadgeProps) {
  if (status === 'active' && daysUntilDue > 7) {
    return (
      <StatusBadge variant="success">
        <Circle className="w-2 h-2 fill-current" />
        Active
      </StatusBadge>
    );
  }

  if (status === 'active' && daysUntilDue <= 7 && daysUntilDue > 0) {
    return (
      <StatusBadge variant="warning">
        <Clock className="w-3 h-3" />
        Due in {daysUntilDue} days
      </StatusBadge>
    );
  }

  if (status === 'due-soon') {
    return (
      <StatusBadge variant="warning">
        <Clock className="w-3 h-3" />
        Due Soon
      </StatusBadge>
    );
  }

  if (status === 'overdue') {
    return (
      <StatusBadge variant="error">
        <AlertCircle className="w-3 h-3" />
        Overdue {Math.abs(daysUntilDue)} days
      </StatusBadge>
    );
  }

  if (status === 'redeemed') {
    return (
      <StatusBadge variant="default">
        <CheckCircle className="w-3 h-3" />
        Redeemed
      </StatusBadge>
    );
  }

  return (
    <StatusBadge variant="default">
      <Circle className="w-2 h-2 fill-current" />
      {status}
    </StatusBadge>
  );
}
