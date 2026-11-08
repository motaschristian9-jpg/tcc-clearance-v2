import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accept' | 'reject' | 'amber' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'scanner';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles = 'btn-touch inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 border border-transparent shadow-sm',
    secondary: 'bg-white text-slate-800 hover:bg-slate-100 active:bg-slate-200 border border-slate-300 shadow-sm',
    accept: 'bg-emerald-700 text-white hover:bg-emerald-800 active:bg-emerald-900 border border-emerald-800 shadow-sm',
    reject: 'bg-red-700 text-white hover:bg-red-800 active:bg-red-900 border border-red-800 shadow-sm',
    amber: 'bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800 border border-amber-700 shadow-sm',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-200/60 active:bg-slate-200 border border-transparent',
  };

  const sizes = {
    sm: 'text-sm py-2 px-3 min-h-[44px]',
    md: 'text-base py-3 px-5 min-h-[48px]',
    lg: 'text-lg py-4 px-6 min-h-[54px]',
    // Specialized scanner button (large thumb target for rapid one-handed event operation)
    scanner: 'text-lg font-bold py-4 px-8 min-h-[58px] w-full text-center',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-5 w-5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : leftIcon ? (
        <span className="mr-2 inline-flex items-center">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon && (
        <span className="ml-2 inline-flex items-center">{rightIcon}</span>
      )}
    </button>
  );
};
