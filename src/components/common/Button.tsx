import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accept' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
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
  const baseStyles = 'btn-touch inline-flex items-center justify-center font-normal tracking-wide transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-neutral-950 text-white hover:bg-neutral-800 active:bg-neutral-900 border border-neutral-950',
    secondary: 'bg-white text-neutral-900 hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-200',
    accept: 'bg-emerald-700 text-white hover:bg-emerald-800 active:bg-emerald-900 border border-emerald-700',
    danger: 'bg-white text-red-700 hover:bg-red-50 active:bg-red-100 border border-neutral-200',
    ghost: 'bg-transparent text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/50 border border-transparent',
  };

  const sizes = {
    sm: 'text-xs py-2 px-4 h-10',
    md: 'text-sm py-3 px-6 h-12',
    lg: 'text-base py-3.5 px-8 h-14',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : leftIcon ? (
        <span className="mr-2.5 inline-flex items-center">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="ml-2.5 inline-flex items-center">{rightIcon}</span>
      )}
    </button>
  );
};
