import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CalendarProps {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  initialMonth?: Date;
}

export function Calendar({
  selected,
  onSelect,
  className,
  initialMonth,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    () => selected || initialMonth || new Date()
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // First day of current month
  const firstDay = new Date(year, month, 1);
  const startingDayOfWeek = firstDay.getDay(); // 0 is Sunday

  // Days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Days in previous month
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Generate 42 cells (6 rows x 7 days)
  const days = [];

  // Previous month overflow days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month - 1, daysInPrevMonth - i);
    days.push({ date: prevDate, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(year, month, d);
    days.push({ date: curDate, isCurrentMonth: true });
  }

  // Next month overflow days
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const nextDate = new Date(year, month + 1, d);
    days.push({ date: nextDate, isCurrentMonth: false });
  }

  const isSameDay = (d1: Date, d2?: Date) => {
    if (!d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isToday = (d: Date) => isSameDay(d, new Date());

  return (
    <div className={cn("p-2 text-foreground select-none w-[252px]", className)}>
      {/* Calendar Month Header */}
      <div className="flex items-center justify-between pb-2 px-1">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="size-7 rounded-md border border-border hover:bg-muted flex items-center justify-center cursor-pointer transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Previous month"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <span className="text-xs font-semibold text-foreground font-sans">
          {monthName}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="size-7 rounded-md border border-border hover:bg-muted flex items-center justify-center cursor-pointer transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Next month"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 text-center py-1">
        {weekdays.map((wd) => (
          <span
            key={wd}
            className="text-[10px] font-mono font-medium text-muted-foreground"
          >
            {wd}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 pt-1">
        {days.map(({ date: dayDate, isCurrentMonth }, idx) => {
          const isSelected = isSameDay(dayDate, selected);
          const isTodayDate = isToday(dayDate);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect?.(dayDate)}
              className={cn(
                "size-8 rounded-md text-xs font-medium flex items-center justify-center transition-all cursor-pointer",
                isSelected
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : isTodayDate
                  ? "border border-primary text-primary font-bold hover:bg-primary/10"
                  : isCurrentMonth
                  ? "hover:bg-muted text-foreground"
                  : "text-muted-foreground/40 hover:bg-muted/30"
              )}
            >
              {dayDate.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;

