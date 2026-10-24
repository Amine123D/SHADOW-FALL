export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function rectOf(go: {
  x: number;
  y: number;
  width: number;
  height: number;
}): Rect {
  return {
    x: go.x - go.width / 2,
    y: go.y - go.height / 2,
    width: go.width,
    height: go.height,
  };
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function rollCritical(
  chance: number,
  rng: () => number = Math.random
): boolean {
  return rng() < chance;
}

export interface DamageInput {
  baseDamage: number;
  defense: number;
  isCritical: boolean;
  critMultiplier: number;
}

export function calculateDamage(input: DamageInput): number {
  const raw =
    input.baseDamage * (input.isCritical ? input.critMultiplier : 1);
  return Math.max(1, Math.round(raw - input.defense));
}