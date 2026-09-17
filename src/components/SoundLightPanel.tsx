import React, { useEffect, useRef, useState } from 'react';
import { QimenChart, PalaceScore, EmbodimentScore } from '../types';
import {
  deriveSoundParamsForVoice,
  deriveLightParams,
  getActiveCardAtTime,
  getActiveVoicesAtTime,
  deriveCompoundGeometry,
} from '../engine/soundLight';
import { synthInstance } from '../engine/audioSynthesizer';
import { Volume2, Sparkles, Radio, Layers } from 'lucide-react';

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

  // "主导声部" —— 最新进场、驱动音高/触发音频的那一个(仍是单值，因为一次只弹一个音符是合理的)
  const active = getActiveCardAtTime(embodimentScore, playbackTime);
  const sound = active
    ? deriveSoundParamsForVoice(chart, active.card.voice, active.card.modifier)
    : deriveSoundParamsForVoice(chart, '—', '点拍');
  const light = deriveLightParams(score);

  // "累积和弦" —— 五声部叠合、进场后不退场，这里是当前真正全部在场的声部集合与复合几何，
  // 不是单一声部的替代品，而是对"身体/声音/灯光读同一个完整结构"这个论点的直接呼应
  const activeVoices = getActiveVoicesAtTime(embodimentScore, playbackTime);
  const compound = deriveCompoundGeometry(activeVoices);

  // 播放头回到0(初次加载,或按了重置)时清空记录——否则重置重播同一宫，
  // 第一个声部会被误判成"已经自动触发过"而不再发声
  useEffect(() => {
    if (playbackTime === 0) {
      lastAutoKeyRef.current = null;
    }
  }, [playbackTime]);

  // 跟着具身时间轴走:播放中，一旦"主导声部"发生切换，自动触发一次对应声音——
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
            <Volume2 size={12} /> {manualPlaying ? '播放中…' : '试听主导声部'}
          </button>
        </div>
      </div>

      <div className="border border-[var(--line-strong)] bg-[var(--sunk)] px-2.5 py-1.5 text-[10px] text-[var(--mut)] flex items-center justify-between flex-wrap gap-1">
        <span>
          主导声部(驱动音高):<b className="text-[var(--ink)]">{active?.card.voice || '—'}</b>
          {active?.isSuspension && <span className="ml-1">(悬持段·五声部同时在场,以天下代表持续状态)</span>}
        </span>
        <span>{active ? `${active.card.startTime.toFixed(1)}s – ${active.card.endTime.toFixed(1)}s` : ''}</span>
      </div>

      <div className="border border-[var(--ink)] px-2.5 py-2 text-[11px] flex items-center justify-between flex-wrap gap-2">
        <span className="flex items-center gap-1.5 text-[var(--mut)]">
          <Layers size={12} />
          当前累积和弦(全部在场声部,非单一声部):
        </span>
        <span className="font-black">
          {compound.label} <span className="text-[var(--mut)] font-normal">· {activeVoices.map((v) => v.voice).join('、') || '—'}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="border border-[var(--line-strong)] p-2.5">
          <span className="text-[9px] text-[var(--mut)] uppercase block mb-1">几何(主导声部) · GEOMETRY</span>
          <span className="text-lg font-black">{sound.geometry}</span>
          <p className="text-[10px] text-[var(--mut)] mt-1">{sound.geometryReason}</p>
        </div>
        <div className="border border-[var(--line-strong)] p-2.5">
          <span className="text-[9px] text-[var(--mut)] uppercase block mb-1">根音 · ROOT (当晚律吕)</span>
          <span className="text-lg font-black">{sound.lu}</span>
          <p className="text-[10px] text-[var(--mut)] mt-1">{sound.fundamentalHz} Hz</p>
        </div>
        <div className="border border-[var(--line-strong)] p-2.5">
          <span className="text-[9px] text-[var(--mut)] uppercase block mb-1">密度 · DENSITY</span>
          <span className="text-lg font-black">{compound.densityCount}/5</span>
          <p className="text-[10px] text-[var(--mut)] mt-1">已进场声部数(读三分损益时间表)</p>
        </div>
        <div className="border border-[var(--line-strong)] p-2.5">
          <span className="text-[9px] text-[var(--mut)] uppercase block mb-1">色温 · COLOR TEMP</span>
          <span className="text-lg font-black">{light.colorTempK}K</span>
          <p className="text-[10px] text-[var(--mut)] mt-1">{light.colorTempLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-[var(--mut)] pt-2 border-t border-[var(--line)]">
        <Sparkles size={11} />
        <span>
          灯光强度:{light.intensityPercent}%({light.intensityLabel},读音量,宫位级) · 灯光行为:{light.behavior} ·
          灯光为宫位级、全程恒定；声音的"主导声部"与"累积和弦"两者都逐声部实时更新
        </span>
      </div>
    </section>
  );
};
