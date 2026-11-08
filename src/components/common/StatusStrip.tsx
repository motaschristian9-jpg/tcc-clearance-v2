import React from 'react';
import { Badge } from './Badge';

export interface StatusStripProps {
  isOnline: boolean;
  pendingSyncCount: number;
  currentVenue: string;
  currentSlot: string;
  onChangeVenueOrSlot?: () => void;
  onSyncClick?: () => void;
}

export const StatusStrip: React.FC<StatusStripProps> = ({
  isOnline,
  pendingSyncCount,
  currentVenue,
  currentSlot,
  onChangeVenueOrSlot,
  onSyncClick,
}) => {
  return (
    <div className="w-full bg-white border-b border-neutral-100 py-3 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Active Station & Slot with plenty of breathing room */}
        <div className="flex items-center gap-3">
          <span className="text-neutral-400 font-normal uppercase tracking-wider text-[11px]">Station</span>
          <button
            onClick={onChangeVenueOrSlot}
            className="text-neutral-900 font-medium hover:text-neutral-600 transition-colors flex items-center gap-1.5 underline decoration-neutral-300 underline-offset-4"
          >
            {currentVenue} · {currentSlot}
          </button>
        </div>

        {/* Sync & Connectivity info */}
        <div className="flex items-center gap-6">
          <Badge variant={isOnline ? 'online' : 'offline'} />

          {pendingSyncCount > 0 ? (
            <button
              onClick={onSyncClick}
              className="text-amber-800 hover:text-amber-950 font-medium transition-colors"
            >
              {pendingSyncCount} pending sync
            </button>
          ) : (
            <span className="text-neutral-400">Synced</span>
          )}
        </div>
      </div>
    </div>
  );
};
