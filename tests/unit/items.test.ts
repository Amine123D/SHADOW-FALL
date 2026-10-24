import { describe, it, expect } from 'vitest';
import { Inventory } from '../../src/systems/InventorySystem';
import { rollDrop, rollRarity } from '../../src/systems/LootSystem';

describe('Inventory', () => {
  it('rejects unknown items', () => {
    const inv = new Inventory();
    expect(inv.add('not_an_item')).toBe(false);
  });

  it('equips an item and swaps the old one back to the bag', () => {
    const inv = new Inventory();
    inv.add('rusted_blade');
    inv.add('ashen_sword');
    inv.equip('rusted_blade');
    inv.equip('ashen_sword');
    expect(inv.equipped.weapon).toBe('ashen_sword');
    expect(inv.bag).toContain('rusted_blade');
    expect(inv.bag).not.toContain('ashen_sword');
  });

  it('adds up equipment stats', () => {
    const inv = new Inventory();
    inv.add('ashen_sword');
    inv.add('iron_plate');
    inv.equip('ashen_sword');
    inv.equip('iron_plate');
    expect(inv.getStats()).toEqual({ attack: 4, defense: 3, maxHealth: 0 });
  });

  it('refuses items when the bag is full', () => {
    const inv = new Inventory();
    for (let i = 0; i < 12; i++) expect(inv.add('rusted_blade')).toBe(true);
    expect(inv.add('rusted_blade')).toBe(false);
  });
});

describe('Loot', () => {
  it('drops nothing when the roll is high', () => {
    expect(rollDrop(() => 0.99)).toBeNull();
  });

  it('drops a common item on a low roll', () => {
    expect(rollDrop(() => 0)?.id).toBe('rusted_blade');
  });

  it('can roll epic on the highest roll', () => {
    expect(rollRarity(() => 0.999)).toBe('epic');
  });
});