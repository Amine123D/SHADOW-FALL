import { Inventory } from '../systems/InventorySystem';
import type { Progress } from '../systems/ProgressionSystem';
import type { SaveData } from '../systems/SaveSystem';

class GameState {
  inventory = new Inventory();
  progress: Progress = { level: 1, xp: 0 };
  checkpoint: { x: number; y: number } | null = null;
  private lastToggle = 0;

  reset(): void {
    this.inventory = new Inventory();
    this.progress = { level: 1, xp: 0 };
    this.checkpoint = null;
  }

  toSave(): SaveData {
    return {
      version: 1,
      level: this.progress.level,
      xp: this.progress.xp,
      bag: [...this.inventory.bag],
      equipped: { ...this.inventory.equipped },
      checkpoint: this.checkpoint ? { ...this.checkpoint } : null,
    };
  }

  applySave(data: SaveData): void {
    this.reset();
    this.progress = { level: data.level, xp: data.xp };
    this.inventory.bag = [...data.bag];
    this.inventory.equipped = { ...data.equipped };
    this.checkpoint = data.checkpoint ? { ...data.checkpoint } : null;
  }

  // Stops one key press from opening and closing a menu in the same moment.
  tryToggle(): boolean {
    const now = Date.now();
    if (now - this.lastToggle < 250) return false;
    this.lastToggle = now;
    return true;
  }
}

export const gameState = new GameState();