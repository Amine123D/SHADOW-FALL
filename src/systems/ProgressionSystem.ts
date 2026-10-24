import { BALANCE } from '../data/balance';

export interface Progress {
  level: number;
  xp: number;
}

export function xpToNext(level: number): number {
  const P = BALANCE.progression;
  return Math.round(P.xpBase * Math.pow(level, P.xpExponent));
}

// Adds XP and returns how many levels were gained.
export function addXp(progress: Progress, amount: number): number {
  const P = BALANCE.progression;
  let gained = 0;
  progress.xp += amount;
  while (
    progress.level < P.maxLevel &&
    progress.xp >= xpToNext(progress.level)
  ) {
    progress.xp -= xpToNext(progress.level);
    progress.level += 1;
    gained += 1;
  }
  if (progress.level >= P.maxLevel) progress.xp = 0;
  return gained;
}