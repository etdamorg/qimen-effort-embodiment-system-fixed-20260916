import { BasicEffortName, EffortDef } from '../types';
import { EFF, OPP_EFF, B } from './data';

export function getEffortDef(name: BasicEffortName): EffortDef {
  return EFF.find((e) => e.n === name) || EFF[0];
}

export function isIdentity(base: BasicEffortName, modifier: BasicEffortName): boolean {
  return base === modifier;
}

export function isOpposite(base: BasicEffortName, modifier: BasicEffortName): boolean {
  return OPP_EFF[base] === modifier;
}

export function getTransformationType(
  base: BasicEffortName,
  modifier: BasicEffortName
): 'Identity (本体)' | 'Opposition (极反)' | 'Modulation (调制)' {
  if (isIdentity(base, modifier)) return 'Identity (本体)';
  if (isOpposite(base, modifier)) return 'Opposition (极反)';
  return 'Modulation (调制)';
}

export function getCellData(
  base: BasicEffortName,
  modifier: BasicEffortName
): {
  title: string;
  somaticMotion: string;
  baseDef: EffortDef;
  modDef: EffortDef;
  weightShift: string;
  spaceShift: string;
  timeShift: string;
  transType: 'Identity (本体)' | 'Opposition (极反)' | 'Modulation (调制)';
} {
  const bDef = getEffortDef(base);
  const mDef = getEffortDef(modifier);
  const cell = B[base]?.[modifier] || ['未定义质感', '未定义身体动作'];
  const transType = getTransformationType(base, modifier);

  return {
    title: cell[0],
    somaticMotion: cell[1],
    baseDef: bDef,
    modDef: mDef,
    weightShift: bDef.w === mDef.w ? `${bDef.w} (恒定)` : `${bDef.w} → ${mDef.w}`,
    spaceShift: bDef.s === mDef.s ? `${bDef.s} (恒定)` : `${bDef.s} → ${mDef.s}`,
    timeShift: bDef.t === mDef.t ? `${bDef.t} (恒定)` : `${bDef.t} → ${mDef.t}`,
    transType,
  };
}
