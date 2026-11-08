import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      className,
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
    const isChecked =
      controlledChecked !== undefined ? controlledChecked : internalChecked;

    const toggle = () => {
      if (disabled) return;
      const nextChecked = !isChecked;
      if (controlledChecked === undefined) {
        setInternalChecked(nextChecked);
      }
      onCheckedChange?.(nextChecked);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggle();
      }
    };

    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={isChecked}
        id={id}
        ref={ref}
        disabled={disabled}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className={cn(
          "peer size-4 shrink-0 rounded-[4px] border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors flex items-center justify-center cursor-pointer",
          isChecked
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background border-input hover:border-foreground/40",
          className
        )}
        {...props}
      >
        {isChecked && <Check className="size-3 stroke-[3]" />}
      </button>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
