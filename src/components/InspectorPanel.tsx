import React, { useState } from 'react';
import {
  BasicEffortName,
  QimenChart,
  PalaceScore,
  EmbodimentScore,
} from '../types';
import { DIR_NAME, BASE_OF_ROLE, OPP_EFF } from '../engine/data';
import { getCellData } from '../engine/effort';
import {
  Play,
  Copy,
  Check,
  FileText,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface InspectorPanelProps {
  chart: QimenChart | null;
  scoreMap: Record<number, PalaceScore> | null;
  selectedPalaceId: number;
  selectedCell: { row: BasicEffortName; col: BasicEffortName };
  inspectorMode: 'palace' | 'cell';
  palaceDuration: number;
  embodimentScore: EmbodimentScore | null;
  onDurationChange: (dur: number) => void;
  onSelectCell: (row: BasicEffortName, col: BasicEffortName) => void;
  onSwitchToPalace: () => void;
  onGenerateEmbodiment: () => void;
  onOpenFullScore: () => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  chart,
  scoreMap,
  selectedPalaceId,
  selectedCell,
  inspectorMode,
  palaceDuration,
  embodimentScore,
  onDurationChange,
  onSelectCell,
  onSwitchToPalace,
  onGenerateEmbodiment,
  onOpenFullScore,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!chart || !scoreMap) return null;

  const currentScore = scoreMap[selectedPalaceId];

  const handleCopy = () => {
    if (!embodimentScore) return;
    navigator.clipboard.writeText(embodimentScore.formattedPlainText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // -------------------------------------------------------------
  // 模式 1: 64格单元格检视器 (Grid Cell Inspector)
  // -------------------------------------------------------------
  if (inspectorMode === 'cell') {
    const { row, col } = selectedCell;
    const cellData = getCellData(row, col);

    return (
      <div className="space-y-4 mono text-xs">
        <div className="border-b border-[var(--ink)] pb-2 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[var(--mut)] block uppercase font-semibold">
              [ 04 ] 64-GRID CELL INSPECTOR
            </span>
            <h3 className="text-sm font-bold text-[var(--ink)] mt-0.5 uppercase">
              {row} (BASE) × {col} (MOD)
            </h3>
          </div>

          <div>
            {cellData.transType === 'Identity (本体)' ? (
              <span className="border border-[var(--ink)] bg-[var(--bg)] px-1.5 py-0.5 text-[9px] text-[var(--ink)] font-bold">
                IDENTITY
              </span>
            ) : cellData.transType === 'Opposition (极反)' ? (
              <span className="bg-[var(--ink)] text-[var(--bg)] px-1.5 py-0.5 text-[9px] font-bold">
                OPPOSITE
              </span>
            ) : (
              <span className="border border-[var(--line-strong)] bg-[var(--surf)] px-1.5 py-0.5 text-[9px] text-[var(--mut)]">
                MODULATION
              </span>
            )}
          </div>
        </div>

        {/* 动力学移位表 */}
        <div className="border border-[var(--line-strong)] bg-[var(--surf)] divide-y divide-[var(--line-strong)]">
          <div className="p-2 flex justify-between text-[10px]">
            <span className="text-[var(--mut)]">WEIGHT SHIFT:</span>
            <span className="text-[var(--ink)] font-bold">{cellData.weightShift}</span>
          </div>
          <div className="p-2 flex justify-between text-[10px]">
            <span className="text-[var(--mut)]">SPACE SHIFT:</span>
            <span className="text-[var(--ink)] font-bold">{cellData.spaceShift}</span>
          </div>
          <div className="p-2 flex justify-between text-[10px]">
            <span className="text-[var(--mut)]">TIME SHIFT:</span>
            <span className="text-[var(--ink)] font-bold">{cellData.timeShift}</span>
          </div>
        </div>

        {/* 质感与动作短句 */}
        <div className="space-y-2 text-xs">
          <div className="border border-[var(--line-strong)] bg-[var(--bg)] p-3 space-y-1">
            <span className="text-[9px] text-[var(--mut)] uppercase block font-semibold">TEXTURE PROFILE // 质感表现</span>
            <p className="text-[var(--ink)] font-bold">{cellData.title}</p>
          </div>

          <div className="border border-[var(--line-strong)] bg-[var(--bg)] p-3 space-y-1">
            <span className="text-[9px] text-[var(--mut)] uppercase block font-semibold">SOMATIC DIRECTIVE // 动作指引</span>
            <p className="text-[var(--mut)] leading-relaxed text-[11px]">{cellData.somaticMotion}</p>
          </div>
        </div>

        {/* 符号两极投影 */}
        <div className="border border-[var(--line-strong)] bg-[var(--surf)] p-3 space-y-1.5 text-[10px]">
          <span className="text-[9px] text-[var(--mut)] block uppercase tracking-wider mb-1 border-b border-[var(--line-strong)] pb-1 font-semibold">
            SYMBOLIC POLARITY ALIGNMENT
          </span>
          <div className="space-y-1 text-[var(--mut)]">
            <div className="flex justify-between">
              <span className="text-[var(--mut)]">GUA:</span>
              <span className="font-medium">内{cellData.baseDef.gua} · 外{cellData.modDef.gua}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--mut)]">DOORS:</span>
              <span className="font-medium">{cellData.baseDef.men} 遇 {cellData.modDef.men}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--mut)]">DEITIES:</span>
              <span className="font-medium">{cellData.baseDef.shen} 遇 {cellData.modDef.shen}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--mut)]">STARS:</span>
              <span className="font-medium">{cellData.baseDef.xing} 遇 {cellData.modDef.xing}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--mut)]">STEMS:</span>
              <span className="font-medium">{cellData.baseDef.gan} 遇 {cellData.modDef.gan}</span>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onSwitchToPalace}
            className="w-full border border-[var(--line-strong)] hover:border-[var(--ink)] bg-[var(--bg)] hover:bg-[var(--surf)] text-[var(--ink)] py-2 text-xs mono uppercase cursor-pointer transition-colors font-medium"
          >
            [ ← RETURN TO PALACE CHORD ]
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 模式 2: 宫和弦与具身生成总控 (Palace Chord & Embodiment Controller)
  // -------------------------------------------------------------
  const isZhifu = selectedPalaceId === chart.zhifu_palace;
  const isZhishi = selectedPalaceId === chart.zhishi_palace;
  const door = chart.door_at[selectedPalaceId];
  const isJimen = door && ['开', '休', '生'].includes(door);

  const he = currentScore?.he || { type: '共振', str: '' };

  const read =
    he.type === '克战'
      ? '天地两盘相克——身体上下两层相斫、自我撕扯，本宫是张力/戏点。'
      : he.type === '共振'
      ? '天地同气比和——同质叠加、加倍放大。'
      : '天地两盘相生——上下两层顺势 morph、相互滋养，可流畅过渡。';

  const volRead =
    currentScore && ['旺', '相'].includes(currentScore.volume || '')
      ? '当令得气: 声响、动作做满，动力外扩。'
      : currentScore && ['囚', '死'].includes(currentScore.volume || '')
      ? '失气: 声虚、动作稀薄如耳语，力量内敛。'
      : '平: 中等响度，均衡释放。';

  return (
    <div className="space-y-4 mono text-xs">
      {/* 头部标题与角色标签 */}
      <div className="border-b border-[var(--ink)] pb-2 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[var(--mut)] block uppercase font-semibold">
            [ 04 ] PALACE CHORD INSPECTOR
          </span>
          <h3 className="text-base font-black text-[var(--ink)] mt-0.5">
            〔0{selectedPalaceId} {DIR_NAME[selectedPalaceId]}〕
          </h3>
        </div>

        <div>
          {isZhifu && (
            <span className="border border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] px-1.5 py-0.5 text-[9px] font-bold">
              ★ ZHIFU (EXPOSITION)
            </span>
          )}
          {isZhishi && (
            <span className="border border-[var(--ink)] bg-[var(--sunk)] px-1.5 py-0.5 text-[9px] text-[var(--ink)] font-bold">
              ◇ ZHISHI (STRETTO)
            </span>
          )}
          {!isZhifu && !isZhishi && isJimen && (
            <span className="border border-[var(--line-strong)] bg-[var(--sunk)] px-1.5 py-0.5 text-[9px] text-[var(--ink)] font-medium">
              AUSPICIOUS (DEV)
            </span>
          )}
        </div>
      </div>

      {/* 符号状态参数表 */}
      <div className="border border-[var(--line-strong)] bg-[var(--surf)] p-2.5 space-y-1 text-[10px]">
        <div className="flex justify-between text-[var(--mut)]">
          <span>STAR (星):</span>
          <span className="text-[var(--ink)] font-bold">{chart.star_at[selectedPalaceId] || '—'}</span>
        </div>
        <div className="flex justify-between text-[var(--mut)]">
          <span>DOOR (门):</span>
          <span className="text-[var(--ink)] font-bold">{chart.door_at[selectedPalaceId] || '—'}</span>
        </div>
        <div className="flex justify-between text-[var(--mut)]">
          <span>DEITY (神):</span>
          <span className="text-[var(--ink)] font-bold">{chart.shen_at[selectedPalaceId] || '—'}</span>
        </div>
        <div className="flex justify-between text-[var(--mut)]">
          <span>TIAN STEM (天盘干):</span>
          <span className="text-[var(--ink)] font-bold">{chart.sky[selectedPalaceId] || '—'}</span>
        </div>
        <div className="flex justify-between text-[var(--mut)]">
          <span>DI STEM (地盘干):</span>
          <span className="text-[var(--ink)] font-bold">{chart.earth[selectedPalaceId] || '—'}</span>
        </div>
      </div>

      {/* 音量 / 时值 / 和谐度三联表 */}
      <div className="border border-[var(--line-strong)] bg-[var(--bg)] grid grid-cols-3 divide-x divide-[var(--line-strong)] text-center text-[10px] py-2">
        <div>
          <span className="text-[var(--mut)] text-[8px] block font-medium">VOLUME (星令)</span>
          <span className="text-[var(--ink)] font-bold">{currentScore?.volume || '—'}</span>
        </div>
        <div>
          <span className="text-[var(--mut)] text-[8px] block font-medium">DURATION (门时值)</span>
          <span className="text-[var(--ink)] font-bold">{currentScore?.duration || '—'}</span>
        </div>
        <div>
          <span className="text-[var(--mut)] text-[8px] block font-medium">HARMONY (克应)</span>
          <span className={he.type === '克战' ? 'text-[var(--ink)] font-bold underline decoration-2 underline-offset-2' : 'text-[var(--ink)] font-semibold'}>
            {he.type}
          </span>
        </div>
      </div>

      {/* 核心操作区域：GENERATE EMBODIMENT 确定性生成按钮 */}
      <div className="border border-[var(--line-strong)] bg-[var(--surf)] p-3 space-y-3">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-[var(--mut)] uppercase font-semibold">TEMPORAL SCALE // 宫时长设定</span>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              value={palaceDuration}
              onChange={(e) => onDurationChange(Math.max(10, +e.target.value || 100))}
              className="w-14 text-center font-mono px-1 py-0.5 bg-[var(--bg)] border border-[var(--line-strong)] text-[var(--ink)] text-xs font-bold"
            />
            <span className="text-[var(--mut)]">SEC</span>
          </div>
        </div>

        {/* 关键生成按钮 */}
        <button
          onClick={onGenerateEmbodiment}
          className="w-full py-2.5 px-3 border border-[var(--ink)] bg-[var(--ink)] hover:bg-[var(--ink)] text-[var(--bg)] font-bold text-xs mono uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>GENERATE EMBODIMENT (生成身体谱)</span>
        </button>

        {/* 快速动作按钮: COPY & 完整谱 */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleCopy}
            disabled={!embodimentScore}
            className="flex items-center justify-center space-x-1.5 border border-[var(--line-strong)] hover:border-[var(--ink)] bg-[var(--bg)] hover:bg-[var(--sunk)] py-1.5 text-xs text-[var(--ink)] font-semibold transition-colors cursor-pointer disabled:opacity-30"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--ink)]" />
                <span className="text-[var(--ink)]">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>COPY SCORE</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenFullScore}
            disabled={!embodimentScore}
            className="flex items-center justify-center space-x-1.5 border border-[var(--line-strong)] hover:border-[var(--ink)] bg-[var(--bg)] hover:bg-[var(--sunk)] py-1.5 text-xs text-[var(--ink)] font-semibold transition-colors cursor-pointer disabled:opacity-30"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>FULL SCORE</span>
          </button>
        </div>
      </div>

      {/* 五声部力效和弦列表 */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-[var(--mut)] block uppercase font-semibold">
          VOICE CHORD MAPPING (5 VOICES)
        </span>
        <div className="border border-[var(--line-strong)] divide-y divide-[var(--line-strong)] bg-[var(--bg)]">
          {currentScore?.voices.map((v) => {
            const base = BASE_OF_ROLE[v.r] || v.base;
            const isId = base === v.eff;
            const isOp = OPP_EFF[base] === v.eff;

            return (
              <div
                key={v.r}
                className="p-2 flex justify-between items-center text-[10px] hover:bg-[var(--surf)] transition-colors"
              >
                <div>
                  <span className="text-[var(--mut)] block text-[8.5px] uppercase font-medium">
                    {v.r} ({v.e})
                  </span>
                  <span className="text-[var(--ink)] font-bold">
                    {base} × {v.eff}
                    {isId && <span className="ml-1 text-[var(--mut)] font-normal">[ID]</span>}
                    {isOp && <span className="ml-1 text-[var(--ink)] font-bold">[OPP]</span>}
                  </span>
                </div>

                <button
                  onClick={() => onSelectCell(base, v.eff)}
                  className="text-[9.5px] text-[var(--mut)] hover:text-[var(--ink)] border border-[var(--line-strong)] hover:border-[var(--ink)] bg-[var(--surf)] px-1.5 py-0.5 cursor-pointer uppercase transition-colors font-medium"
                >
                  CELL →
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 叙事与身体动力学释读 */}
      <div className="border border-[var(--line-strong)] bg-[var(--surf)] p-2.5 text-[10px] space-y-1.5">
        <span className="text-[var(--mut)] text-[8.5px] uppercase block mb-1 font-semibold">
          DRAMATURGICAL ANALYSIS // 戏剧张力解析
        </span>
        <p className="text-[var(--mut)] leading-relaxed">
          <span className="text-[var(--ink)] font-bold">CLASH/HARMONY: </span>
          {he.str} —— {read}
        </p>
        <p className="text-[var(--mut)] leading-relaxed">
          <span className="text-[var(--mut)] font-semibold">VOLUME DYNAMICS: </span>
          {currentScore?.volume} —— {volRead}
        </p>
      </div>
    </div>
  );
};
