/**
 * QINJU Web Audio 声音几何合成器
 * 移植自候选UI原型，接口已改为消费真实推导参数(DerivedSoundParams)，不含任何随机逻辑
 */

import { DerivedSoundParams } from './soundLight';

class SoundGeometrySynth {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private activeNodes: { stop: () => void }[] = [];

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public stop(): void {
    this.activeNodes.forEach((n) => {
      try {
        n.stop();
      } catch (e) {
        /* ignore */
      }
    });
    this.activeNodes = [];
    this.isPlaying = false;
  }

  public playStateSound(sound: DerivedSoundParams, onEnd?: () => void): void {
    this.stop();
    const ctx = this.getAudioContext();
    this.isPlaying = true;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;
    const baseHz = Math.max(45, Math.min(880, sound.fundamentalHz));

    const finish = (ms: number) => {
      setTimeout(() => {
        if (this.isPlaying) {
          this.isPlaying = false;
          onEnd?.();
        }
      }, ms);
    };

    if (sound.geometry === 'Point') {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseHz, now);

      const overtone = ctx.createOscillator();
      const overGain = ctx.createGain();
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(baseHz * 2.76, now);

      osc.connect(oscGain);
      overtone.connect(overGain);
      oscGain.connect(masterGain);
      overGain.connect(masterGain);

      masterGain.gain.setValueAtTime(0.3, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.start(now);
      overtone.start(now);
      osc.stop(now + 1.3);
      overtone.stop(now + 1.3);

      this.activeNodes.push({
        stop: () => {
          try {
            osc.stop();
            overtone.stop();
          } catch (e) {}
        },
      });
      finish(1300);
    } else if (sound.geometry === 'Line') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseHz * 0.8, now);
      osc.frequency.exponentialRampToValueAtTime(baseHz * 1.5, now + 3.0);
      osc.frequency.exponentialRampToValueAtTime(baseHz, now + 5.0);

      osc.connect(masterGain);
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(0.22, now + 0.8);
      masterGain.gain.setValueAtTime(0.22, now + 4.0);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.2);

      osc.start(now);
      osc.stop(now + 5.3);
      this.activeNodes.push({ stop: () => { try { osc.stop(); } catch (e) {} } });
      finish(5300);
    } else if (sound.geometry === 'Plane') {
      const ratios = [1.0, 1.25, 1.5];
      const oscs: OscillatorNode[] = [];
      ratios.forEach((r, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(baseHz * r + idx * 0.4, now);
        const subGain = ctx.createGain();
        subGain.gain.value = 0.12 / ratios.length;
        osc.connect(subGain);
        subGain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 6.0);
        oscs.push(osc);
      });
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(0.25, now + 1.2);
      masterGain.gain.setValueAtTime(0.25, now + 4.8);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 6.0);
      this.activeNodes.push({ stop: () => oscs.forEach((o) => { try { o.stop(); } catch (e) {} }) });
      finish(6100);
    } else {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseHz * 0.5, now);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, now);
      filter.frequency.linearRampToValueAtTime(450, now + 3.0);
      filter.frequency.linearRampToValueAtTime(180, now + 6.5);

      osc.connect(filter);
      filter.connect(masterGain);

      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(0.28, now + 1.5);
      masterGain.gain.setValueAtTime(0.28, now + 5.0);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 7.0);

      osc.start(now);
      osc.stop(now + 7.1);
      this.activeNodes.push({ stop: () => { try { osc.stop(); } catch (e) {} } });
      finish(7200);
    }
  }
}

export const synthInstance = new SoundGeometrySynth();
