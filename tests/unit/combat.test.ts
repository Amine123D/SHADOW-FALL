import { describe, it, expect } from 'vitest';
import { calculateDamage, rectsOverlap } from '../../src/systems/CombatSystem';
import { addXp, xpToNext } from '../../src/systems/ProgressionSystem';

describe('calculateDamage', () => {
  it('subtracts defense from base damage', () => {
    expect(
      calculateDamage({ baseDamage: 12, defense: 2, isCritical: false, critMultiplier: 1.5 })
    ).toBe(10);
  });

  it('applies the critical multiplier before defense', () => {
    expect(
      calculateDamage({ baseDamage: 12, defense: 2, isCritical: true, critMultiplier: 1.5 })
    ).toBe(16);
  });

  it('never goes below 1', () => {
    expect(
      calculateDamage({ baseDamage: 1, defense: 50, isCritical: false, critMultiplier: 1.5 })
    ).toBe(1);
  });
});

describe('rectsOverlap', () => {
  it('detects overlap', () => {
    expect(
      rectsOverlap({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 5, width: 10, height: 10 })
    ).toBe(true);
  });

  it('does not count touching edges', () => {
    expect(
      rectsOverlap({ x: 0, y: 0, width: 10, height: 10 }, { x: 10, y: 0, width: 10, height: 10 })
    ).toBe(false);
  });
});

describe('progression', () => {
  it('computes xp needed per level', () => {
    expect(xpToNext(1)).toBe(30);
    expect(xpToNext(2)).toBe(85);
  });

  it('levels up and carries leftover xp', () => {
    const p = { level: 1, xp: 0 };
    expect(addXp(p, 30)).toBe(1);
    expect(p).toEqual({ level: 2, xp: 0 });
  });

  it('can gain several levels at once', () => {
    const p = { level: 1, xp: 0 };
    expect(addXp(p, 200)).toBe(2);
    expect(p).toEqual({ level: 3, xp: 85 });
  });

  it('stops at the max level', () => {
    const p = { level: 19, xp: 0 };
    addXp(p, 100000);
    expect(p).toEqual({ level: 20, xp: 0 });
  });
});