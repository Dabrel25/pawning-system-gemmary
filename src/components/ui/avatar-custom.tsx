import { cn } from "@/lib/utils.ts";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

export function AvatarCustom({ src, alt = "Avatar", size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0",
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <User className={cn("text-text-tertiary", iconSizes[size])} />
      )}
    </div>
  );
}
