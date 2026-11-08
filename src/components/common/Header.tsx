import React from 'react';
import { ShieldCheck, GraduationCap, QrCode } from 'lucide-react';
import { UserRole } from '@/types';

export interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 shrink-0">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Context */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand-800 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-sm">
            TCC
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              TCC Clearance System
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Tagoloan Community College · EdTech
            </p>
          </div>
        </div>

        {/* Role Selector (Quick testing & role switching) */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            onClick={() => onRoleChange('student')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              currentRole === 'student'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Student</span>
          </button>

          <button
            onClick={() => onRoleChange('officer')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              currentRole === 'officer'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SBO Officer</span>
          </button>

          <button
            onClick={() => onRoleChange('head_officer')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              currentRole === 'head_officer'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin / Head</span>
          </button>
        </div>
      </div>
    </header>
  );
};
