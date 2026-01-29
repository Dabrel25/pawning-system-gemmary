import { cn } from "@/lib/utils.ts";
import { Camera, X } from "lucide-react";
import { Button } from "./button.tsx";

interface PhotoCaptureProps {
  label: string;
  id: string;
  captured?: string;
  onCapture: (id: string, file: File) => void;
  onRemove?: (id: string) => void;
  className?: string;
}

export function PhotoCapture({
  label,
  id,
  captured,
  onCapture,
  onRemove,
  className,
}: PhotoCaptureProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(id, file);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-body font-medium text-text-primary">{label}</label>
      {!captured ? (
        <label
          htmlFor={id}
          className="photo-capture-zone w-full aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer group"
        >
          <Camera className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-sm text-text-secondary font-medium">Tap to Capture</span>
          <input
            id={id}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="relative w-full aspect-square">
          <img
            src={captured}
            alt={label}
            className="w-full h-full object-cover rounded-lg"
          />
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
            onClick={() => onRemove?.(id)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
