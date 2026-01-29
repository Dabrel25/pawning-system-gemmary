import { cn } from "@/lib/utils.ts";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  icon: LucideIcon;
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CategoryCard({
  icon: Icon,
  label,
  selected = false,
  onClick,
  className,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200",
        selected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border bg-card hover:border-accent hover:shadow-sm",
        className
      )}
    >
      <Icon
        className={cn(
          "w-8 h-8",
          selected ? "text-primary" : "text-text-tertiary"
        )}
      />
      <span
        className={cn(
          "text-sm font-body font-medium",
          selected ? "text-primary" : "text-text-secondary"
        )}
      >
        {label}
      </span>
    </button>
  );
}
