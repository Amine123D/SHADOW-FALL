import type { BossAttackId, BossPhaseDef } from '../data/bosses';

export function phaseIndexFor(
  healthPct: number,
  phases: BossPhaseDef[]
): number {
  let index = 0;
  for (let i = 0; i < phases.length; i++) {
    if (healthPct <= phases[i].startsAtOrBelow) index = i;
  }
  return index;
}

export function nextAttack(
  phase: BossPhaseDef,
  counter: number
): BossAttackId {
  return phase.pattern[counter % phase.pattern.length];
}