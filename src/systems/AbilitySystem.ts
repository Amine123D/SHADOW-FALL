import type { AbilityId } from '../data/abilities';

export class AbilityCooldowns {
  private readyAt: Partial<Record<AbilityId, number>> = {};

  isReady(id: AbilityId, now: number): boolean {
    return now >= (this.readyAt[id] ?? 0);
  }

  start(id: AbilityId, now: number, cooldownMs: number): void {
    this.readyAt[id] = now + cooldownMs;
  }

  remainingMs(id: AbilityId, now: number): number {
    return Math.max(0, (this.readyAt[id] ?? 0) - now);
  }

  reset(): void {
    this.readyAt = {};
  }
}