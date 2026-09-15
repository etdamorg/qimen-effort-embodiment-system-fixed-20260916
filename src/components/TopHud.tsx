import React from 'react';

interface TopHudProps {
  currentDateStr: string;
  currentHour: number;
}

export const TopHud: React.FC<TopHudProps> = ({ currentDateStr, currentHour }) => {
  return (
    <header className="border-b border-[var(--ink)] bg-[var(--bg)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-[0.2em] text-[var(--mut)] mono uppercase font-medium">
            QIMEN / EFFORT / EMBODIMENT
          </div>
          <h1 className="text-sm md:text-base font-bold tracking-tight text-[var(--ink)] mt-0.5">
            确定性具身生成系统 <span className="text-[10px] mono text-[var(--mut)] uppercase tracking-widest align-middle">· Deterministic Generation System</span>
          </h1>
        </div>

        <div className="flex items-center space-x-3 text-[10px] mono text-[var(--mut)] uppercase">
          <span className="hidden sm:inline border border-[var(--line-strong)] bg-[var(--surf)] px-2 py-0.5 text-[var(--mut)]">
            CALIBRATION: YIXINSOFT
          </span>
          <span className="border border-[var(--ink)] bg-[var(--surf)] px-2 py-0.5 text-[var(--ink)] font-medium">
            TIME: {currentDateStr} {currentHour.toString().padStart(2, '0')}:00
          </span>
          <span className="text-[var(--bg)] border border-[var(--ink)] bg-[var(--ink)] px-2 py-0.5 font-bold">
            SYS v1.0
          </span>
        </div>
      </div>
    </header>
  );
};

