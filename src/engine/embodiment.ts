import {
  BasicEffortName,
  VoiceRole,
  QimenChart,
  PalaceScore,
  EmbodimentScore,
  ActionCardData,
  SuspensionData,
  DerivationStep,
  SomaticParameters,
} from '../types';
import {
  BASE_OF_ROLE,
  EMBODY_W4,
  EMBODY_DEV5,
  CODA_MAP,
  DIR_NAME,
  OPP_EFF,
} from './data';
import { getEffortDef, isIdentity, isOpposite, getCellData } from './effort';

export function formatSecondsToTime(x: number): string {
  const m = Math.floor(x / 60);
  const s = x - m * 60;
  return `${m.toString().padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
}

export function determinePalaceRole(
  palaceId: number,
  chart: QimenChart
): { role: string | null; description: string } {
  if (palaceId === chart.zhifu_palace) {
    return {
      role: '值符宫',
      description: '呈示部 · 从容分明，五声部依次立住，不省略、不叠奏。',
    };
  }
  if (palaceId === chart.zhishi_palace) {
    return {
      role: '值使宫',
      description: '密接和应 · 收束，全盘张力在此最集中。若遇极反力效则触发悬持。',
    };
  }
  const door = chart.door_at[palaceId];
  if (door && ['开', '休', '生'].includes(door)) {
    return {
      role: '三吉门',
      description: '发展部 · 能量流畅，可紧凑演进，或取前列抽象声部一带而过。',
    };
  }
  return { role: null, description: '此宫非值符宫/三吉门/值使宫，不生成具身化设计。' };
}

// 确定性推导可执行身体控制参数 (严禁随机，纯函数因果映射)
export function deriveSomaticParameters(
  voice: VoiceRole,
  base: BasicEffortName,
  modifier: BasicEffortName,
  heType: '共振' | '协和' | '克战'
): SomaticParameters {
  const bDef = getEffortDef(base);
  const mDef = getEffortDef(modifier);
  const isOpp = isOpposite(base, modifier);
  const isIdent = isIdentity(base, modifier);

  // Weight: 以 Base 为主导，若 Modifier 异质则形成渐变张力
  const weight: 'Strong' | 'Light' = bDef.w === '强' ? 'Strong' : 'Light';

  // Time: 以 Base 为主导
  const time: 'Sustained' | 'Sudden' = bDef.t === '绵' ? 'Sustained' : 'Sudden';

  // Space: 以 Base 为主导
  const space: 'Direct' | 'Indirect' = bDef.s === '直' ? 'Direct' : 'Indirect';

  // Flow: 约束度由内在张力决定 (极反、克战、强力量 → Bound；本体、协和、轻力量 → Free)
  let flow: 'Bound' | 'Free' = 'Free';
  if (isOpp || heType === '克战' || (bDef.w === '强' && mDef.w === '强')) {
    flow = 'Bound';
  } else if (bDef.w === '轻' && bDef.t === '绵') {
    flow = 'Free';
  } else {
    flow = isIdent ? 'Free' : 'Bound';
  }

  // Direction: 依声部功能与空间维度确定 —— 与《具身化规则草案》§6 分区映射保持一致
  let direction: SomaticParameters['direction'] = 'Sagittal (前后)';
  if (voice === '神') {
    direction = 'Spiral';
  } else if (voice === '星') {
    direction = bDef.s === '直' ? 'Sagittal (前后)' : 'Transverse (平旋)';
  } else if (voice === '门') {
    direction = 'Radial (辐射)';
  } else if (voice === '天上') {
    direction = 'Lateral (横向)';
  } else if (voice === '天下') {
    direction = isOpp ? 'Spiral' : 'Sagittal (前后)';
  }

  // Initiation: 动力发起部位 —— 依《具身化规则草案》§6:神=脊柱核心,星=头部/目光,门=步伐/移动路径,天上=双臂,天下=足底/地面接触点
  let initiation: SomaticParameters['initiation'] = 'Torso (躯干)';
  if (voice === '神') {
    initiation = 'Torso (躯干)';
  } else if (voice === '星') {
    initiation = 'Gaze & Head (视线/头颅)';
  } else if (voice === '门') {
    initiation = 'Legs & Footwork Path (步伐与移动路径)';
  } else if (voice === '天上') {
    initiation = 'Arms (双臂/上肢)';
  } else if (voice === '天下') {
    initiation = 'Feet & Ground Contact (足底/地面接触点)';
  }

  // Continuation: 动力传导链条 —— 同步依上表分区改写
  let continuation = '';
  if (voice === '神') {
    continuation = '躯干核心深层 → 纵轴螺旋 → 肩胛下沉 → 空间虚悬延展';
  } else if (voice === '星') {
    continuation = '目光先行定向 → 头颅带动颈椎转移 → 视野牵引躯干微调 → 空间中的注意力轨迹';
  } else if (voice === '门') {
    continuation = '骨盆启动重心转移 → 步伐落点与路径展开 → 膝踝顺势跟进 → 移动轨迹在空间中开阖';
  } else if (voice === '天上') {
    continuation = '肩胛稳定发力 → 双臂沿上肢展开 → 手部末端凝聚 → 力量在空中悬止或延展';
  } else {
    continuation = '足底感知地面 → 下肢承重逐节传导 → 髋关节承接冲量 → 重量如何落地的最终交代';
  }

  // Release: 力量释放方式
  let release: SomaticParameters['release'] = 'Sustained (守持不松)';
  if (bDef.t === '突' && mDef.t === '突') {
    release = 'Abrupt (瞬间断言)';
  } else if (bDef.t === '绵' && mDef.t === '绵') {
    release = isIdent ? 'Dissolving (漫散溶解)' : 'Sustained (守持不松)';
  } else if (isOpp) {
    release = 'Delayed (延迟释放)';
  } else {
    release = bDef.t === '突' ? 'Abrupt (瞬间断言)' : 'Delayed (延迟释放)';
  }

  // Somatic Cue 纯物理控制参数短句
  const cueSummary = [
    `【起始】${initiation}先确立${weight === 'Strong' ? '沉重质量' : '微浮失重'}`,
    `【形态】沿着 ${direction} 轨迹推进，空间呈现 ${space === 'Direct' ? '直线聚焦通道' : '多重迂回曲面'}`,
    `【张力】以 ${flow === 'Bound' ? '内锁阻尼 (Bound)' : '顺畅泄流 (Free)'} 维持动力传导 (${continuation})`,
    `【终止】末端采取 ${release}，完成本声部力效着落`,
  ].join('；');

  return {
    weight,
    time,
    space,
    flow,
    direction,
    initiation,
    continuation,
    release,
    cueSummary,
  };
}

export function generateEmbodimentScore(
  palaceId: number,
  totalDuration: number,
  chart: QimenChart,
  score: PalaceScore
): EmbodimentScore | null {
  if (score.isMiddle) return null;

  const { role: palaceRoleName, description: roleDescription } =
    determinePalaceRole(palaceId, chart);

  if (!palaceRoleName) return null;

  // 1. 计算 5 声部的 Base 与 Modifier
  const voicesData = score.voices.map((v, i) => {
    const base = BASE_OF_ROLE[v.r] || v.base;
    const modifier = v.eff;
    const isId = isIdentity(base, modifier);
    const isOp = isOpposite(base, modifier);
    const cell = getCellData(base, modifier);
    const dev = EMBODY_DEV5[i] || 0.0;
    const somatic = deriveSomaticParameters(v.r, base, modifier, score.he.type);
    return {
      voice: v.r,
      element: v.e,
      base,
      modifier,
      isIdentity: isId,
      isOpposite: isOp,
      weightLabel: `${cell.baseDef.w} → ${cell.modDef.w}`,
      spaceLabel: `${cell.baseDef.s} → ${cell.modDef.s}`,
      timeLabel: `${cell.baseDef.t} → ${cell.modDef.t}`,
      textureShort: cell.title,
      textureDesc: cell.somaticMotion,
      devValue: dev,
      somatic,
    };
  });

  // 2. 检查极反与悬持 (值使宫密接和应特权)
  const oppVoicesList = voicesData.slice(0, 4).filter((s) => s.isOpposite);
  const oppCount = oppVoicesList.length;

  let holdFrac = 0;
  let entryFrac = 1;
  if (palaceRoleName === '值使宫' && oppCount > 0) {
    holdFrac = oppCount / 4;
    entryFrac = 1 - holdFrac;
  }

  // 3. 计算前四声部入场时间
  const weights = EMBODY_W4.map((w) => w * entryFrac);
  let accumulatedTime = 0;

  const cards: ActionCardData[] = [];

  for (let i = 0; i < 4; i++) {
    const v = voicesData[i];
    const durWeight = weights[i];
    const durationSec = durWeight * totalDuration;
    const startTime = accumulatedTime;
    const endTime = startTime + durationSec;
    accumulatedTime = endTime;

    cards.push({
      voice: v.voice,
      element: v.element,
      base: v.base,
      modifier: v.modifier,
      isIdentity: v.isIdentity,
      isOpposite: v.isOpposite,
      weightLabel: v.weightLabel,
      spaceLabel: v.spaceLabel,
      timeLabel: v.timeLabel,
      textureShort: v.textureShort,
      textureDesc: v.textureDesc,
      durationPercent: durWeight * 100,
      durationSec,
      startTime,
      endTime,
      devValue: v.devValue,
      entryMode: 'Sequential (依序立住)',
      somatic: v.somatic,
    });
  }

  // 4. 天下声部 (作为 Coda / 对偶发生，与天上处于同段时间)
  const tianShangCard = cards[3]; // 天上
  const tianXiaVoice = voicesData[4]; // 天下
  cards.push({
    voice: tianXiaVoice.voice,
    element: tianXiaVoice.element,
    base: tianXiaVoice.base,
    modifier: tianXiaVoice.modifier,
    isIdentity: tianXiaVoice.isIdentity,
    isOpposite: tianXiaVoice.isOpposite,
    weightLabel: tianXiaVoice.weightLabel,
    spaceLabel: tianXiaVoice.spaceLabel,
    timeLabel: tianXiaVoice.timeLabel,
    textureShort: tianXiaVoice.textureShort,
    textureDesc: tianXiaVoice.textureDesc,
    durationPercent: tianShangCard.durationPercent,
    durationSec: tianShangCard.durationSec,
    startTime: tianShangCard.startTime,
    endTime: tianShangCard.endTime,
    devValue: tianXiaVoice.devValue,
    entryMode: 'Simultaneous Coda (共生/克战)',
    somatic: tianXiaVoice.somatic,
    codaRelation: {
      type: score.he.type,
      details: `${score.he.str} —— ${CODA_MAP[score.he.type]}`,
    },
  });

  // 5. 悬持段计算 (Suspension Data)
  let suspension: SuspensionData | null = null;
  if (holdFrac > 0) {
    const holdSec = holdFrac * totalDuration;
    const startTime = accumulatedTime;
    const endTime = startTime + holdSec;

    suspension = {
      needed: true,
      fraction: holdFrac,
      durationSec: holdSec,
      startTime,
      endTime,
      oppVoices: oppVoicesList.map((v) => v.voice),
      somaticCue: `【五声部全在场悬持】在此区间不加入任何新动作。身体全部通道被激活，专注内持 ${oppVoicesList
        .map((v) => v.voice)
        .join('、')} 处的极反内绞，对抗拉力达到峰值，以极高阻尼（Bound Flow）守持至宫位终结。`,
    };
  }

  // 6. 确定性因果回溯 (Why This Result Derivation Steps)
  const derivation: DerivationStep[] = [
    {
      level: '1. 时间与局数定标',
      from: `输入时间: ${chart.day} ${chart.hour} · ${chart.jieqi}`,
      to: `${chart.dun}遁 ${chart.num}局 · 符头${chart.futou} (落${chart.futou_palace}宫)`,
      principle:
        '依据 2026 节气表与干支儒略日数计算上中下三元，确定奇门局数与地盘九星转盘基准点。',
    },
    {
      level: '2. 宫位功能指派',
      from: `选定宫位: ${palaceId}宫 (${DIR_NAME[palaceId]})`,
      to: `${palaceRoleName} · ${roleDescription}`,
      principle:
        palaceId === chart.zhifu_palace
          ? '命中值符所在宫，担任动作序列【呈示部】，五声部完整严整展开。'
          : palaceId === chart.zhishi_palace
          ? '命中值使所在宫，担任动作序列【密接和应】，集中张力与极反收束。'
          : '依本宫所落八门或常行位置确立动作织体属性。',
    },
    {
      level: '3. 声部力效映射',
      from: `五声部符号: 神=${score.voices.find((v) => v.r === '神')?.e} / 星=${score.voices.find((v) => v.r === '星')?.e} / 门=${score.voices.find((v) => v.r === '门')?.e} / 天上=${score.voices.find((v) => v.r === '天上')?.e} / 天下=${score.voices.find((v) => v.r === '天下')?.e}`,
      to: `Base × Modifier: 神(${cards[0].base}×${cards[0].modifier})、星(${cards[1].base}×${cards[1].modifier})、门(${cards[2].base}×${cards[2].modifier})、天(${cards[3].base}×${cards[3].modifier})、地(${cards[4].base}×${cards[4].modifier})`,
      principle:
        '五声部各守固定 Base Effort (神浮/星滑/门拂/天拍/地冲)，由当前落宫符号经 ELEM2EFF 映射出 Modifier，在 64 格方阵取质感。',
    },
    {
      level: '4. 时间权重结构',
      from: `总时长: ${totalDuration.toFixed(1)}s · 三分损益四段权重 EMBODY_W4`,
      to: `四声部依次占比: ${(cards[0].durationPercent).toFixed(1)}%, ${(cards[1].durationPercent).toFixed(1)}%, ${(cards[2].durationPercent).toFixed(1)}%, ${(cards[3].durationPercent).toFixed(1)}%`,
      principle:
        palaceRoleName === '值使宫' && oppCount > 0
          ? `因值使宫出现 ${oppCount} 处极反，入场段按 1-(${oppCount}/4) 压缩至 ${(entryFrac * 100).toFixed(0)}%，剩余 ${(holdFrac * 100).toFixed(0)}% 独立开启悬持段。`
          : '按三分损益律依次递减/调和递进，神、星、门、天上顺序立住。',
    },
    {
      level: '5. Coda 天地克应',
      from: `天盘干[${cards[3].element}] 遇 地盘干[${cards[4].element}]`,
      to: `${score.he.type} (${score.he.str})`,
      principle: `${CODA_MAP[score.he.type]}。天下声部不单独开辟新时间槽，而是作为天上的对偶声部同时呼应与碰撞。`,
    },
  ];

  // 7. 生成专业排练纯文本导出单 (Plain Text Export)
  const plainLines: string[] = [
    '========================================',
    'QIMEN EFFORT EMBODIMENT SCORE · 排练任务单',
    '========================================',
    `PALACE: ${palaceId} (${DIR_NAME[palaceId]})`,
    `ROLE: ${palaceRoleName}`,
    `TOTAL DURATION: ${totalDuration.toFixed(1)}s (${formatSecondsToTime(totalDuration)})`,
    `VOLUME (星气): ${score.volume || '—'}  |  TEMPO (门气): ${score.duration || '—'}`,
    `CODA RELATION: ${score.he.type} (${score.he.str})`,
    '----------------------------------------',
    '【ACTIONS SEQUENCE】',
  ];

  cards.slice(0, 4).forEach((c, idx) => {
    plainLines.push(
      `VOICE ${idx + 1} — ${c.voice} [${c.element}]`,
      `  BASE: ${c.base}  |  MODIFIER: ${c.modifier} ${c.isIdentity ? '(本体)' : c.isOpposite ? '(极反)' : '(调制)'}`,
      `  TIME: ${formatSecondsToTime(c.startTime)} – ${formatSecondsToTime(c.endTime)} (${c.durationSec.toFixed(1)}s, ${c.durationPercent.toFixed(1)}%)`,
      `  PARAMETERS: Weight=${c.somatic.weight} | Time=${c.somatic.time} | Space=${c.somatic.space} | Flow=${c.somatic.flow}`,
      `  TEXTURE: ${c.textureShort} —— ${c.textureDesc}`,
      `  BODY CUE: ${c.somatic.cueSummary}`,
      ''
    );
  });

  const lastCard = cards[4];
  plainLines.push(
    `VOICE 5 — ${lastCard.voice} [${lastCard.element}] (CODA RELATION)`,
    `  BASE: ${lastCard.base}  |  MODIFIER: ${lastCard.modifier} ${lastCard.isIdentity ? '(本体)' : lastCard.isOpposite ? '(极反)' : '(调制)'}`,
    `  TIMING: 与【天上】同步发生 (${formatSecondsToTime(lastCard.startTime)} – ${formatSecondsToTime(lastCard.endTime)})`,
    `  RELATION ROLE: ${score.he.type} —— ${CODA_MAP[score.he.type]}`,
    `  TEXTURE: ${lastCard.textureShort} —— ${lastCard.textureDesc}`,
    `  BODY CUE: ${lastCard.somatic.cueSummary}`,
    ''
  );

  if (suspension) {
    plainLines.push(
      '【SUSPENSION / HOLD SECTION】',
      `  DURATION: ${suspension.durationSec.toFixed(1)}s (${formatSecondsToTime(suspension.startTime)} – ${formatSecondsToTime(suspension.endTime)})`,
      `  FOCUS VOICES: ${suspension.oppVoices.join('、')}`,
      `  EXECUTION: ${suspension.somaticCue}`,
      ''
    );
  }

  plainLines.push(
    '----------------------------------------',
    'DETERMINISTIC CAUSAL CHAIN:',
    ...derivation.map((d) => `• ${d.level}: ${d.from} → ${d.to}`),
    '========================================'
  );

  const formattedPlainText = plainLines.join('\n');

  return {
    palaceId,
    palaceRole: palaceRoleName,
    roleDescription,
    totalDuration,
    entryFraction: entryFrac,
    cards,
    suspension,
    coda: {
      type: score.he.type,
      str: score.he.str,
      reading: CODA_MAP[score.he.type],
    },
    derivation,
    formattedPlainText,
  };
}
