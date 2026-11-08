import * as React from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  selectedLabel?: string;
  setSelectedLabel: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select compound components must be used within a Select provider");
  }
  return context;
}

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  open: controlledOpen,
  onOpenChange,
  children,
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState<string | undefined>(undefined);

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const isOpenControlled = controlledOpen !== undefined;
  const open = isOpenControlled ? controlledOpen : internalOpen;

  const setOpen = React.useCallback(
    (action: React.SetStateAction<boolean>) => {
      const nextOpen = typeof action === "function" ? action(open) : action;
      if (!isOpenControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isOpenControlled, open, onOpenChange]
  );

  const handleValueChange = React.useCallback(
    (val: string) => {
      if (!isControlled) {
        setInternalValue(val);
      }
      onValueChange?.(val);
      setOpen(false);
    },
    [isControlled, onValueChange, setOpen]
  );

  // Close dropdown on click outside
  React.useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        contentRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen]);

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        open,
        setOpen,
        triggerRef,
        contentRef,
        selectedLabel,
        setSelectedLabel,
      }}
    >
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  );
};

const SelectGroup: React.FC<React.ComponentProps<"div">> = ({ className, ...props }) => (
  <div data-slot="select-group" className={cn("p-1", className)} {...props} />
);

export interface SelectValueProps extends React.ComponentProps<"span"> {
  placeholder?: string;
}

const SelectValue: React.FC<SelectValueProps> = ({
  placeholder = "Select an option",
  className,
}) => {
  const { value, selectedLabel } = useSelectContext();
  const display = selectedLabel || value || placeholder;

  return (
    <span
      data-slot="select-value"
      className={cn(
        "truncate block text-left font-sans text-xs",
        !value && !selectedLabel ? "text-muted-foreground" : "text-foreground",
        className
      )}
    >
      {display}
    </span>
  );
};

export interface SelectTriggerProps extends React.ComponentProps<"button"> {}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useSelectContext();

    const mergedRef = (node: HTMLButtonElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      }
    };

    return (
      <button
        ref={mergedRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        data-slot="select-trigger"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs ring-offset-background placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          "hover:border-foreground/40 transition-colors cursor-pointer",
          open && "ring-1 ring-ring border-ring",
          className
        )}
        {...props}
      >
        <div className="flex-1 truncate text-left">{children}</div>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ml-2",
            open && "rotate-180"
          )}
        />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

export interface SelectContentProps extends React.ComponentProps<"div"> {
  position?: "popper" | "item-aligned";
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, contentRef, triggerRef } = useSelectContext();

    if (!open) return null;

    const mergedRef = (node: HTMLDivElement | null) => {
      (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    };

    return (
      <div
        ref={mergedRef}
        data-slot="select-content"
        className={cn(
          "absolute left-0 top-full mt-1.5 z-50 w-full min-w-[8rem] max-h-60 overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md",
          "animate-in fade-in-80 zoom-in-95 duration-100",
          className
        )}
        style={{
          minWidth: triggerRef.current ? `${triggerRef.current.offsetWidth}px` : "100%",
        }}
        {...props}
      >
        <div className="p-1">{children}</div>
      </div>
    );
  }
);
SelectContent.displayName = "SelectContent";

const SelectLabel: React.FC<React.ComponentProps<"div">> = ({ className, ...props }) => (
  <div
    data-slot="select-label"
    className={cn("px-2 py-1.5 text-[11px] font-semibold text-muted-foreground tracking-wider uppercase", className)}
    {...props}
  />
);

export interface SelectItemProps extends Omit<React.ComponentProps<"div">, "onClick"> {
  value: string;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value: itemValue, ...props }, ref) => {
    const { value, onValueChange, setSelectedLabel } = useSelectContext();
    const isSelected = value === itemValue;

    // Update label when selected item is mounted or active
    React.useEffect(() => {
      if (isSelected && children) {
        if (typeof children === "string") {
          setSelectedLabel(children);
        }
      }
    }, [isSelected, children, setSelectedLabel]);

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        data-slot="select-item"
        onClick={() => {
          if (typeof children === "string") {
            setSelectedLabel(children);
          }
          onValueChange?.(itemValue);
        }}
        className={cn(
          "relative flex w-full items-center justify-between rounded-sm px-2.5 py-2 text-xs outline-none select-none transition-colors cursor-pointer",
          "hover:bg-accent hover:text-accent-foreground",
          isSelected ? "bg-accent/60 font-medium text-foreground" : "text-foreground font-normal",
          className
        )}
        {...props}
      >
        <span className="truncate pr-2">{children}</span>
        {isSelected && (
          <span className="flex size-3.5 shrink-0 items-center justify-center text-foreground">
            <Check className="size-3.5 stroke-[2.5]" />
          </span>
        )}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

const SelectSeparator: React.FC<React.ComponentProps<"div">> = ({ className, ...props }) => (
  <div
    data-slot="select-separator"
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
);

const SelectScrollUpButton: React.FC<React.ComponentProps<"div">> = ({ className, ...props }) => (
  <div className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}>
    <ChevronUp className="size-3.5 opacity-50" />
  </div>
);

const SelectScrollDownButton: React.FC<React.ComponentProps<"div">> = ({ className, ...props }) => (
  <div className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}>
    <ChevronDown className="size-3.5 opacity-50" />
  </div>
);

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
