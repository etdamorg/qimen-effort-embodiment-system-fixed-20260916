import React, { useState } from 'react';
import { QimenChart, EmbodimentScore } from '../types';
import { deriveSoundParamsForVoice, deriveLightParams, getActiveCardAtTime } from '../engine/soundLight';
import { Copy, Check, Radio } from 'lucide-react';

interface FutureProtocolsPanelProps {
  chart: QimenChart | null;
  embodimentScore: EmbodimentScore | null;
  playbackTime: number;
}

const CopyRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-2 border-t border-[var(--line)] py-1.5 first:border-t-0">
      <span className="text-[var(--mut)] shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="truncate text-[var(--ink)]">{value}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
          className="shrink-0 text-[var(--mut)] hover:text-[var(--ink)]"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
        </button>
      </div>
    </div>
  );
};

export const FutureProtocolsPanel: React.FC<FutureProtocolsPanelProps> = ({ chart, embodimentScore, playbackTime }) => {
  const active = chart && embodimentScore ? getActiveCardAtTime(embodimentScore, playbackTime) : null;
  const sound = chart && active ? deriveSoundParamsForVoice(chart, active.card.voice, active.card.modifier) : null;
  const midiNote = sound ? Math.round(69 + 12 * Math.log2(sound.fundamentalHz / 440)) : null;

  return (
    <section className="border border-[var(--ink)] bg-[var(--bg)] p-4 md:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="bg-[var(--ink)] text-[var(--bg)] mono text-[10px] font-bold px-1.5 py-0.5">[ 09 ]</span>
          <span className="text-[var(--mut)] mono text-xs ml-2 uppercase">Future Interfaces · 实时协议对接参考</span>
        </div>
        <span className="text-[9px] text-[var(--mut)] flex items-center gap-1"><Radio size={10} /> 规划中,非当前已实装功能</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] mono">
        <div className="border border-[var(--line-strong)] p-2.5">
          <span className="text-[9px] text-[var(--ink)] font-bold uppercase block mb-1">OSC → TouchDesigner</span>
          <CopyRow label="endpoint" value="127.0.0.1:7000" />
          <CopyRow label="address" value="/qinju/palace/state" />
          <CopyRow
            label={`payload(t=${playbackTime.toFixed(1)}s,当前活跃声部)`}
            value={sound ? `voice=${active!.card.voice}, geometry=${sound.geometry}, hz=${sound.fundamentalHz}` : '(先播放或选中一个非中宫的宫位)'}
          />
        </div>

        <div className="border border-[var(--line-strong)] p-2.5">
          <span className="text-[9px] text-[var(--ink)] font-bold uppercase block mb-1">MIDI → Ableton(经 Push2 通路，见现有墙面引擎架构)</span>
          <CopyRow label="virtual port" value="QINJU Virtual 1" />
          <CopyRow label="note(实时,取当前根音)" value={midiNote !== null ? `MIDI ${midiNote} (${sound!.lu})` : '—'} />
          <CopyRow label="cc1 active voice(实时)" value={active ? active.card.voice : '—'} />
        </div>

        <div className="border border-[var(--line-strong)] p-2.5 opacity-70">
          <span className="text-[9px] text-[var(--ink)] font-bold uppercase block mb-1">DMX / Art-Net(灯光为宫位级,不逐声部变化)</span>
          <CopyRow label="universe" value="0" />
          <CopyRow label="说明" value="强度/色温读音量与协克,详见[07]声光面板" />
        </div>

        <div className="border border-[var(--line-strong)] p-2.5 opacity-60">
          <span className="text-[9px] text-[var(--ink)] font-bold uppercase block mb-1">动作捕捉 / 观众感应(尚无接入计划，仅占位)</span>
          <CopyRow label="mocap protocol" value="(未定)" />
          <CopyRow label="audience sensing" value="(未定)" />
        </div>
      </div>

      <p className="text-[10px] text-[var(--mut)] leading-relaxed pt-1 border-t border-[var(--line)]">
        前两块的数值现在会跟着[04]具身时间轴的播放头实时变化(voice/geometry/note 会在播放时随声部切换更新)，不是固定不变的一次性快照；DMX一块仍读取宫位级参数，见上方说明；动作捕捉/观众感应两项确实没有对接计划，如实标注为空。
      </p>
    </section>
  );
};
