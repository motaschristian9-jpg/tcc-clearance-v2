import React from 'react';
import { cn } from '@/lib/utils';
import { Check, AlertCircle, X } from 'lucide-react';

export type BadgeVariant = 'accepted' | 'flagged' | 'invalid' | 'neutral' | 'online' | 'offline';

export interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, label, className }) => {
  const configs: Record<BadgeVariant, { defaultLabel: string; dotColor: string; icon: React.ReactNode; textClass: string }> = {
    accepted: {
      defaultLabel: 'Accepted',
      dotColor: 'bg-emerald-600',
      icon: <Check className="w-3 h-3 text-emerald-600" />,
      textClass: 'text-emerald-950 font-medium',
    },
    flagged: {
      defaultLabel: 'Flagged · Action Required',
      dotColor: 'bg-amber-600',
      icon: <AlertCircle className="w-3 h-3 text-amber-600" />,
      textClass: 'text-amber-950 font-medium',
    },
    invalid: {
      defaultLabel: 'Invalid / Expired',
      dotColor: 'bg-red-600',
      icon: <X className="w-3 h-3 text-red-600" />,
      textClass: 'text-red-950 font-medium',
    },
    neutral: {
      defaultLabel: 'Notice',
      dotColor: 'bg-neutral-400',
      icon: null,
      textClass: 'text-neutral-600',
    },
    online: {
      defaultLabel: 'Online',
      dotColor: 'bg-emerald-500',
      icon: null,
      textClass: 'text-neutral-500',
    },
    offline: {
      defaultLabel: 'Offline · Local Storage Active',
      dotColor: 'bg-amber-500',
      icon: null,
      textClass: 'text-neutral-500',
    },
  };

  const current = configs[variant];
  const displayLabel = label || current.defaultLabel;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-xs tracking-wide select-none',
        current.textClass,
        className
      )}
    >
      <span className={cn('w-2 h-2 rounded-full shrink-0', current.dotColor)} />
      <span>{displayLabel}</span>
    </span>
  );
};
