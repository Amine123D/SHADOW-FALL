import { BALANCE } from '../data/balance';
import { ITEMS, ItemDef, RARITIES, Rarity } from '../data/items';

export function rollRarity(rng: () => number = Math.random): Rarity {
  const weights = BALANCE.loot.weights;
  const total = RARITIES.reduce((sum, r) => sum + weights[r], 0);
  let roll = rng() * total;
  for (const r of RARITIES) {
    roll -= weights[r];
    if (roll < 0) return r;
  }
  return 'common';
}

export function rollDrop(rng: () => number = Math.random): ItemDef | null {
  if (rng() >= BALANCE.loot.dropChance) return null;
  const rarity = rollRarity(rng);
  const pool = ITEMS.filter((item) => item.rarity === rarity);
  const list = pool.length > 0 ? pool : ITEMS;
  return list[Math.floor(rng() * list.length)];
}