/**
 * QINJU 声光参数推导 — 从已验证的真实盘面/具身谱数据推导，不使用随机数
 *
 * 依据:
 * 1. 几何(点/线/面/体) = 时间×空间正交投影，直接读取"当前活跃声部"的掺(modifier)力效
 *    (Sound as Geometry §1 几何投影公理；与 Paper1 §6.3 三爻推导为同一底层三因子)
 *    —— 此前版本只固定读"天上"一个声部，现改为跟随具身时间轴，五声部依次轮到
 * 2. 根音 = 当晚标题的十二律吕(值符宫地支反查)，用传统十二律→十二平均律半音的固定对应
 *    (系统规格书 表⑤；不新造对应关系)
 * 3. 灯光强度/色温 = 该宫音量(旺相休囚死)与协克关系，复用已验证的 vitality/keying 结果
 *    (色温的"暖=协和/冷=克战"这一具体配色为设计选择，非结构推导，地位同表①神/干两栏编排者判断)
 */

import { PalaceScore, QimenChart, EmbodimentScore, ActionCardData } from '../types';
import { getNightTitle } from './qimen';

export type SoundGeometry = 'Point' | 'Line' | 'Plane' | 'Volume';

export interface DerivedSoundParams {
  geometry: SoundGeometry;
  geometryReason: string;
  lu: string;
  fundamentalHz: number;
  sourceVoice: string; // 当前这份声音参数取自哪个声部,便于UI标注,避免误以为是宫位级快照
}

export interface DerivedLightParams {
  intensityLabel: string;
  intensityPercent: number;
  colorTempK: number;
  colorTempLabel: string;
  behavior: string;
}

// 力效 -> (空间, 时间) 三因子中与几何相关的两项，直接复用已验证的 BASE/BLEND 三因子表
const EFFORT_SPACE_TIME: Record<string, { space: '直' | '迂'; time: '绵' | '突' }> = {
  漂浮: { space: '迂', time: '绵' },
  滑抹: { space: '直', time: '绵' },
  弹拂: { space: '迂', time: '突' },
  点拍: { space: '直', time: '突' },
  拧绞: { space: '迂', time: '绵' },
  推压: { space: '直', time: '绵' },
  劈砍: { space: '迂', time: '突' },
  冲打: { space: '直', time: '突' },
};

function geometryFromEffort(effortName: string): { geometry: SoundGeometry; reason: string } {
  const f = EFFORT_SPACE_TIME[effortName];
  if (!f) return { geometry: 'Point', reason: '未知力效，默认取点' };
  if (f.time === '突' && f.space === '直') return { geometry: 'Point', reason: `${effortName}=骤+直 → 点(瞬间聚焦)` };
  if (f.time === '突' && f.space === '迂') return { geometry: 'Line', reason: `${effortName}=骤+迂 → 线(轨迹划开)` };
  if (f.time === '绵' && f.space === '直') return { geometry: 'Plane', reason: `${effortName}=绵+直 → 面(持续铺展)` };
  return { geometry: 'Volume', reason: `${effortName}=绵+迂 → 体(持续包裹)` };
}

// 十二律吕 -> 十二平均律半音偏移(以黄钟=C为基准，传统固定对应，不新造)
const LU_SEMITONE: Record<string, number> = {
  黄钟: 0, 大吕: 1, 太簇: 2, 夹钟: 3, 姑洗: 4, 仲吕: 5,
  蕤宾: 6, 林钟: 7, 夷则: 8, 南吕: 9, 无射: 10, 应钟: 11,
};
const BASE_HZ_HUANGZHONG = 130.81; // c3，取古琴六弦"清宫"音高为黄钟基准

/** 在具身谱的时间轴上，找出某一时间点(秒)"累积在场"的全部声部卡片——
 *  五声部叠合、进场后不退场，这里返回的是当前正在叠加中的整个和弦，不是单一声部。
 *  悬持段全部五声部都在场。 */
export function getActiveVoicesAtTime(score: EmbodimentScore, time: number): ActionCardData[] {
  if (score.suspension && time >= score.suspension.startTime) {
    return score.cards; // 悬持段:五声部全部在场
  }
  return score.cards.filter((c) => time >= c.startTime);
}

/** 在具身谱的时间轴上，找出某一时间点(秒)最新进场、当前主导的那张声部卡片。
 *  悬持段五声部同时在场，无单一"主导声部"，按惯例取天下(收束声部,cards[4])代表持续状态，并单独标注。 */
export function getActiveCardAtTime(
  score: EmbodimentScore,
  time: number
): { card: ActionCardData; isSuspension: boolean } | null {
  if (score.suspension && time >= score.suspension.startTime && time <= score.suspension.endTime) {
    return { card: score.cards[4], isSuspension: true };
  }
  const found = score.cards.find((c) => time >= c.startTime && time <= c.endTime);
  if (found) return { card: found, isSuspension: false };
  // 容错:浮点误差导致卡在两段之间时，取最后一张卡片兜底，不返回 null 造成UI空白
  return score.cards.length ? { card: score.cards[score.cards.length - 1], isSuspension: false } : null;
}

/** 累积和弦的复合几何:把当前所有在场声部各自的几何取并集展示(不是单值)，
 *  真正反映"这一刻是几个几何叠在一起"而不是"这一刻是哪一个几何"。 */
export function deriveCompoundGeometry(
  activeVoices: ActionCardData[]
): { geometries: SoundGeometry[]; label: string; densityCount: number } {
  const uniq: SoundGeometry[] = [];
  activeVoices.forEach((c) => {
    const { geometry } = geometryFromEffort(c.modifier);
    if (!uniq.includes(geometry)) uniq.push(geometry);
  });
  return { geometries: uniq, label: uniq.join(' + ') || '—', densityCount: activeVoices.length };
}

/** 给定当前活跃声部的掺(modifier)力效 + 当晚律吕，推导这一刻的声音几何参数。
 *  取代旧版"固定只读天上声部"的做法——现在跟随具身时间轴，五声部依次轮到。 */
export function deriveSoundParamsForVoice(
  chart: QimenChart,
  voiceRole: string,
  modifierEffort: string
): DerivedSoundParams {
  const nt = getNightTitle(chart);
  const semitone = LU_SEMITONE[nt.lu] ?? 0;
  const fundamentalHz = Number((BASE_HZ_HUANGZHONG * Math.pow(2, semitone / 12)).toFixed(2));
  const { geometry, reason } = geometryFromEffort(modifierEffort);
  return { geometry, geometryReason: reason, lu: nt.lu, fundamentalHz, sourceVoice: voiceRole };
}

// 灯光为宫位级参数(音量/协克/时值均为宫位属性，不随声部切换)，与声音的"随声部变化"不是同一颗粒度，故独立保留
export function deriveLightParams(score: PalaceScore): DerivedLightParams {
  const volMap: Record<string, { pct: number; label: string }> = {
    旺: { pct: 90, label: '旺(全亮)' },
    相: { pct: 70, label: '相(明亮)' },
    休: { pct: 45, label: '休(中等)' },
    囚: { pct: 25, label: '囚(偏暗)' },
    死: { pct: 10, label: '死(最暗)' },
  };
  const v = volMap[score.volume || '休'] || volMap['休'];

  // 色温:协和(生)偏暖、共振偏中性、克战偏冷——这是设计选择，非结构推导，地位同表①神/干两栏
  const colorMap: Record<string, { k: number; label: string }> = {
    协和: { k: 3200, label: '3200K 暖白(设计选择,非结构推导)' },
    共振: { k: 4500, label: '4500K 中性(设计选择,非结构推导)' },
    克战: { k: 6500, label: '6500K 冷白(设计选择,非结构推导)' },
  };
  const c = colorMap[score.he.type] || colorMap['协和'];

  const behavior = score.duration === '突' ? '骤变:阶跃式切换' : '绵延:渐变过渡';

  return { intensityPercent: v.pct, intensityLabel: v.label, colorTempK: c.k, colorTempLabel: c.label, behavior };
}

