import * as React from "react";
import { Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputOTPContextValue {
  value: string;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  maxLength: number;
}

const InputOTPContext = React.createContext<InputOTPContextValue | null>(null);

export interface InputOTPProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

const InputOTP = React.forwardRef<HTMLDivElement, InputOTPProps>(
  (
    {
      className,
      value: controlledValue,
      defaultValue = "",
      onChange,
      maxLength = 6,
      disabled = false,
      autoFocus = false,
      children,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [focusedIndex, setFocusedIndex] = React.useState<number>(autoFocus ? 0 : -1);
    const hiddenInputRef = React.useRef<HTMLInputElement | null>(null);

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const handleContainerClick = () => {
      if (disabled) return;
      hiddenInputRef.current?.focus();
      // Focus on the next empty index or last character
      const nextIndex = Math.min(value.length, maxLength - 1);
      setFocusedIndex(nextIndex);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, maxLength);
      if (!isControlled) {
        setInternalValue(raw);
      }
      onChange?.(raw);
      setFocusedIndex(Math.min(raw.length, maxLength - 1));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && value.length > 0) {
        // Backspace handled naturally by input change
      }
    };

    return (
      <InputOTPContext.Provider
        value={{
          value,
          focusedIndex,
          setFocusedIndex,
          maxLength,
        }}
      >
        <div
          ref={ref}
          onClick={handleContainerClick}
          className={cn(
            "relative flex items-center justify-center gap-2 cursor-pointer select-none",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          {...props}
        >
          {/* Real accessible input hidden behind the slots */}
          <input
            ref={hiddenInputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={maxLength}
            value={value}
            disabled={disabled}
            autoFocus={autoFocus}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              const nextIndex = Math.min(value.length, maxLength - 1);
              setFocusedIndex(nextIndex);
            }}
            onBlur={() => setFocusedIndex(-1)}
            className="absolute inset-0 opacity-0 pointer-events-none z-0"
            aria-label="One-time password input"
          />

          {children}
        </div>
      </InputOTPContext.Provider>
    );
  }
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="input-otp-group"
    className={cn("flex items-center", className)}
    {...props}
  />
));
InputOTPGroup.displayName = "InputOTPGroup";

export interface InputOTPSlotProps extends React.ComponentProps<"div"> {
  index: number;
}

const InputOTPSlot = React.forwardRef<HTMLDivElement, InputOTPSlotProps>(
  ({ index, className, ...props }, ref) => {
    const context = React.useContext(InputOTPContext);
    if (!context) {
      throw new Error("InputOTPSlot must be used within an InputOTP component");
    }

    const { value, focusedIndex } = context;
    const char = value[index] ?? "";
    const isActive = focusedIndex === index;
    const isCompleted = char !== "";

    return (
      <div
        ref={ref}
        data-slot="input-otp-slot"
        data-active={isActive}
        className={cn(
          "relative flex h-11 w-10 sm:w-11 items-center justify-center border-y border-r border-input text-base sm:text-lg font-mono font-medium shadow-sm transition-all",
          "first:rounded-l-md first:border-l last:rounded-r-md",
          "bg-background text-foreground",
          isActive && "z-10 ring-1 ring-ring border-ring",
          isCompleted && "font-semibold",
          className
        )}
        {...props}
      >
        {char}
        {isActive && !char && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-px animate-pulse bg-foreground" />
          </div>
        )}
      </div>
    );
  }
);
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    data-slot="input-otp-separator"
    className={cn("text-muted-foreground px-1 flex items-center justify-center", className)}
    {...props}
  >
    <Minus className="size-3.5" />
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };

