import { cn } from "@/lib/utils.ts";
import { Check } from "lucide-react";

interface Step {
  number: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <StepItem
              number={step.number}
              label={step.label}
              active={currentStep === step.number}
              completed={currentStep > step.number}
            />
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4 min-w-[40px]",
                  currentStep > step.number ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface StepItemProps {
  number: number;
  label: string;
  active?: boolean;
  completed?: boolean;
}

function StepItem({ number, label, active = false, completed = false }: StepItemProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center font-heading font-semibold text-sm transition-all",
          completed && "bg-primary text-primary-foreground",
          active && !completed && "bg-primary text-primary-foreground ring-4 ring-primary/20",
          !active && !completed && "bg-muted text-text-tertiary"
        )}
      >
        {completed ? <Check className="w-5 h-5" /> : number}
      </div>
      <span
        className={cn(
          "text-sm font-body font-medium whitespace-nowrap",
          active || completed ? "text-primary" : "text-text-tertiary"
        )}
      >
        {label}
      </span>
    </div>
  );
}
