import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Download } from 'lucide-react';

interface AndroidFrameProps {
  currentView: 'app' | 'homescreen';
  onViewChange: (view: 'app' | 'homescreen') => void;
  onOpenDownloadApk?: () => void;
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  currentView,
  onViewChange,
  onOpenDownloadApk,
  children,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  // Real-time device clock that updates every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const timeFormatted = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-0 sm:py-4 sm:px-4 text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Header Banner with Download APK button on top */}
      <div className="w-full max-w-md hidden sm:flex items-center justify-between px-3.5 py-2 mb-2.5 bg-slate-950/90 backdrop-blur-xs rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
            🔥
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">StreakDown</span>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Android 12+
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">
              Ready for Samsung, Vivo, Oppo & Pixel
            </p>
          </div>
        </div>

        {onOpenDownloadApk && (
          <button
            onClick={onOpenDownloadApk}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download Android APK & Project"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download APK</span>
          </button>
        )}
      </div>

      {/* Android Device Shell */}
      <div className="w-full max-w-md h-screen sm:h-[810px] bg-slate-950 sm:rounded-[44px] p-0 sm:p-3 sm:shadow-2xl sm:border-4 sm:border-slate-800 relative flex flex-col overflow-hidden sm:ring-1 sm:ring-white/10">
        {/* Device Front Camera Notch (Hidden on full mobile viewport, visible on framed desktop) */}
        <div className="hidden sm:flex absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-40 items-center justify-center pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
        </div>

        {/* Inner Phone Screen */}
        <div className="relative w-full h-full bg-white sm:rounded-[34px] overflow-hidden flex flex-col shadow-inner">
          {/* Real Android Status Bar */}
          <div className="h-8 bg-transparent pt-1 px-5 flex items-center justify-between text-xs font-semibold text-slate-800 z-30 select-none shrink-0">
            <span className="text-[12px] font-bold tracking-tight">
              {timeFormatted}
            </span>
            <div className="flex items-center gap-2 text-slate-700">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4 fill-slate-700" />
            </div>
          </div>

          {/* Active Screen View */}
          <div className="flex-1 overflow-hidden relative">
            {children}
          </div>

          {/* Android System 3-Button Navigation Bar */}
          <div className="h-11 bg-slate-950 flex items-center justify-around px-8 select-none z-30 shrink-0">
            {/* Back Button (Triangle) */}
            <button
              onClick={() => {
                if (currentView === 'homescreen') {
                  onViewChange('app');
                }
              }}
              className="p-2 text-slate-400 hover:text-white active:scale-90 transition-transform"
              title="Back"
              aria-label="Back"
            >
              <div className="w-0 h-0 border-y-6 border-y-transparent border-r-10 border-r-slate-400 hover:border-r-white"></div>
            </button>

            {/* Home Button (Circle) - Always navigates to Android Home Screen with widgets */}
            <button
              onClick={() => onViewChange('homescreen')}
              className="p-2 text-slate-400 hover:text-white active:scale-90 transition-transform"
              title="Home (Android Home Screen & Widgets)"
              aria-label="Home"
            >
              <div
                className={`w-4 h-4 rounded-full border-2 transition-colors ${
                  currentView === 'homescreen'
                    ? 'border-sky-400 bg-sky-400/30'
                    : 'border-slate-400 hover:border-white'
                }`}
              ></div>
            </button>

            {/* Recents Button (Square) - Switches between App and Home */}
            <button
              onClick={() =>
                onViewChange(currentView === 'app' ? 'homescreen' : 'app')
              }
              className="p-2 text-slate-400 hover:text-white active:scale-90 transition-transform"
              title="Switch between App and Home"
              aria-label="App Switcher"
            >
              <div className="w-3.5 h-3.5 rounded-xs border-2 border-slate-400 hover:border-white"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
