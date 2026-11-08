import React from 'react';
import { Badge } from './Badge';
import { MapPin, ChevronRight, UploadCloud } from 'lucide-react';

export interface StatusStripProps {
  isOnline: boolean;
  isReadyForOffline: boolean;
  pendingSyncCount: number;
  currentVenue: string;
  currentSlot: string;
  onChangeVenueOrSlot?: () => void;
  onSyncClick?: () => void;
}

export const StatusStrip: React.FC<StatusStripProps> = ({
  isOnline,
  isReadyForOffline,
  pendingSyncCount,
  currentVenue,
  currentSlot,
  onChangeVenueOrSlot,
  onSyncClick,
}) => {
  return (
    <div className="w-full bg-slate-900 text-white flex flex-col border-b border-slate-800 shadow-sm sticky top-0 z-40">
      {/* Micro-bar: Network, Offline readiness, Sync counter */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 text-xs border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge variant="online" label="Online" />
          ) : (
            <Badge variant="offline" label="Offline Mode" />
          )}

          {isReadyForOffline && (
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Ready for Offline
            </span>
          )}
        </div>

        {pendingSyncCount > 0 ? (
          <button
            onClick={onSyncClick}
            className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-semibold text-xs transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{pendingSyncCount} scans waiting to sync</span>
          </button>
        ) : (
          <span className="text-slate-400">All scans synced</span>
        )}
      </div>

      {/* Primary Action Banner: Current Venue & Slot */}
      <button
        type="button"
        onClick={onChangeVenueOrSlot}
        className="w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-slate-800/60 active:bg-slate-800 transition-colors group cursor-pointer focus:outline-none focus:bg-slate-800"
        title="Tap to change Venue or Time Slot"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded bg-brand-800/80 text-brand-200 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="text-[11px] font-medium tracking-wide uppercase text-slate-400">
              Scanning Station
            </div>
            <div className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
              {currentVenue} <span className="text-slate-400">·</span> {currentSlot}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-300 font-medium bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 group-hover:border-slate-500 shrink-0">
          <span>Change</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </button>
    </div>
  );
};
