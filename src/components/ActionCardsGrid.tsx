import React from 'react';
import { ActionCardData, SuspensionData } from '../types';
import { formatSecondsToTime } from '../engine/embodiment';
import {
  Compass,
  Sparkles,
  ArrowRight,
  Shield,
  Gauge,
  Activity,
  Layers,
  Zap,
} from 'lucide-react';

interface ActionCardsGridProps {
  cards: ActionCardData[];
  suspension: SuspensionData | null;
  selectedVoiceName?: string;
  onSelectVoice?: (voice: string) => void;
}

export const ActionCardsGrid: React.FC<ActionCardsGridProps> = ({
  cards,
  suspension,
  selectedVoiceName,
  onSelectVoice,
}) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--ink)] pb-2">
        <div className="flex items-center space-x-2">
          <span className="bg-[var(--ink)] text-[var(--bg)] mono text-[10px] font-bold px-1.5 py-0.5">[ 05 ]</span>
          <h2 className="text-xs tracking-[0.1em] uppercase mono text-[var(--ink)] font-bold">
            ACTION SHEETS · 声部具身动作参数记录表
          </h2>
        </div>
        <span className="text-[10px] text-[var(--mut)] mono uppercase">
          LABORATORY ACTION PARAMETERS (WEIGHT / TIME / SPACE / FLOW)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, idx) => {
          const isSelected = selectedVoiceName === card.voice;
          const isCoda = card.voice === '天下';

          return (
            <div
              key={card.voice}
              onClick={() => onSelectVoice?.(card.voice)}
              className={`border p-4 space-y-3 transition-colors cursor-pointer mono text-xs ${
                isSelected
                  ? 'border-[var(--ink)] bg-[var(--surf)] ring-2 ring-[var(--ink)]'
                  : 'border-[var(--line-strong)] bg-[var(--bg)] hover:border-[var(--dim)]'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--line-strong)] pb-2 text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="text-[var(--mut)] font-semibold">[0{idx + 1}]</span>
                  <span className="text-[var(--ink)] font-bold uppercase">
                    {card.voice}声部 // {card.element}
                  </span>
                </div>

                <div>
                  {card.isIdentity ? (
                    <span className="border border-[var(--ink)] bg-[var(--bg)] px-1.5 py-0.2 text-[9px] text-[var(--ink)] font-bold">
                      IDENTITY
                    </span>
                  ) : card.isOpposite ? (
                    <span className="bg-[var(--ink)] text-[var(--bg)] px-1.5 py-0.2 text-[9px] font-bold">
                      OPPOSITE
                    </span>
                  ) : (
                    <span className="border border-[var(--line-strong)] bg-[var(--surf)] px-1.5 py-0.2 text-[9px] text-[var(--mut)]">
                      MODULATION
                    </span>
                  )}
                </div>
              </div>

              {/* Effort & Timing Spec */}
              <div className="border border-[var(--line-strong)] bg-[var(--surf)] p-2.5 space-y-1 text-[10px]">
                <div className="flex justify-between text-[var(--mut)]">
                  <span>EFFORT (BASE):</span>
                  <span className="text-[var(--ink)] font-bold">{card.base} (主体)</span>
                </div>
                <div className="flex justify-between text-[var(--mut)]">
                  <span>MODIFIER:</span>
                  <span className="text-[var(--mut)] font-semibold">{card.modifier} (调制)</span>
                </div>
                <div className="flex justify-between text-[var(--mut)]">
                  <span>SPAN / TIME:</span>
                  <span className="text-[var(--ink)] font-medium">
                    {card.durationSec.toFixed(1)}s ({formatSecondsToTime(card.startTime)}–{formatSecondsToTime(card.endTime)})
                  </span>
                </div>
                <div className="border-t border-[var(--line-strong)] pt-1 mt-1 text-[var(--mut)] text-[9px]">
                  <span>FORMULA: 以 {card.base} 为本体，受 {card.modifier} 质感偏移</span>
                </div>
              </div>

              {/* Laban Parameter Table */}
              <div className="border border-[var(--line-strong)] bg-[var(--sunk)] grid grid-cols-4 divide-x divide-[var(--line-strong)] text-center text-[9px] py-1.5">
                <div>
                  <span className="text-[var(--mut)] block text-[8px] font-medium">WEIGHT</span>
                  <span className={card.somatic.weight === 'Strong' ? 'text-[var(--ink)] font-bold' : 'text-[var(--mut)]'}>
                    {card.somatic.weight}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--mut)] block text-[8px] font-medium">TIME</span>
                  <span className="text-[var(--ink)] font-bold">{card.somatic.time}</span>
                </div>
                <div>
                  <span className="text-[var(--mut)] block text-[8px] font-medium">SPACE</span>
                  <span className="text-[var(--ink)] font-bold">{card.somatic.space}</span>
                </div>
                <div>
                  <span className="text-[var(--mut)] block text-[8px] font-medium">FLOW</span>
                  <span className={card.somatic.flow === 'Bound' ? 'text-[var(--ink)] font-bold' : 'text-[var(--mut)]'}>
                    {card.somatic.flow}
                  </span>
                </div>
              </div>

              {/* Somatic Chain & Direction */}
              <div className="space-y-1.5 text-[10px] text-[var(--mut)] border-t border-[var(--line-strong)] pt-2">
                <div className="flex justify-between">
                  <span className="text-[var(--mut)]">TRAJECTORY:</span>
                  <span className="text-[var(--ink)] font-medium">{card.somatic.direction}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--mut)]">INITIATION:</span>
                  <span className="text-[var(--ink)] font-medium">{card.somatic.initiation}</span>
                </div>
                <div className="text-[9.5px]">
                  <span className="text-[var(--mut)] block mb-0.5">CONTINUATION:</span>
                  <p className="text-[var(--mut)] leading-relaxed pl-2 border-l border-[var(--line-strong)]">
                    {card.somatic.continuation}
                  </p>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="text-[var(--mut)]">RELEASE:</span>
                  <span className="text-[var(--ink)] font-medium">{card.somatic.release}</span>
                </div>
              </div>

              {/* Texture Directive */}
              <div className="border-t border-[var(--line-strong)] pt-2 text-[10px] space-y-1">
                <span className="text-[var(--mut)] text-[8px] uppercase block tracking-wider font-semibold">
                  DIRECTIVE // 质感指令
                </span>
                <p className="text-[var(--ink)] font-bold">{card.textureShort}</p>
                <p className="text-[var(--mut)] text-[9.5px] leading-relaxed">{card.textureDesc}</p>
              </div>

              {/* Coda Note */}
              {isCoda && card.codaRelation && (
                <div className="border border-[var(--line-strong)] bg-[var(--surf)] p-2 text-[9.5px] text-[var(--mut)]">
                  <span className="text-[8px] text-[var(--mut)] uppercase block mb-0.5 font-semibold">
                    CODA RELATION // 天地克应
                  </span>
                  <p>{card.codaRelation.details}</p>
                </div>
              )}
            </div>
          );
        })}

        {/* Suspension Hold Card */}
        {suspension && (
          <div className="border-2 border-[var(--ink)] bg-[var(--sunk)] p-4 space-y-3 mono text-xs">
            <div className="flex items-center justify-between border-b border-[var(--line-strong)] pb-2">
              <div className="flex items-center space-x-2">
                <span className="text-[var(--ink)] font-bold">[★]</span>
                <span className="text-[var(--ink)] uppercase font-bold">
                  SUSPENSION HOLD // 极反悬持段
                </span>
              </div>
              <span className="bg-[var(--ink)] text-[var(--bg)] px-1.5 py-0.2 text-[9px] font-bold">
                ALL 5 VOICES
              </span>
            </div>

            <div className="border border-[var(--line-strong)] bg-[var(--sunk)] p-2.5 space-y-1 text-[10px]">
              <div className="flex justify-between text-[var(--ink)]">
                <span>SPAN:</span>
                <span className="text-[var(--ink)] font-bold">
                  {formatSecondsToTime(suspension.startTime)} – {formatSecondsToTime(suspension.endTime)} ({suspension.durationSec.toFixed(1)}s)
                </span>
              </div>
              <div className="flex justify-between text-[var(--ink)]">
                <span>RATIO:</span>
                <span className="text-[var(--ink)] font-bold">{(suspension.fraction * 100).toFixed(0)}% TOTAL TIME</span>
              </div>
              <p className="text-[var(--ink)] pt-1 text-[9.5px]">
                FOCUS: {suspension.oppVoices.join('、')} 处出现“极反”力效
              </p>
            </div>

            <div className="border-t border-[var(--line-strong)] pt-2 text-[10px] space-y-1">
              <span className="text-[var(--ink)] text-[8px] uppercase block tracking-wider font-semibold">
                SOMATIC CUE // 悬持身体执行准则
              </span>
              <p className="text-[var(--ink)] leading-relaxed font-medium">{suspension.somaticCue}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
