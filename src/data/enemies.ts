export type EnemyRole = 'melee' | 'ranged';

export interface EnemyDef {
  name: string;
  role: EnemyRole;
  color: number;
  width: number;
  height: number;
  maxHealth: number;
  defense: number;
  speed: number;
  detectRange: number;
  attackRange: number;
  damage: number;
  windupMs: number;
  attackMs: number;
  recoveryMs: number;
  attackWidth: number;
  knockbackResist: number;
  armored: boolean;
}

export const ENEMIES: Record<'crawler' | 'spitter' | 'brute', EnemyDef> = {
  crawler: {
    name: 'Ash Crawler',
    role: 'melee',
    color: 0xd04a4a,
    width: 14,
    height: 16,
    maxHealth: 30,
    defense: 0,
    speed: 70,
    detectRange: 160,
    attackRange: 22,
    damage: 8,
    windupMs: 350,
    attackMs: 150,
    recoveryMs: 600,
    attackWidth: 20,
    knockbackResist: 0,
    armored: false,
  },
  spitter: {
    name: 'Cinder Spitter',
    role: 'ranged',
    color: 0x4ab0d0,
    width: 14,
    height: 22,
    maxHealth: 24,
    defense: 0,
    speed: 45,
    detectRange: 260,
    attackRange: 170,
    damage: 10,
    windupMs: 600,
    attackMs: 100,
    recoveryMs: 900,
    attackWidth: 0,
    knockbackResist: 0,
    armored: false,
  },
  brute: {
    name: 'Hollow Brute',
    role: 'melee',
    color: 0x8a4ad0,
    width: 26,
    height: 34,
    maxHealth: 90,
    defense: 3,
    speed: 35,
    detectRange: 180,
    attackRange: 34,
    damage: 22,
    windupMs: 800,
    attackMs: 200,
    recoveryMs: 900,
    attackWidth: 34,
    knockbackResist: 0.7,
    armored: true,
  },
};
