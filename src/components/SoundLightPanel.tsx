import React, { useEffect, useRef, useState } from 'react';
import { QimenChart, PalaceScore, EmbodimentScore } from '../types';
import { deriveSoundParamsForVoice, deriveLightParams, getActiveCardAtTime } from '../engine/soundLight';
import { synthInstance } from '../engine/audioSynthesizer';
import { Volume2, Sparkles, Radio } from 'lucide-react';

interface SoundLightPanelProps {
  chart: QimenChart | null;
  score: PalaceScore | null;
  embodimentScore: EmbodimentScore | null;
  playbackTime: number;
  isPlaying: boolean;
}

export const SoundLightPanel: React.FC<SoundLightPanelProps> = ({
  chart,
  score,
  embodimentScore,
  playbackTime,
  isPlaying,
}) => {
  const [manualPlaying, setManualPlaying] = useState(false);
  const lastAutoKeyRef = useRef<string | null>(null);

  if (!chart || !score || score.isMiddle || !embodimentScore) {
    return (
      <section className="border border-[var(--ink)] bg-[var(--bg)] p-4 md:p-5">
        <span className="bg-[var(--ink)] text-[var(--bg)] mono text-[10px] font-bold px-1.5 py-0.5">[ 07 ]</span>
        <span className="text-[var(--mut)] mono text-xs ml-2">SOUND / LIGHT · 声光参数(需先选中一个非中宫的宫位)</span>
      </section>
    );
  }

  const active = getActiveCardAtTime(embodimentScore, playbackTime);
  const sound = active
    ? deriveSoundParamsForVoice(chart, active.card.voice, active.card.modifier)
    : deriveSoundParamsForVoice(chart, '—', '点拍');
  const light = deriveLightParams(score);

  // 跟着具身时间轴走:播放中，一旦"当前活跃声部"发生切换，自动触发一次对应声音——
  // 声音不再是与身体脱节的静态快照，而是随身体进场节奏一起走
  useEffect(() => {
    if (!isPlaying || !active) return;
    const key = `${active.card.voice}-${active.card.startTime}-${active.isSuspension}`;
    if (lastAutoKeyRef.current !== key) {
      lastAutoKeyRef.current = key;
      synthInstance.playStateSound(sound);
    }
  }, [isPlaying, active?.card.voice, active?.card.startTime, active?.isSuspension]);

  const handleManualPlay = () => {
    synthInstance.playStateSound(sound, () => setManualPlaying(false));
    setManualPlaying(true);
  };

  return (
    <section className="border border-[var(--ink)] bg-[var(--bg)] p-4 md:p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <span className="bg-[var(--ink)] text-[var(--bg)] mono text-[10px] font-bold px-1.5 py-0.5">[ 07 ]</span>
          <span className="text-[var(--mut)] mono text-xs ml-2 uppercase">Sound / Light · 声光参数(跟随具身时间轴，非静态快照)</span>
        </div>
        <div className="flex items-center gap-2">
          {isPlaying && (
            <span className="flex items-center gap-1 text-[9px] text-[var(--ink)] font-bold mono">
              <Radio size={10} className="animate-pulse" /> 跟随播放中 · {playbackTime.toFixed(1)}s
            </span>
          )}
          <button
            onClick={handleManualPlay}
            disabled={manualPlaying}
            className="flex items-center gap-1.5 border border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] px-3 py-1.5 text-[11px] font-bold uppercase disabled:opacity-40"
          >
            <Volume2 size={12} /> {manualPlaying ? '播放中…' : '试听当前声部'}
          </button>
        </div>
      </div>

      <div className="border border-[var(--line-strong)] bg-[var(--sunk)] px-2.5 py-1.5 text-[10px] text-[var(--mut)] flex items-center justify-between">
        <span>
          当前活跃声部:<b className="text-[var(--ink)]">{active?.card.voice || '—'}</b>
          {active?.isSuspension && <span className="ml-1">(悬持段·五声部同时在场,以天下代表持续状态)</span>}
        </span>
        <span>{active ? `${active.card.startTime.toFixed(1)}s – ${active.card.endTime.toFixed(1)}s` : ''}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="border border-[var(--line-strong)] p-2.5">
          <span className="text-[9px] text-[var(--mut)] uppercase block mb-1">几何(声音) · GEOMETRY</span>
          <span className="text-lg font-black">{sound.geometry}</span>
          <p className="text-[10px] text-[var(--mut)] mt-1">{sound.geometryReason}</p>
        </div>
        <div className="border border-[var(--line-strong)] p-2.5">
          <span className="text-[9px] text-[var(--mut)] uppercase block mb-1">根音 · ROOT (当晚律吕)</span>
          <span className="text-lg font-black">{sound.lu}</span>
          <p className="text-[10px] text-[var(--mut)] mt-1">{sound.fundamentalHz} Hz</p>
        </div>
        <div className="border border-[var(--line-strong)] p-2.5">
          <span className="text-[9px] text-[var(--mut)] uppercase block mb-1">灯光强度 · INTENSITY</span>
          <span className="text-lg font-black">{light.intensityPercent}%</span>
          <p className="text-[10px] text-[var(--mut)] mt-1">{light.intensityLabel}(读音量,宫位级)</p>
        </div>
        <div className="border border-[var(--line-strong)] p-2.5">
          <span className="text-[9px] text-[var(--mut)] uppercase block mb-1">色温 · COLOR TEMP</span>
          <span className="text-lg font-black">{light.colorTempK}K</span>
          <p className="text-[10px] text-[var(--mut)] mt-1">{light.colorTempLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-[var(--mut)] pt-2 border-t border-[var(--line)]">
        <Sparkles size={11} />
        <span>灯光行为:{light.behavior} · 声音几何逐声部切换,灯光强度/色温为宫位级、全程恒定</span>
      </div>
    </section>
  );
};
