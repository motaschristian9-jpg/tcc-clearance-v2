import React from 'react';
import { UserRole } from '@/types';

export interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange }) => {
  return (
    <header className="w-full bg-white border-b border-neutral-100 py-6 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Brand: Clean, pure typography */}
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-semibold tracking-widest text-neutral-950 uppercase">
            TCC
          </span>
          <span className="text-neutral-300">/</span>
          <span className="text-sm text-neutral-500 font-normal">
            Event Clearance
          </span>
        </div>

        {/* Minimal Text-based Navigation */}
        <nav className="flex items-center gap-6 text-xs tracking-wider uppercase">
          <button
            onClick={() => onRoleChange('officer')}
            className={`pb-1 transition-colors duration-150 ${
              currentRole === 'officer'
                ? 'text-neutral-950 font-semibold border-b-2 border-neutral-950'
                : 'text-neutral-400 hover:text-neutral-700 font-normal'
            }`}
          >
            Field Scanner
          </button>

          <button
            onClick={() => onRoleChange('student')}
            className={`pb-1 transition-colors duration-150 ${
              currentRole === 'student'
                ? 'text-neutral-950 font-semibold border-b-2 border-neutral-950'
                : 'text-neutral-400 hover:text-neutral-700 font-normal'
            }`}
          >
            Student Pass
          </button>

          <button
            onClick={() => onRoleChange('head_officer')}
            className={`pb-1 transition-colors duration-150 ${
              currentRole === 'head_officer'
                ? 'text-neutral-950 font-semibold border-b-2 border-neutral-950'
                : 'text-neutral-400 hover:text-neutral-700 font-normal'
            }`}
          >
            Clearance Records
          </button>
        </nav>
      </div>
    </header>
  );
};
