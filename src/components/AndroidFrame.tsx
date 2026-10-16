import React from 'react';

interface AndroidFrameProps { children: React.ReactNode; }

/** Keeps the app content full-screen while the real Android OS supplies system bars. */
export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => (
  <div className="min-h-screen w-full bg-[#FFF8EE] text-slate-800 font-sans selection:bg-[#F8A7A1] selection:text-[#2B2B2B]">
    <div className="min-h-screen w-full overflow-x-hidden">{children}</div>
  </div>
);
