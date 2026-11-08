import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, XCircle, Info, Wifi, WifiOff, RefreshCw } from 'lucide-react';

export type BadgeVariant = 'accepted' | 'flagged' | 'invalid' | 'neutral' | 'online' | 'offline' | 'syncing';

export interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  label,
  icon,
  className,
}) => {
  const configs: Record<BadgeVariant, { defaultLabel: string; defaultIcon: React.ReactNode; styles: string }> = {
    accepted: {
      defaultLabel: 'Accepted',
      defaultIcon: <CheckCircle2 className="w-4 h-4 shrink-0 text-status-accepted" />,
      styles: 'bg-status-accepted-bg text-status-accepted-text border-status-accepted-border font-semibold',
    },
    flagged: {
      defaultLabel: 'Flagged: Needs Decision',
      defaultIcon: <AlertTriangle className="w-4 h-4 shrink-0 text-status-flagged" />,
      styles: 'bg-status-flagged-bg text-status-flagged-text border-status-flagged-border font-semibold',
    },
    invalid: {
      defaultLabel: 'Invalid QR / Forged',
      defaultIcon: <XCircle className="w-4 h-4 shrink-0 text-status-invalid" />,
      styles: 'bg-status-invalid-bg text-status-invalid-text border-status-invalid-border font-semibold',
    },
    neutral: {
      defaultLabel: 'Notice',
      defaultIcon: <Info className="w-4 h-4 shrink-0 text-slate-600" />,
      styles: 'bg-slate-100 text-slate-800 border-slate-300 font-medium',
    },
    online: {
      defaultLabel: 'Online',
      defaultIcon: <Wifi className="w-3.5 h-3.5 shrink-0 text-emerald-600" />,
      styles: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium text-xs',
    },
    offline: {
      defaultLabel: 'Ready for Offline',
      defaultIcon: <WifiOff className="w-3.5 h-3.5 shrink-0 text-amber-700" />,
      styles: 'bg-amber-50 text-amber-900 border-amber-300 font-medium text-xs',
    },
    syncing: {
      defaultLabel: 'Syncing',
      defaultIcon: <RefreshCw className="w-3.5 h-3.5 shrink-0 animate-spin text-blue-700" />,
      styles: 'bg-blue-50 text-blue-900 border-blue-300 font-medium text-xs',
    },
  };

  const current = configs[variant];
  const displayLabel = label || current.defaultLabel;
  const displayIcon = icon !== undefined ? icon : current.defaultIcon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 text-sm border rounded-full select-none',
        current.styles,
        className
      )}
    >
      {displayIcon}
      <span>{displayLabel}</span>
    </span>
  );
};
