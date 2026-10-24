export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic';
export type Slot = 'weapon' | 'armor' | 'trinket';

export const SLOTS: Slot[] = ['weapon', 'armor', 'trinket'];
export const RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'epic'];

export interface ItemStats {
  attack: number;
  defense: number;
  maxHealth: number;
}

export interface ItemDef {
  id: string;
  name: string;
  slot: Slot;
  rarity: Rarity;
  stats: ItemStats;
}

export const RARITY_COLOR: Record<Rarity, number> = {
  common: 0xb0b0b0,
  uncommon: 0x5fd35f,
  rare: 0x4a9aff,
  epic: 0xc060ff,
};

export function colorCss(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}

const s = (attack = 0, defense = 0, maxHealth = 0): ItemStats => ({
  attack,
  defense,
  maxHealth,
});

export const ITEMS: ItemDef[] = [
  { id: 'rusted_blade', name: 'Rusted Blade', slot: 'weapon', rarity: 'common', stats: s(2) },
  { id: 'ashen_sword', name: 'Ashen Sword', slot: 'weapon', rarity: 'uncommon', stats: s(4) },
  { id: 'ember_edge', name: 'Ember Edge', slot: 'weapon', rarity: 'rare', stats: s(6, 0, 10) },
  { id: 'glass_fang', name: 'Glass Fang', slot: 'weapon', rarity: 'rare', stats: s(9, 0, -15) },
  { id: 'unmaking_shard', name: 'Unmaking Shard', slot: 'weapon', rarity: 'epic', stats: s(10, 2) },
  { id: 'patchwork_vest', name: 'Patchwork Vest', slot: 'armor', rarity: 'common', stats: s(0, 1, 10) },
  { id: 'iron_plate', name: 'Iron Plate', slot: 'armor', rarity: 'uncommon', stats: s(0, 3) },
  { id: 'warden_mail', name: 'Warden Mail', slot: 'armor', rarity: 'rare', stats: s(0, 5, 20) },
  { id: 'stone_ring', name: 'Stone Ring', slot: 'trinket', rarity: 'common', stats: s(0, 1) },
  { id: 'ember_charm', name: 'Ember Charm', slot: 'trinket', rarity: 'uncommon', stats: s(1, 0, 10) },
];

export const ITEM_BY_ID: Record<string, ItemDef> = Object.fromEntries(
  ITEMS.map((item) => [item.id, item])
);

export function describeStats(st: ItemStats): string {
  const parts: string[] = [];
  const sign = (n: number) => (n > 0 ? '+' : '');
  if (st.attack) parts.push(`${sign(st.attack)}${st.attack} ATK`);
  if (st.defense) parts.push(`${sign(st.defense)}${st.defense} DEF`);
  if (st.maxHealth) parts.push(`${sign(st.maxHealth)}${st.maxHealth} HP`);
  return parts.join(' ');
}