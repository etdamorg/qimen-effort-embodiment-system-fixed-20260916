import React from 'react';
import { QimenChart, PalaceScore } from '../types';
import { LUOSHU, DIR_NAME } from '../engine/data';

interface LuoshuGridProps {
  chart: QimenChart | null;
  scoreMap: Record<number, PalaceScore> | null;
  selectedPalaceId: number;
  onSelectPalace: (id: number) => void;
}

export const LuoshuGrid: React.FC<LuoshuGridProps> = ({
  chart,
  scoreMap,
  selectedPalaceId,
  onSelectPalace,
}) => {
  if (!chart || !scoreMap) return null;

  return (
    <section className="border border-[var(--ink)] bg-[var(--surf)] p-5 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--ink)] pb-3">
        <div className="flex items-center space-x-2">
          <span className="bg-[var(--ink)] text-[var(--bg)] mono text-[10px] font-bold px-1.5 py-0.5">[ 02 ]</span>
          <h2 className="text-xs tracking-[0.1em] uppercase mono text-[var(--ink)] font-bold">
            LUOSHU 3×3 MATRIX · 九宫力效总谱
          </h2>
        </div>
        <span className="text-[10px] text-[var(--mut)] mono uppercase">
          SELECT CELL → INSPECT CHORD & SCORE
        </span>
      </div>

      {/* 3x3 Mathematical Matrix — 实线九宫格，无灰色分隔 */}
      <div className="border-t border-l border-[var(--ink)] grid grid-cols-3">
        {LUOSHU.map((p) => {
          const sc = scoreMap[p];
          const isSelected = p === selectedPalaceId;

          const isZhifu = p === chart.zhifu_palace;
          const isZhishi = p === chart.zhishi_palace;
          const door = chart.door_at[p];
          const isJimen = door && ['开', '休', '生'].includes(door);

          // 中宫：斜纹底纹标记枢纽
          if (p === 5) {
            return (
              <button
                key={p}
                onClick={() => onSelectPalace(p)}
                className={`border-r border-b border-[var(--ink)] p-4 min-h-[132px] flex flex-col justify-between cursor-pointer transition-colors text-left relative hatch-diag ${
                  isSelected ? 'bg-[var(--ink)]' : 'bg-[var(--surf)]'
                }`}
              >
                <div className={`flex justify-between items-center text-[10px] mono ${isSelected ? 'text-[rgba(var(--lead-rgb),.6)]' : 'text-[var(--mut)]'}`}>
                  <span className={`text-[16px] font-black ${isSelected ? 'text-[var(--bg)]' : 'text-[var(--ink)]'}`}>05 中宫</span>
                  {isZhifu && <span className={`border px-1 font-bold ${isSelected ? 'border-[var(--bg)] text-[var(--bg)]' : 'border-[var(--ink)] text-[var(--ink)]'}`}>[值符]</span>}
                </div>
                <div className="py-2 text-center mono">
                  <span className={`text-xs font-medium block ${isSelected ? 'text-[var(--bg)]' : 'text-[var(--ink)]'}`}>枢纽 · 寄2</span>
                  <span className={`text-[9px] block ${isSelected ? 'text-[rgba(var(--lead-rgb),.65)]' : 'text-[var(--mut)]'}`}>符头入中</span>
                </div>
                <div className={`text-[9px] mono text-center border-t pt-1 ${isSelected ? 'border-[rgba(var(--lead-rgb),.35)] text-[rgba(var(--lead-rgb),.65)]' : 'border-[var(--line-strong)] text-[var(--mut)]'}`}>
                  CENTRAL HUB
                </div>
              </button>
            );
          }

          const heType = sc?.he?.type || '—';

          return (
            <button
              key={p}
              onClick={() => onSelectPalace(p)}
              className={`border-r border-b border-[var(--ink)] p-4 min-h-[132px] flex flex-col justify-between cursor-pointer transition-colors text-left relative ${
                isSelected ? 'bg-[var(--ink)]' : 'bg-[var(--surf)] hover:bg-[var(--sunk)]'
              }`}
            >
              {/* Header row: ID + Status tag */}
              <div className="flex justify-between items-center text-[10px] mono">
                <span className={`text-[16px] font-black ${isSelected ? 'text-[var(--bg)]' : 'text-[var(--ink)]'}`}>
                  0{p} <span className="text-[9px] font-normal mono">{DIR_NAME[p]}</span>
                </span>
                <span className="flex space-x-1">
                  {isZhifu && <span className={`border px-1 font-bold ${isSelected ? 'border-[var(--bg)] text-[var(--bg)]' : 'border-[var(--ink)] text-[var(--ink)]'}`}>[值符]</span>}
                  {isZhishi && <span className={`border px-1 font-bold underline ${isSelected ? 'border-[var(--bg)] text-[var(--bg)]' : 'border-[var(--ink)] text-[var(--ink)]'}`}>[值使]</span>}
                  {!isZhifu && !isZhishi && isJimen && (
                    <span className={`border px-1 font-medium ${isSelected ? 'border-[var(--bg)] text-[var(--bg)]' : 'border-[var(--line-strong)] text-[var(--ink)]'}`}>吉门</span>
                  )}
                </span>
              </div>

              {/* Main symbols */}
              <div className={`py-1.5 space-y-0.5 mono text-[11px] ${isSelected ? 'text-[rgba(var(--lead-rgb),.7)]' : ''}`}>
                <div className="flex justify-between items-baseline">
                  <span className={isSelected ? 'text-[rgba(var(--lead-rgb),.55)] text-[9px]' : 'text-[var(--mut)] text-[9px]'}>星:</span>
                  <span className={`font-bold ${isSelected ? 'text-[var(--bg)]' : 'text-[var(--ink)]'}`}>{chart.star_at[p] || '—'}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className={isSelected ? 'text-[rgba(var(--lead-rgb),.55)] text-[9px]' : 'text-[var(--mut)] text-[9px]'}>门:</span>
                  <span className={`font-medium ${isSelected ? 'text-[var(--bg)]' : 'text-[var(--ink)]'}`}>{chart.door_at[p] ? `${chart.door_at[p]}门` : '—'}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className={isSelected ? 'text-[rgba(var(--lead-rgb),.55)] text-[9px]' : 'text-[var(--mut)] text-[9px]'}>神:</span>
                  <span className={isSelected ? 'text-[var(--bg)]' : 'text-[var(--ink)]'}>{chart.shen_at[p] || '—'}</span>
                </div>
              </div>

              {/* Footer: Volume, Duration, Coda */}
              <div className={`flex justify-between items-center text-[9px] mono pt-1.5 border-t ${isSelected ? 'border-[rgba(var(--lead-rgb),.3)]' : 'border-[var(--line-strong)]'}`}>
                <span className={isSelected ? 'text-[rgba(var(--lead-rgb),.6)]' : 'text-[var(--mut)]'}>VOL/{sc?.volume}</span>
                <span className={isSelected ? 'text-[rgba(var(--lead-rgb),.6)]' : 'text-[var(--mut)]'}>DUR/{sc?.duration}</span>
                <span className={
                  isSelected
                    ? 'text-[var(--bg)] font-bold' + (heType === '克战' ? ' underline' : '')
                    : (heType === '克战' ? 'text-[var(--ink)] font-bold underline' : heType === '协和' ? 'text-[var(--ink)] font-medium' : 'text-[var(--mut)]')
                }>
                  {heType}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

