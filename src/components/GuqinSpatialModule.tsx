import React, { useState } from 'react';
import { Compass } from 'lucide-react';

const STRINGS_LABELS = ['一弦·宫', '二弦·商', '三弦·角', '四弦·徵', '五弦·羽', '六弦·少宫', '七弦·少商'];

// 十三徽比例，与三分损益同源(见对话记录中"十三徽=三分损益节点"的推导)，非虚构数值
const HUI_RATIOS = [0.125, 0.167, 0.2, 0.25, 0.333, 0.4, 0.5, 0.6, 0.667, 0.75, 0.8, 0.833, 0.875];

export const GuqinSpatialModule: React.FC = () => {
  const [hoverNode, setHoverNode] = useState<{ s: number; h: number } | null>(null);

  return (
    <section className="border border-[var(--ink)] bg-[var(--bg)] p-4 md:p-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <span className="bg-[var(--ink)] text-[var(--bg)] mono text-[10px] font-bold px-1.5 py-0.5">[ 08 ]</span>
          <span className="text-[var(--mut)] mono text-xs ml-2 uppercase">Guqin Spatial Grid · 古琴空间坐标参照网格</span>
        </div>
        <span className="text-[10px] text-[var(--mut)] flex items-center gap-1">
          <Compass size={11} /> 7弦 × 13徽 = 91 节点
        </span>
      </div>

      <div className="border border-[var(--line-strong)] p-3 overflow-x-auto">
        <table className="w-full text-center border-collapse text-[10px] mono">
          <thead>
            <tr>
              <th className="p-1 text-left text-[var(--mut)] font-normal">弦 ＼ 徽</th>
              {HUI_RATIOS.map((r, hIdx) => (
                <th key={hIdx} className={`p-1 ${hIdx === 6 ? 'text-[var(--ink)] font-bold underline' : 'text-[var(--mut)]'}`}>
                  {hIdx + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STRINGS_LABELS.map((label, sIdx) => (
              <tr key={label} className="border-t border-[var(--line)]">
                <td className="p-1 text-left whitespace-nowrap text-[var(--ink)] font-semibold">{label}</td>
                {HUI_RATIOS.map((r, hIdx) => {
                  const isHover = hoverNode?.s === sIdx && hoverNode?.h === hIdx;
                  return (
                    <td
                      key={hIdx}
                      onMouseEnter={() => setHoverNode({ s: sIdx, h: hIdx })}
                      onMouseLeave={() => setHoverNode(null)}
                      className={`p-1 border border-[var(--line)] cursor-default ${
                        isHover ? 'bg-[var(--ink)] text-[var(--bg)] font-bold' : hIdx === 6 ? 'bg-[var(--sunk)] text-[var(--mut)]' : 'text-[var(--dim)]'
                      }`}
                    >
                      {isHover ? `${(r * 100).toFixed(1)}%` : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-[var(--mut)] leading-relaxed">
        这张网格是长墙/短墙投影的空间坐标参照，徽位比例与三分损益同源(见研究备忘)。
        <b className="text-[var(--ink)]">当前版本尚未把某一时刻的具体断局数据映射到某个具体弦/徽节点</b>——这个映射公式还没有定，需要先设计好再接（悬停格子只是展示坐标本身，不代表"当前生成的节点"）。
      </p>
    </section>
  );
};
