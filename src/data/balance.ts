import type { Rarity } from './items';

export const BALANCE = {
  player: {
    maxHealth: 100,
    moveSpeed: 120,
    jumpVelocity: -260,
    baseAttack: 12,
  },
  progression: {
    maxLevel: 20,
    xpBase: 30,
    xpExponent: 1.5,
    hpPerLevel: 8,
    attackPerLevel: 1,
  },
  xpReward: {
    'Ash Crawler': 12,
    'Cinder Spitter': 14,
    'Hollow Brute': 40,
  } as Record<string, number>,
  loot: {
    dropChance: 0.5,
    weights: { common: 60, uncommon: 28, rare: 10, epic: 2 } as Record<Rarity, number>,
  },
  inventory: {
    bagSize: 12,
  },
  hurt: {
    stunMs: 200,
    invulnMs: 700,
    knockback: 180,
  },
  attack: {
    durationMs: 250,
    hitStartMs: 80,
    hitEndMs: 180,
    cooldownMs: 120,
    width: 28,
    height: 20,
    knockback: 160,
    critChance: 0.1,
    critMultiplier: 1.5,
  },
  dodge: {
    durationMs: 200,
    speed: 280,
    cooldownMs: 700,
  },
  projectile: {
    speed: 150,
    lifeMs: 2500,
  },
  enemyStaggerMs: 250,
  respawnDelayMs: 2000,
};