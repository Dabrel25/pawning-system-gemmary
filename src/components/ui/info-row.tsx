import { cn } from "@/lib/utils.ts";

interface InfoRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}

export function InfoRow({ label, value, highlight = false, className }: InfoRowProps) {
  return (
    <div
      className={cn(
        "flex justify-between items-center py-2 border-b border-border last:border-0",
        highlight && "bg-accent/10 px-2 -mx-2 rounded",
        className
      )}
    >
      <span className="text-text-tertiary text-sm">{label}</span>
      <span
        className={cn(
          "font-body font-medium text-right",
          highlight ? "text-brand-burgundy font-semibold" : "text-text-primary"
        )}
      >
        {value}
      </span>
    </div>
  );
}
