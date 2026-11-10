import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Pick a date",
  className,
  buttonClassName,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const formattedDate = date && !isNaN(date.getTime())
    ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-7 px-2.5 text-xs font-mono justify-between text-left font-normal bg-background hover:bg-muted/40 shadow-2xs border-border cursor-pointer select-none",
            !formattedDate && "text-muted-foreground",
            buttonClassName
          )}
        >
          <span className="font-semibold text-foreground truncate mr-2">
            {formattedDate || placeholder}
          </span>
          <CalendarIcon className="size-3 text-muted-foreground shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-auto p-0", className)} align="start">
        <Calendar
          mode="single"
          selected={date && !isNaN(date.getTime()) ? date : undefined}
          onSelect={(selectedDate) => {
            onSelect?.(selectedDate);
            setOpen(false);
          }}
          initialMonth={date && !isNaN(date.getTime()) ? date : new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;
