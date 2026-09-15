import React from 'react';
import { QimenChart } from '../types';
import { getNightTitle } from '../engine/qimen';
import { Play, RotateCcw, AlertTriangle, BookmarkCheck } from 'lucide-react';

interface StageAConsoleProps {
  dateStr: string;
  hour: number;
  cfgFusuo: '值符星' | '天芮';
  forceTuling: boolean;
  chart: QimenChart | null;
  onDateChange: (d: string) => void;
  onHourChange: (h: number) => void;
  onFusuoChange: (val: '值符星' | '天芮') => void;
  onTulingChange: (val: boolean) => void;
  onCalculate: () => void;
  onLoadPreset: (d: string, h: number) => void;
}

export const StageAConsole: React.FC<StageAConsoleProps> = ({
  dateStr,
  hour,
  cfgFusuo,
  forceTuling,
  chart,
  onDateChange,
  onHourChange,
  onFusuoChange,
  onTulingChange,
  onCalculate,
  onLoadPreset,
}) => {
  return (
    <section className="border border-[var(--ink)] bg-[var(--bg)] p-4 md:p-5 space-y-4">
      {/* Section Header with crisp dividing line */}
      <div className="flex items-center justify-between border-b border-[var(--ink)] pb-2">
        <div className="flex items-center space-x-2">
          <span className="bg-[var(--ink)] text-[var(--bg)] mono text-[10px] font-bold px-1.5 py-0.5">[ 01 ]</span>
          <h2 className="text-xs tracking-[0.1em] uppercase mono text-[var(--ink)] font-bold">
            STAGE A / QIMEN INPUT CONSOLE · 起局参数控制台
          </h2>
        </div>
        <span className="text-[10px] text-[var(--mut)] mono uppercase tracking-wider">
          DETERMINISTIC / UTC+8
        </span>
      </div>

      {/* Inputs Form */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-1">
        <div className="space-y-1">
          <label className="block text-[9px] mono uppercase tracking-wider text-[var(--mut)] font-medium">
            DATE // 公历日期
          </label>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full bg-[var(--surf)] border-b-2 border-[var(--line-strong)] focus:border-[var(--ink)] text-[var(--ink)] px-2 py-1.5 font-mono text-xs focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[9px] mono uppercase tracking-wider text-[var(--mut)] font-medium">
            HOUR // 时辰
          </label>
          <select
            value={hour}
            onChange={(e) => onHourChange(parseInt(e.target.value, 10))}
            className="w-full bg-[var(--surf)] border-b-2 border-[var(--line-strong)] focus:border-[var(--ink)] text-[var(--ink)] px-1.5 py-1.5 font-mono text-xs focus:outline-none transition-colors"
          >
            <option value={23}>子时 23:00–01:00</option>
            <option value={1}>丑时 01:00–03:00</option>
            <option value={3}>寅时 03:00–05:00</option>
            <option value={5}>卯时 05:00–07:00</option>
            <option value={7}>辰时 07:00–09:00</option>
            <option value={9}>巳时 09:00–11:00</option>
            <option value={11}>午时 11:00–13:00</option>
            <option value={13}>未时 13:00–15:00</option>
            <option value={15}>申时 15:00–17:00</option>
            <option value={17}>酉时 17:00–19:00</option>
            <option value={19}>戌时 19:00–21:00</option>
            <option value={21}>亥时 21:00–23:00</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-[9px] mono uppercase tracking-wider text-[var(--mut)] font-medium">
            TIANPAN GAN // 符魄寄宫
          </label>
          <select
            value={cfgFusuo}
            onChange={(e) => onFusuoChange(e.target.value as '值符星' | '天芮')}
            className="w-full bg-[var(--surf)] border-b-2 border-[var(--line-strong)] focus:border-[var(--ink)] text-[var(--ink)] px-1.5 py-1.5 font-mono text-xs focus:outline-none transition-colors"
          >
            <option value="值符星">值符星之干 (协和)</option>
            <option value="天芮">天芮之干 (克战)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-[9px] mono uppercase tracking-wider text-[var(--mut)] font-medium">
            SEASON LING // 音量时令
          </label>
          <select
            value={forceTuling ? '土' : '时令'}
            onChange={(e) => onTulingChange(e.target.value === '土')}
            className="w-full bg-[var(--surf)] border-b-2 border-[var(--line-strong)] focus:border-[var(--ink)] text-[var(--ink)] px-1.5 py-1.5 font-mono text-xs focus:outline-none transition-colors"
          >
            <option value="土">土令 (土王用事)</option>
            <option value="时令">随季 (木火金水)</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={onCalculate}
            className="w-full py-1.5 px-3 border border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] hover:bg-[var(--ink)] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer font-medium"
          >
            [ RUN QIMEN ]
          </button>
        </div>
      </div>

      {/* Presets Row */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--sunk)] text-[10px] mono">
        <span className="text-[var(--mut)] uppercase font-medium">PRESETS:</span>
        <button
          onClick={() => onLoadPreset('2026-04-28', 5)}
          className="border border-[var(--line-strong)] bg-[var(--surf)] hover:border-[var(--dim)] text-[var(--mut)] hover:text-[var(--ink)] px-2 py-0.5 transition-colors cursor-pointer"
        >
          0428 卯时 · 谷雨中元阳二局
        </button>
        <button
          onClick={() => onLoadPreset('2026-06-22', 13)}
          className="border border-[var(--line-strong)] bg-[var(--surf)] hover:border-[var(--dim)] text-[var(--mut)] hover:text-[var(--ink)] px-2 py-0.5 transition-colors cursor-pointer"
        >
          0622 未时 · 夏至上元阴九局
        </button>
      </div>

      {/* Night Title — 当晚标题:值符宫卦名 · 十二律吕 */}
      {chart && (() => {
        const nt = getNightTitle(chart);
        return nt.title ? (
          <div className="border border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] px-4 py-3 flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-widest mono opacity-70 block mb-1">
                NIGHT TITLE · 当晚标题
              </span>
              <span className="text-xl font-black tracking-wide">《{nt.title}》</span>
            </div>
            <span className="text-[9px] mono opacity-60 text-right leading-relaxed">
              值符宫{chart.zhifu_palace} · {nt.trigram}卦
              <br />
              → 地支查律吕 · {nt.lu}
            </span>
          </div>
        ) : null;
      })()}

      {/* Qimen State Meta Grid */}
      {chart && (
        <div className="border border-[var(--line-strong)] bg-[var(--surf)] grid grid-cols-2 sm:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-[var(--line-strong)] text-xs mono">
          <div className="p-2.5">
            <span className="text-[9px] text-[var(--mut)] uppercase block mb-0.5 font-medium">干支日时</span>
            <span className="text-[var(--ink)] font-bold">{chart.day} {chart.hour}</span>
          </div>
          <div className="p-2.5">
            <span className="text-[9px] text-[var(--mut)] uppercase block mb-0.5 font-medium">节气 / 元</span>
            <span className="text-[var(--ink)] font-bold">{chart.jieqi} · {chart.yuan}元</span>
          </div>
          <div className="p-2.5">
            <span className="text-[9px] text-[var(--mut)] uppercase block mb-0.5 font-medium">定局</span>
            <span className="text-[var(--ink)] font-bold">{chart.dun}遁 {chart.num}局</span>
          </div>
          <div className="p-2.5">
            <span className="text-[9px] text-[var(--mut)] uppercase block mb-0.5 font-medium">符头 / 旬遁</span>
            <span className="text-[var(--ink)] font-bold">{chart.futou} ({chart.futou_palace}宫)</span>
          </div>
          <div className="p-2.5">
            <span className="text-[9px] text-[var(--mut)] uppercase block mb-0.5 font-medium">当令 (音量令)</span>
            <span className="text-[var(--ink)] font-bold">{chart.ling}令 ({forceTuling ? '土王' : '随季'})</span>
          </div>
          <div className="p-2.5">
            <span className="text-[9px] text-[var(--mut)] uppercase block mb-0.5 font-medium">值符 → 值使</span>
            <span className="text-[var(--ink)] font-bold">{chart.zhifu_star}·{chart.zhifu_palace} → {chart.zhishi}·{chart.zhishi_palace}</span>
          </div>
        </div>
      )}

      {/* Flags & Warnings */}
      {chart && (chart.door_fuyin || !chart.door_validated) && (
        <div className="flex flex-wrap gap-2 text-[10px] mono">
          {chart.door_fuyin && (
            <span className="border border-[var(--line-strong)] bg-[var(--sunk)] px-2 py-0.5 text-[var(--mut)]">
              STATE: 门盘伏吟 (符头入中·寄死门于坤二)
            </span>
          )}
          {!chart.door_validated && (
            <span className="border border-[var(--line-strong)] bg-[var(--surf)] px-2 py-0.5 text-[var(--mut)]">
              STATUS: 门盘标准计数·未对拍
            </span>
          )}
        </div>
      )}
    </section>
  );
};
