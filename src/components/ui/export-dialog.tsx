import { useState } from "react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { CalendarIcon, Download, FileSpreadsheet } from "lucide-react";
import { DateRange } from "react-day-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ExportDialogProps {
  title: string;
  description: string;
  onExport: (dateRange: { from: Date; to: Date } | null) => void;
  totalRecords: number;
  disabled?: boolean;
  children?: React.ReactNode;
}

const PRESET_RANGES = [
  { label: "Today", getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: "Last 7 days", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "Last 30 days", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: "This month", getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: "Last month", getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: "Last 3 months", getValue: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
  { label: "All time", getValue: () => null },
];

export function ExportDialog({
  title,
  description,
  onExport,
  totalRecords,
  disabled = false,
  children,
}: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedPreset, setSelectedPreset] = useState<string>("Last 30 days");

  const handlePresetClick = (preset: typeof PRESET_RANGES[0]) => {
    const range = preset.getValue();
    if (range) {
      setDateRange({ from: range.from, to: range.to });
    } else {
      setDateRange(undefined);
    }
    setSelectedPreset(preset.label);
  };

  const handleExport = () => {
    if (dateRange?.from && dateRange?.to) {
      onExport({ from: dateRange.from, to: dateRange.to });
    } else {
      onExport(null); // Export all
    }
    setOpen(false);
  };

  const formatDateRange = () => {
    if (!dateRange?.from) return "All time";
    if (!dateRange.to) return format(dateRange.from, "MMM d, yyyy");
    return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" disabled={disabled}>
            <Download className="w-5 h-5 mr-2" />
            Export CSV
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quick Presets */}
          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              Quick Select
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_RANGES.map((preset) => (
                <Button
                  key={preset.label}
                  variant={selectedPreset === preset.label ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              Or Select Custom Range
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDateRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    setSelectedPreset("");
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Export Info */}
          <div className="bg-muted/50 rounded-lg p-3 border border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Records to export:</span>
              <span className="font-semibold text-text-primary">
                {selectedPreset === "All time" ? totalRecords : `Up to ${totalRecords}`}
              </span>
            </div>
            <p className="text-xs text-text-tertiary mt-1">
              {selectedPreset === "All time"
                ? "All records will be exported"
                : "Records within the selected date range will be exported"}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
