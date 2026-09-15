export type BasicEffortName =
  | '漂浮'
  | '滑抹'
  | '弹拂'
  | '点拍'
  | '拧绞'
  | '推压'
  | '劈砍'
  | '冲打';

export type BasicEffortEnglish =
  | 'Float'
  | 'Glide'
  | 'Flick'
  | 'Dab'
  | 'Wring'
  | 'Press'
  | 'Slash'
  | 'Punch';

export interface EffortDef {
  n: BasicEffortName;
  e: BasicEffortEnglish;
  w: '轻' | '强';
  s: '迂' | '直';
  t: '绵' | '突';
  gua: string;
  men: string;
  shen: string;
  xing: string;
  gan: string;
}

export type VoiceRole = '神' | '星' | '门' | '天上' | '天下';

export type KeyingType = '共振' | '协和' | '克战';

export interface KeyingResult {
  type: KeyingType;
  str: string;
}

export interface QimenChart {
  day: string;
  hour: string;
  jieqi: string;
  yuan: string;
  dun: '阳' | '阴';
  num: number;
  futou: string;
  futou_palace: number;
  zhifu_star: string;
  zhifu_palace: number;
  zhishi: string;
  zhishi_palace: number;
  door_fuyin: boolean;
  door_validated: boolean;
  ling: string;
  earth: Record<number, string>;
  sky: Record<number, string>;
  star_at: Record<number, string>;
  shen_at: Record<number, string>;
  door_at: Record<number, string>;
}

export interface VoiceScore {
  r: VoiceRole;
  e: string;
  base: BasicEffortName;
  eff: BasicEffortName;
}

export interface PalaceScore {
  isMiddle: boolean;
  voices: VoiceScore[];
  volume?: '旺' | '相' | '休' | '囚' | '死';
  duration?: '绵' | '突';
  he: KeyingResult;
}

export interface SomaticParameters {
  weight: 'Strong' | 'Light';
  time: 'Sustained' | 'Sudden';
  space: 'Direct' | 'Indirect';
  flow: 'Bound' | 'Free';
  direction: 'Spiral' | 'Sagittal (前后)' | 'Lateral (横向)' | 'Transverse (平旋)' | 'Radial (辐射)';
  initiation: 'Torso (躯干)' | 'Gaze & Head (视线/头颅)' | 'Legs & Footwork Path (步伐与移动路径)' | 'Arms (双臂/上肢)' | 'Feet & Ground Contact (足底/地面接触点)';
  continuation: string;
  release: 'Delayed (延迟释放)' | 'Abrupt (瞬间断言)' | 'Dissolving (漫散溶解)' | 'Sustained (守持不松)';
  cueSummary: string;
}

export interface ActionCardData {
  voice: VoiceRole;
  element: string;
  base: BasicEffortName;
  modifier: BasicEffortName;
  isIdentity: boolean;
  isOpposite: boolean;
  weightLabel: string;
  spaceLabel: string;
  timeLabel: string;
  textureShort: string;
  textureDesc: string;
  durationPercent: number;
  durationSec: number;
  startTime: number;
  endTime: number;
  devValue: number;
  entryMode: 'Sequential (依序立住)' | 'Simultaneous Coda (共生/克战)' | 'Suspension / Hold (极反悬持)';
  somatic: SomaticParameters;
  codaRelation?: {
    type: KeyingType;
    details: string;
  };
}

export interface SuspensionData {
  needed: boolean;
  fraction: number;
  durationSec: number;
  startTime: number;
  endTime: number;
  oppVoices: VoiceRole[];
  somaticCue: string;
}

export interface DerivationStep {
  level: string;
  from: string;
  to: string;
  principle: string;
}

export interface EmbodimentScore {
  palaceId: number;
  palaceRole: string | null;
  roleDescription: string;
  totalDuration: number;
  entryFraction: number;
  cards: ActionCardData[];
  suspension: SuspensionData | null;
  coda: {
    type: KeyingType;
    str: string;
    reading: string;
  };
  derivation: DerivationStep[];
  formattedPlainText: string;
}
