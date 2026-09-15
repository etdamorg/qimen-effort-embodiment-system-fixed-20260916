import React, { useState } from 'react';
import { DerivationStep, EmbodimentScore } from '../types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface WhyThisResultPanelProps {
  score: EmbodimentScore | null;
}

export const WhyThisResultPanel: React.FC<WhyThisResultPanelProps> = ({ score }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  if (!score) return null;

  return (
    <section className="border border-[var(--ink)] bg-[var(--bg)] p-4 md:p-5 space-y-4">
      <div
        className="flex items-center justify-between cursor-pointer border-b border-[var(--ink)] pb-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <span className="bg-[var(--ink)] text-[var(--bg)] mono text-[10px] font-bold px-1.5 py-0.5">[ 06 ]</span>
          <h2 className="text-xs tracking-[0.1em] uppercase mono text-[var(--ink)] font-bold">
            CAUSAL DERIVATION LEDGER · 确定性因果链溯源 (去黑箱)
          </h2>
        </div>
        <div className="flex items-center space-x-3 text-[10px] text-[var(--mut)] mono">
          <span>{score.derivation.length} DERIVATION NODES</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 text-[var(--mut)]" />}
        </div>
      </div>

      {isOpen && (
        <div className="space-y-3 pt-1 mono text-xs">
          <p className="text-[10px] text-[var(--mut)] leading-relaxed">
            DETERMINISTIC CAUSALITY: 从时间输入、奇门符号落宫，到力效映射、三分损益时序及天地克应，各声部均具备完全可还原的符号与动力学推导依据：
          </p>

          <div className="space-y-2.5">
            {score.derivation.map((d: DerivationStep, idx: number) => (
              <div
                key={idx}
                className="border border-[var(--line-strong)] bg-[var(--surf)] p-3 space-y-2 hover:border-[var(--dim)] transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] border-b border-[var(--line-strong)] pb-1.5">
                  <span className="text-[var(--ink)] font-bold uppercase tracking-wider">
                    [{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}] {d.level}
                  </span>
                  <span className="text-[var(--mut)] text-[9px] font-semibold">STEP 0{idx + 1}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
                  <div className="border border-[var(--line-strong)] bg-[var(--bg)] p-2">
                    <span className="text-[var(--mut)] text-[8.5px] uppercase block mb-0.5 font-medium">
                      INPUT STATE // 来源状态
                    </span>
                    <strong className="text-[var(--mut)] font-medium block">{d.from}</strong>
                  </div>

                  <div className="border border-[var(--line-strong)] bg-[var(--bg)] p-2">
                    <span className="text-[var(--mut)] text-[8.5px] uppercase block mb-0.5 font-medium">
                      OUTPUT TARGET // 确定性生成
                    </span>
                    <strong className="text-[var(--ink)] font-bold block">{d.to}</strong>
                  </div>
                </div>

                <div className="text-[9.5px] text-[var(--mut)] pt-1 leading-relaxed">
                  <span className="text-[var(--mut)] uppercase mr-1 font-semibold">MECHANISM // 发生学机理:</span>
                  <span>{d.principle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
