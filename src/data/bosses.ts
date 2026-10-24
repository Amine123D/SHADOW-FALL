export type BossAttackId = 'slam' | 'shockwave';

export interface BossPhaseDef {
  startsAtOrBelow: number;
  pattern: BossAttackId[];
  speedScale: number;
}

export interface BossDef {
  name: string;
  color: number;
  width: number;
  height: number;
  maxHealth: number;
  defense: number;
  moveSpeed: number;
  xpReward: number;
  transitionMs: number;
  slam: {
    range: number;
    width: number;
    damage: number;
    windupMs: number;
    attackMs: number;
    recoveryMs: number;
  };
  shockwave: {
    damage: number;
    speed: number;
    windupMs: number;
    recoveryMs: number;
  };
  phases: BossPhaseDef[];
}

export const ASHEN_COLOSSUS: BossDef = {
  name: 'Ashen Colossus',
  color: 0x7a3b2e,
  width: 40,
  height: 56,
  maxHealth: 220,
  defense: 3,
  moveSpeed: 28,
  xpReward: 120,
  transitionMs: 1200,
  slam: {
    range: 46,
    width: 52,
    damage: 28,
    windupMs: 900,
    attackMs: 200,
    recoveryMs: 1000,
  },
  shockwave: {
    damage: 16,
    speed: 120,
    windupMs: 800,
    recoveryMs: 1200,
  },
  phases: [
    { startsAtOrBelow: 1, pattern: ['slam'], speedScale: 1 },
    { startsAtOrBelow: 0.66, pattern: ['slam', 'shockwave'], speedScale: 1.15 },
    { startsAtOrBelow: 0.33, pattern: ['shockwave', 'slam', 'shockwave'], speedScale: 1.3 },
  ],
};