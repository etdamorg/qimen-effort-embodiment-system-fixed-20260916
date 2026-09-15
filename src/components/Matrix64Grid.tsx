import React, { useState } from 'react';
import { BasicEffortName, PalaceScore } from '../types';
import { EFF, B, BASE_OF_ROLE } from '../engine/data';
import { isIdentity, isOpposite } from '../engine/effort';

interface Matrix64GridProps {
  currentScore: PalaceScore | null;
  selectedCell: { row: BasicEffortName; col: BasicEffortName };
  onSelectCell: (row: BasicEffortName, col: BasicEffortName) => void;
}

type LayerKey = 'e' | 'men' | 'shen' | 'xing' | 'gua';

export const Matrix64Grid: React.FC<Matrix64GridProps> = ({
  currentScore,
  selectedCell,
  onSelectCell,
}) => {
  const [currentLayer, setCurrentLayer] = useState<LayerKey>('e');

  const LAYERS: [string, LayerKey][] = [
    ['力效', 'e'],
    ['八门', 'men'],
    ['八神', 'shen'],
    ['九星', 'xing'],
    ['卦象', 'gua'],
  ];

  const layerLabel = (ef: (typeof EFF)[0]) => {
    if (currentLayer === 'e') {
      return (
        <div>
          <span>{ef.n}</span>
          <span className="block text-[8px] opacity-60 font-normal">{ef.e}</span>
        </div>
      );
    }
    return (
      <div>
        <span>{ef[currentLayer]}</span>
        <span className="block text-[8px] font-normal opacity-50">{ef.n}</span>
      </div>
    );
  };

  const activeVoices = currentScore?.voices || [];

  return (
    <section className="border border-[var(--ink)] bg-[var(--bg)] p-4 md:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--ink)] pb-2">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="bg-[var(--ink)] text-[var(--bg)] mono text-[10px] font-bold px-1.5 py-0.5">[ 03 ]</span>
            <h2 className="text-xs tracking-[0.1em] uppercase mono text-[var(--ink)] font-bold">
              EFFORT MATRIX · 64-GRID (8×8 BASE × MODIFIER)
            </h2>
          </div>
          <p className="text-[10px] text-[var(--mut)] mono">
            ROW = BASE EFFORT // COLUMN = MODIFIER EFFORT // BOLD OUTLINE = ACTIVE VOICE
          </p>
        </div>

        {/* Layer Switches */}
        <div className="flex flex-wrap gap-1">
          {LAYERS.map(([label, key]) => {
            const isCurrent = currentLayer === key;
            return (
              <button
                key={key}
                onClick={() => setCurrentLayer(key)}
                className={`px-2 py-0.5 text-[9px] uppercase tracking-wider mono transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-[var(--ink)] text-[var(--bg)] border border-[var(--ink)]'
                    : 'bg-[var(--surf)] text-[var(--mut)] border border-[var(--line-strong)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimal Monochrome Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[9px] mono border border-[var(--line-strong)] bg-[var(--surf)] px-3 py-1.5 text-[var(--mut)]">
        <span className="text-[var(--mut)] uppercase font-semibold">LEGEND:</span>
        <div className="flex items-center space-x-1.5">
          <span className="border border-[var(--ink)] text-[var(--ink)] px-1 py-0.2 text-[8px] font-bold">ID</span>
          <span className="text-[var(--mut)]">IDENTITY (本体 · 对角线)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="bg-[var(--ink)] text-[var(--bg)] px-1 py-0.2 text-[8px] font-bold">OP</span>
          <span className="text-[var(--mut)]">OPPOSITION (极反 · 对角反对)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-[var(--line-strong)]">·</span>
          <span>MODULATION (调制)</span>
        </div>
        <div className="flex items-center space-x-1.5 ml-auto">
          <span className="inline-block w-2.5 h-2.5 border-2 border-[var(--ink)] bg-transparent" />
          <span className="text-[var(--ink)] font-bold">VOICE HIT (声部和弦命中)</span>
        </div>
      </div>

      {/* 8x8 Matrix Table */}
      <div className="overflow-x-auto">
        <table className="border-collapse min-w-[620px] w-full text-xs mono">
          <thead>
            <tr>
              <th className="p-1.5 text-[9px] text-[var(--mut)] uppercase bg-[var(--sunk)] border border-[var(--line-strong)] text-left font-bold">
                BASE ╲ MOD
              </th>
              {EFF.map((ef, j) => (
                <th
                  key={ef.n}
                  className={`p-1 text-center text-[9px] bg-[var(--sunk)] border border-[var(--line-strong)] text-[var(--mut)] font-semibold ${
                    j === 4 ? 'border-l-2 border-l-[var(--ink)]' : ''
                  }`}
                >
                  {layerLabel(ef)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EFF.map((base, i) => (
              <tr key={base.n}>
                <th
                  className={`p-1 text-right text-[9px] pr-2 whitespace-nowrap bg-[var(--sunk)] border border-[var(--line-strong)] text-[var(--mut)] font-semibold ${
                    i === 4 ? 'border-t-2 border-t-[var(--ink)]' : ''
                  }`}
                >
                  {layerLabel(base)}
                </th>
                {EFF.map((inf, j) => {
                  const isDiag = isIdentity(base.n, inf.n);
                  const isOpp = isOpposite(base.n, inf.n);
                  const isHit = activeVoices.some(
                    (v) => (BASE_OF_ROLE[v.r] || v.base) === base.n && v.eff === inf.n
                  );
                  const isSelected =
                    selectedCell.row === base.n && selectedCell.col === inf.n;

                  const cellText = B[base.n]?.[inf.n]?.[0] || '';
                  const shortTitle = cellText.split('·')[0];

                  return (
                    <td
                      key={inf.n}
                      className={`p-0.5 bg-[var(--bg)] border border-[var(--line-strong)] ${
                        j === 4 ? 'border-l-2 border-l-[var(--ink)]' : ''
                      } ${i === 4 ? 'border-t-2 border-t-[var(--ink)]' : ''}`}
                    >
                      <button
                        onClick={() => onSelectCell(base.n, inf.n)}
                        className={`w-full p-1 text-[8px] leading-tight transition-colors cursor-pointer text-left block ${
                          isSelected
                            ? 'bg-[var(--ink)] text-[var(--bg)]'
                            : isHit
                            ? 'bg-[var(--sunk)] text-[var(--ink)] border-2 border-[var(--ink)] font-bold'
                            : isDiag
                            ? 'bg-[var(--surf)] text-[var(--ink)] border border-[var(--line-strong)] font-bold'
                            : isOpp
                            ? 'bg-[var(--sunk)] text-[var(--ink)] border border-[var(--line-strong)] border-dashed underline decoration-1 underline-offset-2'
                            : 'bg-[var(--surf)] text-[var(--mut)] border border-[var(--sunk)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]'
                        }`}
                        style={{ minHeight: '38px' }}
                      >
                        <span className="flex justify-between items-center text-[7px]">
                          <span className={isSelected ? 'text-[var(--bg)]' : isDiag ? 'text-[var(--ink)] font-bold' : isOpp ? 'text-[var(--ink)] font-bold underline' : 'text-[var(--dim)]'}>
                            {isDiag ? 'ID' : isOpp ? 'OP' : '·'}
                          </span>
                          {isHit && (
                            <span className={isSelected ? 'text-[var(--bg)]' : 'text-[var(--ink)]'}>
                              ●
                            </span>
                          )}
                        </span>
                        <span className="block truncate max-w-[56px] font-normal mt-0.5">
                          {shortTitle}
                        </span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
