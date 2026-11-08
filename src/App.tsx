import React from 'react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col justify-between px-6 py-12 sm:py-20 sm:px-12 selection:bg-neutral-900 selection:text-white">
      {/* Top Header - Pure whitespace with quiet institutional branding */}
      <header className="max-w-md mx-auto w-full flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-neutral-950 uppercase">
          TCC
        </span>
        <span className="text-xs tracking-wider text-neutral-400 font-normal">
          Clearance System
        </span>
      </header>

      {/* Main Center Stage - Abundant white space, single task focus */}
      <main className="max-w-md mx-auto w-full my-auto py-16 flex flex-col items-center text-center">
        {/* Subtitle & Title */}
        <div className="space-y-3 mb-12">
          <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 block">
            Student Registration
          </span>
          <h1 className="text-3xl sm:text-4xl font-light text-neutral-950 tracking-tight leading-tight">
            Sign in with Gmail
          </h1>
          <p className="text-sm text-neutral-500 font-normal leading-relaxed max-w-xs mx-auto pt-1">
            Register your device to access your TCC event attendance passes and digital clearance card.
          </p>
        </div>

        {/* Action-First: Continue with Google Button (≥48px touch target, clean minimal border) */}
        <div className="w-full space-y-4">
          <button
            type="button"
            className="w-full h-13 min-h-[52px] px-6 bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-300 hover:border-neutral-900 text-neutral-900 font-medium text-sm rounded-xl transition-all duration-150 flex items-center justify-center gap-3.5 select-none focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
          >
            {/* Google SVG Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Quiet Guidance */}
          <p className="text-[11px] text-neutral-400 font-normal leading-normal">
            Use your personal or institutional Gmail address.
          </p>
        </div>

        {/* Minimal Information Note */}
        <div className="mt-14 pt-8 border-t border-neutral-100 w-full text-center">
          <p className="text-xs text-neutral-400 font-normal leading-relaxed">
            Tagoloan Community College · Baluarte, Tagoloan, Misamis Oriental
          </p>
        </div>
      </main>

      {/* Subtle, Quiet Footer with Privacy Reference */}
      <footer className="max-w-md mx-auto w-full text-center">
        <p className="text-[11px] text-neutral-400 font-normal">
          Compliant with RA 10173 (Data Privacy Act of 2012)
        </p>
      </footer>
    </div>
  );
};

export default App;
