import { describe, it, expect } from 'vitest';
import { AbilityCooldowns } from '../../src/systems/AbilitySystem';
import { nextAttack, phaseIndexFor } from '../../src/systems/BossSystem';
import { ASHEN_COLOSSUS } from '../../src/data/bosses';

describe('AbilityCooldowns', () => {
  it('is ready until started, then blocks until the time passes', () => {
    const cd = new AbilityCooldowns();
    expect(cd.isReady('rush', 0)).toBe(true);
    cd.start('rush', 1000, 3000);
    expect(cd.isReady('rush', 2000)).toBe(false);
    expect(cd.remainingMs('rush', 2000)).toBe(2000);
    expect(cd.isReady('rush', 4000)).toBe(true);
  });

  it('tracks abilities separately', () => {
    const cd = new AbilityCooldowns();
    cd.start('rush', 0, 5000);
    expect(cd.isReady('quake', 100)).toBe(true);
  });
});

describe('boss phases', () => {
  const phases = ASHEN_COLOSSUS.phases;

  it('picks the phase from remaining health', () => {
    expect(phaseIndexFor(1, phases)).toBe(0);
    expect(phaseIndexFor(0.7, phases)).toBe(0);
    expect(phaseIndexFor(0.66, phases)).toBe(1);
    expect(phaseIndexFor(0.5, phases)).toBe(1);
    expect(phaseIndexFor(0.33, phases)).toBe(2);
    expect(phaseIndexFor(0.05, phases)).toBe(2);
  });

  it('cycles through the attack pattern', () => {
    const phase = phases[2];
    expect(nextAttack(phase, 0)).toBe('shockwave');
    expect(nextAttack(phase, 1)).toBe('slam');
    expect(nextAttack(phase, 2)).toBe('shockwave');
    expect(nextAttack(phase, 3)).toBe('shockwave');
  });
});