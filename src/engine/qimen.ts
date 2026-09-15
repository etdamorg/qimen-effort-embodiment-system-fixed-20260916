import {
  GAN,
  ZHI,
  WUXING_GAN,
  SHENG,
  KE,
  ELEM2EFF,
  STAR_WX,
  DONG,
  THREE_YUAN,
  PALACE_TRIGRAM,
  PALACE_LU,
  YANG_JIE,
  JIEQI_2026,
  LIUYI_SANQI,
  STAR_HOME,
  HOME_OF_STAR,
  DOOR_HOME,
  RING,
  DUN_OF_XUN,
  SHEN_SEQ,
} from './data';
import { QimenChart, PalaceScore, KeyingResult } from '../types';

export function jdn(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  );
}

export function get_day_ganzhi_idx(y: number, m: number, d: number): number {
  const off = ((2 - jdn(2026, 6, 21)) % 60 + 60) % 60;
  return ((jdn(y, m, d) + off) % 60 + 60) % 60;
}

export function gz(idx: number): string {
  return GAN[idx % 10] + ZHI[idx % 12];
}

export function ring_pos(p: number): number {
  return RING.indexOf(p === 5 ? 2 : p);
}

export function jieqi_of(y: number, m: number, d: number): string {
  let cur = '冬至';
  for (const [nm, jm, jd] of JIEQI_2026) {
    if (jm < m || (jm === m && jd <= d)) {
      cur = nm;
    } else {
      break;
    }
  }
  return cur;
}

export function yuan_from_futou(y: number, m: number, d: number): [number, string | null] {
  const idx = get_day_ganzhi_idx(y, m, d);
  for (let b = 0; b < 10; b++) {
    const i = (idx - b + 60) % 60;
    if (i % 10 === 0 || i % 10 === 5) {
      const br = i % 12;
      if ([0, 6, 3, 9].includes(br)) return [0, gz(i)];
      if ([2, 8, 5, 11].includes(br)) return [1, gz(i)];
      return [2, gz(i)];
    }
  }
  return [0, null];
}

export function determine_ju(
  y: number,
  m: number,
  d: number
): { jq: string; yuanStr: string; dun: '阳' | '阴'; num: number } {
  const jq = jieqi_of(y, m, d);
  const [yu] = yuan_from_futou(y, m, d);
  return {
    jq,
    yuanStr: ['上', '中', '下'][yu],
    dun: YANG_JIE.has(jq) ? '阳' : '阴',
    num: THREE_YUAN[jq][yu],
  };
}

export function calculate_earth_plate(dun: '阳' | '阴', num: number): Record<number, string> {
  const e: Record<number, string> = {};
  for (let i = 0; i < 9; i++) {
    const p =
      dun === '阳' ? ((num - 1 + i) % 9) + 1 : ((num - 1 - i + 9) % 9) + 1;
    e[p] = LIUYI_SANQI[i];
  }
  return e;
}

export function hour_pillar(
  ds: number,
  hour: number
): { stem: number; branch: number; hgz: string } {
  const br = Math.floor((hour + 1) / 2) % 12;
  const zi = (ds * 2) % 10;
  const st = (zi + br) % 10;
  return { stem: st, branch: br, hgz: GAN[st] + ZHI[br] };
}

export function build_chart(
  date_str: string,
  hour: number,
  cfgFusuo: '值符星' | '天芮' = '值符星',
  forceTuling = true
): QimenChart {
  const [y, m, d] = date_str.split('-').map(Number);
  const didx = get_day_ganzhi_idx(y, m, d);
  const dstem = didx % 10;
  const { stem: hstem, branch: hbranch, hgz } = hour_pillar(dstem, hour);
  const { jq, yuanStr, dun, num } = determine_ju(y, m, d);
  const earth = calculate_earth_plate(dun, num);

  let h60 = 0;
  for (let i = 0; i < 60; i++) {
    if (i % 10 === hstem && i % 12 === hbranch) {
      h60 = i;
      break;
    }
  }

  const xun = Math.floor(h60 / 10);
  const futou = DUN_OF_XUN[xun];
  const futou_palace = +Object.keys(earth).find((p) => earth[+p] === futou)!;
  const shigan = GAN[hstem];
  const target_g = shigan === '甲' ? futou : shigan;
  const zhifu_palace = +Object.keys(earth).find((p) => earth[+p] === target_g)!;
  const zhifu_star = futou_palace === 5 ? '天禽' : STAR_HOME[futou_palace];

  const s =
    (ring_pos(zhifu_palace) - ring_pos(HOME_OF_STAR[zhifu_star]) + 8) % 8;
  const stars: Record<number, string[]> = {};
  for (let b = 1; b <= 9; b++) {
    if (b === 5) continue;
    const np = RING[(ring_pos(b) + s) % 8];
    (stars[np] = stars[np] || []).push(STAR_HOME[b]);
  }

  const twoP = RING[(ring_pos(2) + s) % 8];
  stars[twoP] = stars[twoP] || [];
  if (!stars[twoP].includes('天禽')) stars[twoP].unshift('天禽');

  const star_at: Record<number, string> = {};
  for (const p of RING) {
    const a = stars[p] || [];
    if (a.includes('天禽') && a.includes('天芮')) star_at[p] = '天禽芮';
    else if (a.length) star_at[p] = a[0];
  }

  const shen_at: Record<number, string> = {};
  const step = dun === '阳' ? 1 : -1;
  const start = ring_pos(zhifu_palace);
  for (let k = 0; k < 8; k++) {
    shen_at[RING[(start + step * k + 8) % 8]] = SHEN_SEQ[k];
  }

  const door_fuyin = futou_palace === 5;
  let door_at: Record<number, string> = {};
  let zhishi = '';
  let zhishi_palace = 0;
  let door_validated = false;

  if (door_fuyin) {
    door_at = Object.assign({}, DOOR_HOME);
    zhishi = '死';
    zhishi_palace = 2;
    door_validated = true;
  } else {
    zhishi = DOOR_HOME[futou_palace] || '死';
    const steps = h60 % 10;
    const st = ring_pos(futou_palace);
    const dir = dun === '阳' ? 1 : -1;
    zhishi_palace = RING[(st + dir * steps + 8) % 8];
    const tk = Object.keys(DOOR_HOME).find((k) => DOOR_HOME[+k] === zhishi);
    const sd = (ring_pos(zhishi_palace) - ring_pos(+tk!) + 8) % 8;
    for (const b of RING) {
      const dn = DOOR_HOME[b];
      if (dn) door_at[RING[(ring_pos(b) + sd) % 8]] = dn;
    }
  }

  const sky: Record<number, string> = {};
  for (let p = 1; p <= 9; p++) {
    if (p === 5) {
      sky[p] = earth[HOME_OF_STAR['天芮']];
      continue;
    }
    const st = star_at[p];
    if (st === '天禽芮') {
      const pr = cfgFusuo === '天芮' ? '天芮' : '天禽';
      sky[p] = earth[HOME_OF_STAR[pr]];
    } else if (st) {
      sky[p] = earth[HOME_OF_STAR[st]];
    }
  }

  const TU_JIE = new Set(['谷雨', '大暑', '霜降', '大寒']);
  let ling = '土';
  if (!(TU_JIE.has(jq) && forceTuling)) {
    const SEASON_MAP: Record<string, string> = {
      立春: '木',
      雨水: '木',
      惊蛰: '木',
      春分: '木',
      清明: '木',
      谷雨: '木',
      立夏: '火',
      小满: '火',
      芒种: '火',
      夏至: '火',
      小暑: '火',
      大暑: '火',
      立秋: '金',
      处暑: '金',
      白露: '金',
      秋分: '金',
      寒露: '金',
      霜降: '金',
      立冬: '水',
      小雪: '水',
      大雪: '水',
      冬至: '水',
      小寒: '水',
      大寒: '水',
    };
    ling = SEASON_MAP[jq] || '土';
  }

  return {
    day: gz(didx),
    hour: hgz,
    jieqi: jq,
    yuan: yuanStr,
    dun,
    num,
    futou,
    futou_palace,
    zhifu_star,
    zhifu_palace,
    zhishi,
    zhishi_palace,
    door_fuyin,
    door_validated,
    ling,
    earth,
    sky,
    star_at,
    shen_at,
    door_at,
  };
}

export function vitality(
  wx: string,
  ling: string
): '旺' | '相' | '休' | '囚' | '死' {
  if (wx === ling) return '旺';
  if (SHENG[ling] === wx) return '相';
  if (SHENG[wx] === ling) return '休';
  if (KE[wx] === ling) return '囚';
  return '死';
}

export function keying(sg: string, eg: string): KeyingResult {
  const a = WUXING_GAN[sg];
  const b = WUXING_GAN[eg];
  if (a === b) return { type: '共振', str: `${a}比和` };
  if (SHENG[a] === b) return { type: '协和', str: `${a}生${b}·天生地` };
  if (SHENG[b] === a) return { type: '协和', str: `${b}生${a}·地生天` };
  if (KE[a] === b) return { type: '克战', str: `${a}克${b}·天克地` };
  return { type: '克战', str: `${b}克${a}·地克天` };
}

export function map_chart_to_score(ch: QimenChart): Record<number, PalaceScore> {
  const sc: Record<number, PalaceScore> = {};
  for (let p = 1; p <= 9; p++) {
    if (p === 5) {
      const g = ch.sky[5];
      const eg = ch.earth[5];
      sc[5] = {
        isMiddle: true,
        voices: [
          { r: '天上', e: g, base: '点拍', eff: ELEM2EFF['干'][g] },
          { r: '天下', e: eg, base: '冲打', eff: ELEM2EFF['干'][eg] },
        ],
        he: keying(g, eg),
      };
      continue;
    }

    const shen = ch.shen_at[p];
    const star = ch.star_at[p];
    const door = ch.door_at[p] || '死';
    const skg = ch.sky[p];
    const erg = ch.earth[p];

    sc[p] = {
      isMiddle: false,
      voices: [
        { r: '神', e: shen, base: '漂浮', eff: ELEM2EFF['神'][shen] || '漂浮' },
        { r: '星', e: star, base: '滑抹', eff: ELEM2EFF['星'][star] || '滑抹' },
        { r: '门', e: door, base: '弹拂', eff: ELEM2EFF['门'][door] || '弹拂' },
        { r: '天上', e: skg, base: '点拍', eff: ELEM2EFF['干'][skg] || '点拍' },
        { r: '天下', e: erg, base: '冲打', eff: ELEM2EFF['干'][erg] || '冲打' },
      ],
      volume: vitality(STAR_WX[star] || '土', ch.ling),
      duration: DONG.has(door) ? '突' : '绵',
      he: keying(skg, erg),
    };
  }
  return sc;
}

// 当晚标题:取值符宫(=值符星所落宫位)的卦名单字 + 反查该宫固有地支得十二律吕
// 公式与依据见 Paper1 附录6.3(卦爻推导)、系统规格书表⑤(地支→十二律吕)
export function getNightTitle(chart: QimenChart): { trigram: string; lu: string; title: string } {
  const trigram = PALACE_TRIGRAM[chart.zhifu_palace] || '';
  const lu = PALACE_LU[chart.zhifu_palace] || '';
  return { trigram, lu, title: trigram && lu ? `${trigram}·${lu}` : '' };
}
