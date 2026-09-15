import React from 'react';
import { EmbodimentScore, ActionCardData } from '../types';
import { formatSecondsToTime } from '../engine/embodiment';
import { Play, Pause, RotateCcw, Link2, Sparkles, AlertCircle } from 'lucide-react';

interface EmbodimentTimelineProps {
  embodimentScore: EmbodimentScore | null;
  activeVoiceName?: string;
  onSelectVoice?: (voice: string) => void;
  playbackTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
}

export const EmbodimentTimeline: React.FC<EmbodimentTimelineProps> = ({
  embodimentScore,
  activeVoiceName,
  onSelectVoice,
  playbackTime,
  isPlaying,
  onTogglePlay,
  onReset,
}) => {
  if (!embodimentScore) return null;

  const { totalDuration, cards, suspension, coda, palaceRole } = embodimentScore;

  // 区分前4声部与天下声部
  const seqCards = cards.slice(0, 4);
  const codaCard = cards[4];

  // 获得指定时间点的活跃声部
  const isVoiceActive = (card: ActionCardData) => {
    return playbackTime >= card.startTime && playbackTime <= card.endTime;
  };

  const isSuspensionActive =
    suspension &&
    playbackTime >= suspension.startTime &&
    playbackTime <= suspension.endTime;

  const playheadPercent = (playbackTime / totalDuration) * 100;

  return (
    <div className="border border-[var(--ink)] bg-[var(--bg)] p-4 md:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ink)] pb-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[var(--ink)] text-[var(--bg)] mono text-[10px] font-bold px-1.5 py-0.5">[ 04 ]</span>
            <h3 className="text-xs tracking-[0.1em] uppercase mono text-[var(--ink)] font-bold">
              TEMPORAL SCORE TIMELINE · 具身时间结构轴
            </h3>
          </div>
          <p className="text-[10px] text-[var(--mut)] mono mt-0.5">
            SPAN: 00:00 → {formatSecondsToTime(totalDuration)} ({totalDuration.toFixed(1)}s) · DETERMINISTIC EMBODIED COMPOSITION
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-2 text-xs mono">
          <button
            onClick={onTogglePlay}
            className="flex items-center space-x-1 px-3 py-1 border border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] hover:bg-[var(--ink)] transition-colors cursor-pointer text-xs uppercase font-medium"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span>[ PAUSE ]</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>[ PLAY SCORE ]</span>
              </>
            )}
          </button>
          <button
            onClick={onReset}
            className="px-2 py-1 border border-[var(--line-strong)] hover:border-[var(--dim)] text-[var(--mut)] hover:text-[var(--ink)] bg-[var(--surf)] cursor-pointer transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          <div className="mono text-xs text-[var(--ink)] font-bold bg-[var(--sunk)] px-2.5 py-1 border border-[var(--line-strong)]">
            {formatSecondsToTime(playbackTime)} / {formatSecondsToTime(totalDuration)}
          </div>
        </div>
      </div>

      {/* Phase division bar */}
      {suspension && (
        <div className="border border-[var(--line-strong)] bg-[var(--surf)] p-1.5 flex flex-wrap gap-2 text-[9px] mono text-[var(--mut)]">
          <div className="flex-1 border border-[var(--line-strong)] bg-[var(--bg)] px-2 py-1 flex justify-between items-center">
            <span className="text-[var(--mut)] font-medium">PHASE 1: ENTRY · 依序立住段 ({((1 - suspension.fraction) * 100).toFixed(0)}%)</span>
            <span>00:00 – {formatSecondsToTime(suspension.startTime)}</span>
          </div>
          <div className="flex-1 border border-[var(--line-strong)] bg-[var(--sunk)] px-2 py-1 flex justify-between items-center text-[var(--ink)] font-bold">
            <span className="flex items-center space-x-1">
              <span>★ PHASE 2: SUSPENSION · 极反悬持段 (五声部全在场)</span>
            </span>
            <span>{formatSecondsToTime(suspension.startTime)} – {formatSecondsToTime(totalDuration)}</span>
          </div>
        </div>
      )}

      {/* Score Track Container */}
      <div className="relative border border-[var(--line-strong)] bg-[var(--surf)] p-3 pt-6 overflow-hidden">
        {/* Top Ruler Markers */}
        <div className="absolute top-1 left-20 right-4 flex justify-between text-[8px] text-[var(--dim)] mono select-none pointer-events-none">
          <span>00:00</span>
          <span>{formatSecondsToTime(totalDuration * 0.25)}</span>
          <span>{formatSecondsToTime(totalDuration * 0.5)}</span>
          <span>{formatSecondsToTime(totalDuration * 0.75)}</span>
          <span>{formatSecondsToTime(totalDuration)}</span>
        </div>

        {/* Reference Grid lines */}
        <div className="absolute top-5 bottom-2 left-20 right-4 grid grid-cols-4 pointer-events-none opacity-40 border-r border-[var(--line-strong)]">
          <div className="border-l border-[var(--line-strong)]" />
          <div className="border-l border-[var(--line-strong)]" />
          <div className="border-l border-[var(--line-strong)]" />
          <div className="border-l border-[var(--line-strong)]" />
        </div>

        {/* Playhead Scrubber */}
        <div
          className="absolute top-3 bottom-1 z-30 pointer-events-none transition-all duration-75"
          style={{
            left: `calc(5rem + (100% - 6rem) * ${playheadPercent / 100})`,
          }}
        >
          <div className="w-0.5 h-full bg-[var(--ink)] relative">
            <div className="absolute -top-3 -left-4 bg-[var(--ink)] text-[var(--bg)] text-[7.5px] mono font-bold px-1 rounded-xs">
              {playbackTime.toFixed(1)}s
            </div>
          </div>
        </div>

        {/* 5-Voice Tracks */}
        <div className="space-y-1.5 relative z-10">
          {/* Voices 1-4 */}
          {seqCards.map((card) => {
            const leftPercent = (card.startTime / totalDuration) * 100;
            const widthPercent = (card.durationSec / totalDuration) * 100;
            const active = isVoiceActive(card);
            const isTarget = activeVoiceName === card.voice;

            return (
              <div
                key={card.voice}
                className="flex items-center text-xs mono group cursor-pointer"
                onClick={() => onSelectVoice?.(card.voice)}
              >
                {/* Voice Label */}
                <div className="w-20 flex-shrink-0 flex items-center justify-between pr-2 text-[var(--mut)]">
                  <span className="font-bold text-[var(--ink)]">{card.voice}</span>
                  <span className="text-[9px] text-[var(--mut)]">{card.element}</span>
                </div>

                {/* Track Lane */}
                <div className="flex-1 relative h-6 bg-[var(--bg)] border border-[var(--line-strong)]">
                  <div
                    className={`absolute top-0 bottom-0 transition-colors flex items-center justify-between px-2 text-[9px] ${
                      isTarget
                        ? 'bg-[var(--ink)] text-[var(--bg)] border border-[var(--ink)] font-bold'
                        : active
                        ? 'bg-[var(--line)] text-[var(--ink)] border border-[var(--dim)] font-semibold'
                        : 'bg-[var(--sunk)] text-[var(--mut)] border border-[var(--line-strong)] hover:border-[var(--mut)]'
                    }`}
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  >
                    <span className="truncate font-medium">
                      {card.base} × {card.modifier}
                      {card.isIdentity && ' [ID]'}
                      {card.isOpposite && ' [OP]'}
                    </span>
                    <span className="text-[8px] whitespace-nowrap ml-1 opacity-80">
                      {card.durationSec.toFixed(1)}s
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Voice 5: 天下 (Coda 对偶) */}
          <div
            className="flex items-center text-xs mono group cursor-pointer"
            onClick={() => onSelectVoice?.(codaCard.voice)}
          >
            <div className="w-20 flex-shrink-0 flex items-center justify-between pr-2 text-[var(--mut)]">
              <span className="font-bold text-[var(--ink)]">{codaCard.voice}</span>
              <span className="text-[9px] text-[var(--mut)]">{codaCard.element}</span>
            </div>

            <div className="flex-1 relative h-6 bg-[var(--bg)] border border-[var(--line-strong)]">
              <div
                className={`absolute top-0 bottom-0 transition-colors flex items-center justify-between px-2 text-[9px] ${
                  activeVoiceName === codaCard.voice
                    ? 'bg-[var(--ink)] text-[var(--bg)] border border-[var(--ink)] font-bold'
                    : isVoiceActive(codaCard)
                    ? 'bg-[var(--line)] text-[var(--ink)] border border-[var(--dim)] font-semibold'
                    : 'bg-[var(--sunk)] text-[var(--mut)] border border-[var(--line-strong)] hover:border-[var(--mut)]'
                }`}
                style={{
                  left: `${(codaCard.startTime / totalDuration) * 100}%`,
                  width: `${(codaCard.durationSec / totalDuration) * 100}%`,
                }}
              >
                <span className="truncate flex items-center space-x-1 font-medium">
                  <span>
                    天下 ({codaCard.base}×{codaCard.modifier}) ↔ 天上 [{coda.type}]
                  </span>
                </span>
                <span className="text-[8px] whitespace-nowrap ml-1 opacity-80">
                  (CODA)
                </span>
              </div>
            </div>
          </div>

          {/* Suspension Track */}
          {suspension && (
            <div className="flex items-center text-xs mono pt-1">
              <div className="w-20 flex-shrink-0 flex items-center justify-between pr-2 text-[var(--ink)]">
                <span className="font-bold">悬持 HOLD</span>
                <span className="text-[9px] text-[var(--ink)]">ALL</span>
              </div>

              <div className="flex-1 relative h-6 bg-[var(--sunk)] border border-[var(--line-strong)]">
                <div
                  className={`absolute top-0 bottom-0 border border-[var(--ink)] flex items-center justify-between px-2 text-[9px] ${
                    isSuspensionActive ? 'bg-[var(--ink)] text-[var(--bg)] font-bold' : 'bg-[var(--sunk)] text-[var(--mut)]'
                  }`}
                  style={{
                    left: `${(suspension.startTime / totalDuration) * 100}%`,
                    width: `${(suspension.durationSec / totalDuration) * 100}%`,
                  }}
                >
                  <span className="truncate">
                    五声部全在场悬持 · 锁持 [{suspension.oppVoices.join(' / ')}] 极反张力
                  </span>
                  <span className="text-[8px] font-bold">
                    {suspension.durationSec.toFixed(1)}s
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Meta: Coda & EMBODY_W4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mono">
        <div className="p-3 bg-[var(--surf)] border border-[var(--line-strong)]">
          <span className="text-[9px] text-[var(--mut)] uppercase block mb-1 font-medium">
            CODA DUALITY // 天上 · 天下对偶
          </span>
          <div className="text-[var(--ink)] flex items-center space-x-2">
            <span className="border border-[var(--line-strong)] bg-[var(--bg)] px-1.5 py-0.2 text-[10px] font-bold">
              {coda.type}
            </span>
            <span className="font-bold">{coda.str}</span>
          </div>
          <p className="text-[10px] text-[var(--mut)] mt-1.5 leading-relaxed">{coda.reading}</p>
        </div>

        <div className="p-3 bg-[var(--surf)] border border-[var(--line-strong)]">
          <span className="text-[9px] text-[var(--mut)] uppercase block mb-1 font-medium">
            RATIO RULE // 三分损益递进规则 (EMBODY_W4)
          </span>
          <p className="text-[10px] text-[var(--mut)] leading-relaxed">
            神 (31.8%) → 星 (21.2%) → 门 (28.2%) → 天上 (18.8%)。
            {palaceRole === '值使宫' && suspension
              ? ` 当前为值使宫且存在极反，入场段按 ${(embodimentScore.entryFraction * 100).toFixed(0)}% 压缩，释出 ${(suspension.fraction * 100).toFixed(0)}% 时长专注悬持。`
              : ' 各声部依据经典律吕生克权重，依次在身体中立定。'}
          </p>
        </div>
      </div>
    </div>
  );
};
