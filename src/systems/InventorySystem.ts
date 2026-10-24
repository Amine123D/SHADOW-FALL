import { BALANCE } from '../data/balance';
import { ITEM_BY_ID, ItemStats, Slot } from '../data/items';

export type Equipped = Record<Slot, string | null>;

export class Inventory {
  bag: string[] = [];
  equipped: Equipped = { weapon: null, armor: null, trinket: null };

  isFull(): boolean {
    return this.bag.length >= BALANCE.inventory.bagSize;
  }

  add(id: string): boolean {
    if (!ITEM_BY_ID[id] || this.isFull()) return false;
    this.bag.push(id);
    return true;
  }

  equip(id: string): boolean {
    const index = this.bag.indexOf(id);
    const item = ITEM_BY_ID[id];
    if (index === -1 || !item) return false;
    const previous = this.equipped[item.slot];
    this.bag.splice(index, 1);
    if (previous) this.bag.push(previous);
    this.equipped[item.slot] = id;
    return true;
  }

  unequip(slot: Slot): boolean {
    const id = this.equipped[slot];
    if (!id || this.isFull()) return false;
    this.bag.push(id);
    this.equipped[slot] = null;
    return true;
  }

  getStats(): ItemStats {
    const total: ItemStats = { attack: 0, defense: 0, maxHealth: 0 };
    for (const id of Object.values(this.equipped)) {
      if (!id) continue;
      const stats = ITEM_BY_ID[id].stats;
      total.attack += stats.attack;
      total.defense += stats.defense;
      total.maxHealth += stats.maxHealth;
    }
    return total;
  }
}