import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  BasicEffortName,
  QimenChart,
  PalaceScore,
  EmbodimentScore,
} from './types';
import { build_chart, map_chart_to_score } from './engine/qimen';
import { generateEmbodimentScore } from './engine/embodiment';
import { TopHud } from './components/TopHud';
import { StageAConsole } from './components/StageAConsole';
import { LuoshuGrid } from './components/LuoshuGrid';
import { Matrix64Grid } from './components/Matrix64Grid';
import { EmbodimentTimeline } from './components/EmbodimentTimeline';
import { ActionCardsGrid } from './components/ActionCardsGrid';
import { WhyThisResultPanel } from './components/WhyThisResultPanel';
import { SoundLightPanel } from './components/SoundLightPanel';
import { GuqinSpatialModule } from './components/GuqinSpatialModule';
import { FutureProtocolsPanel } from './components/FutureProtocolsPanel';
import { InspectorPanel } from './components/InspectorPanel';
import { FullScoreModal } from './components/FullScoreModal';
import { Sparkles, Layers, ArrowDown } from 'lucide-react';

export default function App() {
  // 1. 起局控制参数
  const [dateStr, setDateStr] = useState<string>('2026-04-28');
  const [hour, setHour] = useState<number>(5);
  const [cfgFusuo, setCfgFusuo] = useState<'值符星' | '天芮'>('值符星');
  const [forceTuling, setForceTuling] = useState<boolean>(true);

  // 2. 宫位与检视选择
  const [selectedPalaceId, setSelectedPalaceId] = useState<number>(7);
  const [palaceDuration, setPalaceDuration] = useState<number>(100);
  const [inspectorMode, setInspectorMode] = useState<'palace' | 'cell'>('palace');
  const [selectedCell, setSelectedCell] = useState<{
    row: BasicEffortName;
    col: BasicEffortName;
  }>({
    row: '漂浮',
    col: '漂浮',
  });
  const [activeVoiceName, setActiveVoiceName] = useState<string | undefined>(undefined);
  const [isFullScoreOpen, setIsFullScoreOpen] = useState<boolean>(false);

  // 3. 确定性计算奇门盘与九宫和弦 (严禁 Math.random)
  const chart: QimenChart = useMemo(() => {
    return build_chart(dateStr, hour, cfgFusuo, forceTuling);
  }, [dateStr, hour, cfgFusuo, forceTuling]);

  const scoreMap: Record<number, PalaceScore> = useMemo(() => {
    return map_chart_to_score(chart);
  }, [chart]);

  // 当盘初始化时，默认选择值符所在宫
  useEffect(() => {
    if (chart?.zhifu_palace) {
      setSelectedPalaceId(chart.zhifu_palace);
    }
  }, [chart?.zhifu_palace]);

  // 4. 确定性生成当前宫具身化乐谱 (Embodiment Score)
  const embodimentScore: EmbodimentScore | null = useMemo(() => {
    if (!chart || !scoreMap[selectedPalaceId]) return null;
    return generateEmbodimentScore(
      selectedPalaceId,
      palaceDuration,
      chart,
      scoreMap[selectedPalaceId]
    );
  }, [selectedPalaceId, palaceDuration, chart, scoreMap]);

  // 4.1 播放时钟状态提升到此处，供具身时间轴与声光模块共用同一份 playbackTime/isPlaying，
  //     避免声光模块各自维护一份独立的、跟身体不同步的"快照"状态
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    setPlaybackTime(0);
    setIsPlaying(false);
  }, [embodimentScore?.palaceId, embodimentScore?.totalDuration]);

  useEffect(() => {
    if (!isPlaying || !embodimentScore) return;
    const interval = setInterval(() => {
      setPlaybackTime((prev) => {
        if (prev >= embodimentScore.totalDuration) {
          setIsPlaying(false);
          return embodimentScore.totalDuration;
        }
        return Math.min(prev + 0.1, embodimentScore.totalDuration);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, embodimentScore]);

  const handleTogglePlay = () => setIsPlaying((p) => !p);
  const handleResetPlayback = () => {
    setIsPlaying(false);
    setPlaybackTime(0);
  };

  // 生成区域滚动引用
  const embodimentSectionRef = useRef<HTMLDivElement>(null);

  // 交互处理器
  const handleSelectPalace = (id: number) => {
    setSelectedPalaceId(id);
    setInspectorMode('palace');
    setActiveVoiceName(undefined);
  };

  const handleSelectCell = (row: BasicEffortName, col: BasicEffortName) => {
    setSelectedCell({ row, col });
    setInspectorMode('cell');
  };

  const handleSwitchToPalace = () => {
    setInspectorMode('palace');
  };

  const handleLoadPreset = (d: string, h: number) => {
    setDateStr(d);
    setHour(h);
    setInspectorMode('palace');
  };

  const handleCalculate = () => {
    setInspectorMode('palace');
    if (chart?.zhifu_palace) {
      setSelectedPalaceId(chart.zhifu_palace);
    }
  };

  const handleGenerateEmbodiment = () => {
    setInspectorMode('palace');
    if (embodimentSectionRef.current) {
      embodimentSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen text-xs md:text-sm bg-[var(--surf)] text-[var(--ink)] font-sans selection:bg-[var(--ink)] selection:text-[var(--bg)]">
      {/* 顶部状态栏 */}
      <TopHud currentDateStr={dateStr} currentHour={hour} />

      {/* 主工作区 */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧主要工作流 (Stage A -> B -> C -> D -> E -> F) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stage A: 控制台 */}
          <StageAConsole
            dateStr={dateStr}
            hour={hour}
            cfgFusuo={cfgFusuo}
            forceTuling={forceTuling}
            chart={chart}
            onDateChange={setDateStr}
            onHourChange={setHour}
            onFusuoChange={setCfgFusuo}
            onTulingChange={setForceTuling}
            onCalculate={handleCalculate}
            onLoadPreset={handleLoadPreset}
          />

          {/* Stage B: 九宫力效总谱 */}
          <LuoshuGrid
            chart={chart}
            scoreMap={scoreMap}
            selectedPalaceId={selectedPalaceId}
            onSelectPalace={handleSelectPalace}
          />

          {/* Stage C: 64 格叠加矩阵 */}
          <Matrix64Grid
            currentScore={scoreMap[selectedPalaceId]}
            selectedCell={selectedCell}
            onSelectCell={handleSelectCell}
          />

          {/* Stage D & E & F: 具身生成器 (Embodiment Generator) 锚点 */}
          <div ref={embodimentSectionRef} className="space-y-6 pt-2">
            {/* 具身时间结构轴 (Stage D) */}
            <EmbodimentTimeline
              embodimentScore={embodimentScore}
              activeVoiceName={activeVoiceName}
              onSelectVoice={setActiveVoiceName}
              playbackTime={playbackTime}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onReset={handleResetPlayback}
            />

            {/* 声部具身动作生成卡 (Stage E) */}
            {embodimentScore && (
              <ActionCardsGrid
                cards={embodimentScore.cards}
                suspension={embodimentScore.suspension}
                selectedVoiceName={activeVoiceName}
                onSelectVoice={setActiveVoiceName}
              />
            )}

            {/* WHY THIS RESULT? 可解释性与因果链 (Stage F) */}
            <WhyThisResultPanel score={embodimentScore} />

            <SoundLightPanel
              chart={chart}
              score={scoreMap[selectedPalaceId] || null}
              embodimentScore={embodimentScore}
              playbackTime={playbackTime}
              isPlaying={isPlaying}
            />
            <GuqinSpatialModule />
            <FutureProtocolsPanel
              chart={chart}
              embodimentScore={embodimentScore}
              playbackTime={playbackTime}
            />
          </div>
        </div>

        {/* 右侧实时检视面板 (Sticky Console) */}
        <div className="lg:col-span-4">
          <div className="sticky top-16 border border-[var(--ink)] bg-[var(--surf)] p-4 space-y-4">
            <InspectorPanel
              chart={chart}
              scoreMap={scoreMap}
              selectedPalaceId={selectedPalaceId}
              selectedCell={selectedCell}
              inspectorMode={inspectorMode}
              palaceDuration={palaceDuration}
              embodimentScore={embodimentScore}
              onDurationChange={setPalaceDuration}
              onSelectCell={handleSelectCell}
              onSwitchToPalace={handleSwitchToPalace}
              onGenerateEmbodiment={handleGenerateEmbodiment}
              onOpenFullScore={() => setIsFullScoreOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* 完整具身谱弹出层 */}
      <FullScoreModal
        score={embodimentScore}
        isOpen={isFullScoreOpen}
        onClose={() => setIsFullScoreOpen(false)}
      />

      {/* 页脚 */}
      <footer className="max-w-7xl mx-auto px-4 md:px-6 py-6 border-t border-[var(--line)] text-[10px] text-[var(--mut)] leading-relaxed space-y-2 mono">
        <p>
          <strong className="text-[var(--mut)]">METHODOLOGY</strong>: 奇门在此作为<strong>确定性编舞算法与符号发生器</strong>，非占断预测。同一时间输入 → 同一盘 → 同一组符号状态 → 同一力效谱 → 同一具身动作。Stage A 起局 (转盘·拆补) + Stage B 力效映射: 每宫五声部 (神/星/门/天盘干/地盘干) 经 64 格方阵取质感，叠成一个力效和弦；音量←九星时应，时值←八门动静，协克←十干克应。
        </p>
        <p>
          <strong className="text-[var(--mut)]">EMBODIMENT DYNAMICS</strong>: 按照三分损益四段权重 (EMBODY_W4) 依序进入，天下声部作为 Coda 与天上形成共振/协和/克战；值使宫密接和应若遇极反 Effort，自动压缩入场段并开启五声部全在场悬持段 (Suspension)。
        </p>
        <p className="text-[9px] text-right text-[var(--dim)]">
          QIMEN → EFFORT → EMBODIMENT · DETERMINISTIC GENERATIVE SCORE SYSTEM · ALGORITHM CALIBRATED WITH YIXINSOFT
        </p>
      </footer>
    </div>
  );
}
