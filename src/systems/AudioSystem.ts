export type SfxName =
  | 'hit'
  | 'crit'
  | 'swing'
  | 'jump'
  | 'dodge'
  | 'hurt'
  | 'pickup'
  | 'levelup'
  | 'boss'
  | 'rush'
  | 'quake'
  | 'stance'
  | 'checkpoint'
  | 'win';

export interface AudioSettings {
  music: number;
  sfx: number;
}

const SETTINGS_KEY = 'shadowfall-settings';
const MUSIC_NOTES = [110, 130.8, 146.8, 164.8, 146.8, 130.8, 98, 123.5];

function loadSettings(): AudioSettings {
  const fallback: AudioSettings = { music: 0.5, sfx: 0.7 };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw) as Partial<AudioSettings>;
    const ok = (v: unknown): v is number =>
      typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1;
    return {
      music: ok(data.music) ? data.music : fallback.music,
      sfx: ok(data.sfx) ? data.sfx : fallback.sfx,
    };
  } catch {
    return fallback;
  }
}

class AudioSystem {
  settings: AudioSettings = loadSettings();
  private ctx: AudioContext | null = null;
  private musicTimer: number | null = null;
  private step = 0;

  private ensureCtx(): AudioContext | null {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return this.ctx;
    }
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    try {
      this.ctx = new Ctor();
    } catch {
      return null;
    }
    return this.ctx;
  }

  private tone(
    freq: number,
    durSec: number,
    type: OscillatorType,
    vol: number,
    when = 0,
    slideTo?: number
  ): void {
    if (vol < 0.001) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + durSec);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durSec);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + durSec + 0.02);
  }

  play(name: SfxName): void {
    const v = this.settings.sfx;
    if (v <= 0) return;
    const t = (
      f: number,
      d: number,
      type: OscillatorType,
      vol: number,
      when = 0,
      slide?: number
    ) => this.tone(f, d, type, vol * v * 0.3, when, slide);

    switch (name) {
      case 'hit': t(220, 0.08, 'square', 0.5, 0, 110); break;
      case 'crit': t(440, 0.12, 'square', 0.6, 0, 220); break;
      case 'swing': t(300, 0.07, 'sawtooth', 0.25, 0, 150); break;
      case 'jump': t(260, 0.1, 'square', 0.25, 0, 420); break;
      case 'dodge': t(200, 0.12, 'triangle', 0.4, 0, 90); break;
      case 'hurt': t(120, 0.2, 'sawtooth', 0.6, 0, 60); break;
      case 'pickup':
        t(660, 0.08, 'triangle', 0.5);
        t(880, 0.1, 'triangle', 0.5, 0.08);
        break;
      case 'levelup':
        [523, 659, 784, 1047].forEach((f, i) => t(f, 0.15, 'triangle', 0.5, i * 0.1));
        break;
      case 'boss': t(70, 0.8, 'sawtooth', 0.7, 0, 40); break;
      case 'rush': t(180, 0.18, 'sawtooth', 0.4, 0, 360); break;
      case 'quake': t(90, 0.35, 'square', 0.6, 0, 45); break;
      case 'stance': t(330, 0.2, 'triangle', 0.45, 0, 220); break;
      case 'checkpoint':
        t(523, 0.12, 'triangle', 0.5);
        t(784, 0.2, 'triangle', 0.5, 0.12);
        break;
      case 'win':
        [392, 523, 659, 784, 1047].forEach((f, i) => t(f, 0.2, 'triangle', 0.5, i * 0.12));
        break;
    }
  }

  startMusic(): void {
    if (this.musicTimer !== null) return;
    this.ensureCtx();
    this.musicTimer = window.setInterval(() => {
      if (this.settings.music <= 0) return;
      const note = MUSIC_NOTES[this.step % MUSIC_NOTES.length];
      this.step += 1;
      this.tone(note, 0.9, 'triangle', 0.18 * this.settings.music);
      if (this.step % 4 === 0) {
        this.tone(note * 2, 0.5, 'sine', 0.08 * this.settings.music);
      }
    }, 450);
  }

  stopMusic(): void {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  setMusicVolume(v: number): void {
    this.settings.music = Math.min(1, Math.max(0, Math.round(v * 10) / 10));
    this.saveSettings();
  }

  setSfxVolume(v: number): void {
    this.settings.sfx = Math.min(1, Math.max(0, Math.round(v * 10) / 10));
    this.saveSettings();
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      // Storage can be blocked; the game still works without it.
    }
  }
}

export const audio = new AudioSystem();