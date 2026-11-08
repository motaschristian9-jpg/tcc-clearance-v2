import React, { useState } from 'react';

export const App: React.FC = () => {
  // Simple visual screen state: 'signin' -> 'consent'
  const [currentScreen, setCurrentScreen] = useState<'signin' | 'consent'>('signin');

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

      {/* SCREEN 1: SIGN IN WITH GMAIL */}
      {currentScreen === 'signin' && (
        <main className="max-w-md mx-auto w-full my-auto py-16 flex flex-col items-center text-center">
          <div className="space-y-3 mb-12">
            <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 block">
              Student Registration · Step 1
            </span>
            <h1 className="text-3xl sm:text-4xl font-light text-neutral-950 tracking-tight leading-tight">
              Sign in with Gmail
            </h1>
            <p className="text-sm text-neutral-500 font-normal leading-relaxed max-w-xs mx-auto pt-1">
              Register your device to access your TCC event attendance passes and digital clearance card.
            </p>
          </div>

          <div className="w-full space-y-4">
            <button
              type="button"
              onClick={() => setCurrentScreen('consent')}
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

            <p className="text-[11px] text-neutral-400 font-normal leading-normal">
              Use your personal or institutional Gmail address.
            </p>
          </div>

          <div className="mt-14 pt-8 border-t border-neutral-100 w-full text-center">
            <p className="text-xs text-neutral-400 font-normal leading-relaxed">
              Tagoloan Community College · Baluarte, Tagoloan, Misamis Oriental
            </p>
          </div>
        </main>
      )}

      {/* SCREEN 2: DATA PRIVACY & CONSENT (RA 10173) */}
      {currentScreen === 'consent' && (
        <main className="max-w-md mx-auto w-full my-auto py-16 flex flex-col items-center text-center">
          <div className="space-y-3 mb-10">
            <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 block">
              Student Registration · Step 2
            </span>
            <h1 className="text-3xl sm:text-4xl font-light text-neutral-950 tracking-tight leading-tight">
              Data Privacy & Consent
            </h1>
            <p className="text-xs text-neutral-400 uppercase tracking-wider pt-0.5">
              Republic Act No. 10173
            </p>
          </div>

          {/* Minimalist 3-part disclosure with ample whitespace */}
          <div className="w-full text-left space-y-6 my-4 py-6 border-y border-neutral-100">
            <div className="space-y-1">
              <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-950 block">
                What we collect
              </span>
              <p className="text-xs text-neutral-500 font-normal leading-relaxed">
                Your full name, school ID number, department, year level, section, and a live front-camera verification photo.
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-950 block">
                Why it is collected
              </span>
              <p className="text-xs text-neutral-500 font-normal leading-relaxed">
                Exclusively for verifying event attendance, issuing digital clearance stamps, and preventing card forgery.
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-950 block">
                Data retention
              </span>
              <p className="text-xs text-neutral-500 font-normal leading-relaxed">
                Records are retained solely for the official academic semester clearance cycle and purged upon clearance archiving.
              </p>
            </div>
          </div>

          {/* Action buttons with generous touch target */}
          <div className="w-full space-y-3 mt-8">
            <button
              type="button"
              className="w-full h-13 min-h-[52px] px-6 bg-neutral-950 hover:bg-neutral-800 active:bg-neutral-900 text-white font-medium text-sm rounded-xl transition-all duration-150 flex items-center justify-center select-none cursor-pointer"
            >
              I Agree & Continue
            </button>

            <button
              type="button"
              onClick={() => setCurrentScreen('signin')}
              className="w-full py-3 text-xs text-neutral-400 hover:text-neutral-900 transition-colors uppercase tracking-wider font-normal cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </main>
      )}

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
