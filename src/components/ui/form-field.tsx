import { cn } from "@/lib/utils.ts";
import { AlertCircle } from "lucide-react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helper?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  required = false,
  error,
  helper,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="flex items-center gap-1 font-body font-medium text-text-primary text-sm">
        {label}
        {required && <span className="text-primary">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-sm text-error">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {helper && !error && (
        <p className="text-sm text-text-tertiary">{helper}</p>
      )}
    </div>
  );
}
