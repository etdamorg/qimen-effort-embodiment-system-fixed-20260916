import React, { useState } from 'react';
import { EmbodimentScore } from '../types';
import { formatSecondsToTime } from '../engine/embodiment';
import { Copy, Check, X, FileText, Sparkles, Activity } from 'lucide-react';
import { DIR_NAME } from '../engine/data';

interface FullScoreModalProps {
  score: EmbodimentScore | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FullScoreModal: React.FC<FullScoreModalProps> = ({ score, isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !score) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(score.formattedPlainText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const { cards, suspension, coda, palaceId, totalDuration, palaceRole } = score;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(18,18,18,0.6)] backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[var(--bg)] border border-[var(--ink)] max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden mono text-xs shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--ink)] bg-[var(--surf)]">
          <div className="flex items-center space-x-2">
            <span className="text-[var(--mut)] font-semibold">[ DOC ]</span>
            <h3 className="text-xs font-bold text-[var(--ink)] uppercase tracking-[0.1em]">
              FULL EMBODIMENT SCORE · PALACE 0{palaceId} {DIR_NAME[palaceId]}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 border border-[var(--ink)] bg-[var(--ink)] hover:bg-[var(--ink)] text-[var(--bg)] px-3 py-1 text-[11px] font-bold uppercase transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[var(--line-strong)]" />
                  <span>COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY SCORE</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1 text-[var(--mut)] hover:text-[var(--ink)] border border-[var(--line-strong)] hover:border-[var(--dim)] transition-colors cursor-pointer bg-[var(--bg)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Top meta block */}
          <div className="border border-[var(--line-strong)] bg-[var(--surf)] p-3.5 space-y-2.5">
            <div className="flex justify-between items-center border-b border-[var(--ink)] pb-2">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[var(--mut)] block font-semibold">
                  PALACE SCORE REGISTER
                </span>
                <span className="text-xs font-bold text-[var(--ink)]">
                  PALACE 0{palaceId} · {palaceRole}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-[var(--mut)] block font-semibold">
                  TOTAL DURATION
                </span>
                <span className="text-xs font-bold text-[var(--ink)]">
                  {totalDuration.toFixed(1)}s ({formatSecondsToTime(totalDuration)})
                </span>
              </div>
            </div>

            {/* PALACE CHORD */}
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase text-[var(--mut)] block font-semibold">
                PALACE CHORD (和弦)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px]">
                {cards.map((c) => (
                  <div
                    key={c.voice}
                    className="p-2 border border-[var(--line-strong)] bg-[var(--bg)] flex justify-between"
                  >
                    <span className="text-[var(--ink)] font-medium">
                      [{c.voice}] ({c.element})
                    </span>
                    <span className="text-[var(--mut)]">
                      {c.base} → <span className="text-[var(--ink)] font-bold">{c.modifier}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-2 border border-[var(--line-strong)] bg-[var(--bg)] text-[10px] text-[var(--mut)] flex justify-between">
                <span>CODA RELATION (天下 ↔ 天上):</span>
                <strong className="text-[var(--ink)] font-bold">
                  {coda.type} ({coda.str})
                </strong>
              </div>
            </div>
          </div>

          {/* ASCII Score Visualizer */}
          <div className="border border-[var(--line-strong)] bg-[var(--sunk)] p-3.5 space-y-2">
            <div className="flex justify-between text-[9px] text-[var(--mut)]">
              <span>T: 00:00</span>
              <span className="tracking-widest opacity-60">────────────────────────────────────────</span>
              <span>T: {formatSecondsToTime(totalDuration)}</span>
            </div>

            <div className="space-y-2 py-1">
              {cards.slice(0, 4).map((c) => {
                const leadSpace = Math.round((c.startTime / totalDuration) * 24);
                const blockLen = Math.max(
                  4,
                  Math.round((c.durationSec / totalDuration) * 24)
                );
                return (
                  <div key={c.voice} className="text-[10px]">
                    <div className="flex justify-between text-[var(--mut)] mb-0.5">
                      <span className="text-[var(--ink)] font-bold">{c.voice}</span>
                      <span>
                        {formatSecondsToTime(c.startTime)} – {formatSecondsToTime(c.endTime)} ({c.durationSec.toFixed(1)}s)
                      </span>
                    </div>
                    <div className="text-[11px] leading-none tracking-widest text-[var(--ink)]">
                      {'\u00A0'.repeat(leadSpace)}
                      {'█'.repeat(blockLen)}
                    </div>
                  </div>
                );
              })}

              {/* 天下 */}
              <div className="text-[10px] pt-1">
                <div className="flex justify-between text-[var(--mut)] mb-0.5">
                  <span className="text-[var(--ink)] font-bold">天下</span>
                  <span className="text-[var(--mut)]">{coda.type} // SYNCHRONIC CODA</span>
                </div>
                <div className="text-[11px] leading-none tracking-widest text-[var(--mut)]">
                  {'\u00A0'.repeat(Math.round((cards[3].startTime / totalDuration) * 24))}
                  {'█'.repeat(Math.max(4, Math.round((cards[3].durationSec / totalDuration) * 24)))}
                </div>
              </div>

              {/* 悬持 */}
              {suspension && (
                <div className="text-[10px] pt-2 border-t border-[var(--line-strong)]">
                  <div className="flex justify-between text-[var(--ink)] mb-0.5 font-bold">
                    <span>SUSPENSION // 悬持 HOLD</span>
                    <span>
                      {formatSecondsToTime(suspension.startTime)} – {formatSecondsToTime(suspension.endTime)}
                    </span>
                  </div>
                  <div className="text-[11px] leading-none tracking-widest text-[var(--ink)]">
                    {'\u00A0'.repeat(Math.round((suspension.startTime / totalDuration) * 24))}
                    {'▓'.repeat(Math.max(4, Math.round((suspension.durationSec / totalDuration) * 24)))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Plain Text rehearsal Sheet */}
          <div className="space-y-1.5">
            <span className="text-[9px] uppercase tracking-wider text-[var(--mut)] block font-semibold">
              PLAIN TEXT REHEARSAL SHEET // 动作排练单文本
            </span>
            <pre className="p-3 border border-[var(--line-strong)] bg-[var(--surf)] text-[10px] leading-relaxed overflow-x-auto text-[var(--ink)] max-h-64 whitespace-pre-wrap selection:bg-[var(--ink)] selection:text-[var(--bg)]">
              {score.formattedPlainText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
