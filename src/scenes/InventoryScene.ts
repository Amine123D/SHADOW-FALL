import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import { BALANCE } from '../data/balance';
import { gameState } from '../game/GameRegistry';
import {
  ITEM_BY_ID,
  ItemDef,
  RARITY_COLOR,
  SLOTS,
  colorCss,
  describeStats,
} from '../data/items';

export class InventoryScene extends Phaser.Scene {
  private layer!: Phaser.GameObjects.Container;
  private info!: Phaser.GameObjects.Text;

  constructor() {
    super('InventoryScene');
  }

  create(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85);
    this.layer = this.add.container(0, 0);
    this.info = this.add.text(16, 252, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#ffdd88',
    });

    const keyboard = this.input.keyboard!;
    keyboard.on('keydown-I', this.close, this);
    keyboard.on('keydown-ESC', this.close, this);

    this.renderUi();
  }

  private close(): void {
    if (!gameState.tryToggle()) return;
    this.scene.resume('WorldScene');
    this.scene.stop();
  }

  private text(x: number, y: number, str: string, color = '#ffffff', size = 9) {
    const t = this.add.text(x, y, str, {
      fontFamily: 'monospace',
      fontSize: `${size}px`,
      color,
    });
    this.layer.add(t);
    return t;
  }

  private compare(item: ItemDef): string {
    const equippedId = gameState.inventory.equipped[item.slot];
    const cur = equippedId
      ? ITEM_BY_ID[equippedId].stats
      : { attack: 0, defense: 0, maxHealth: 0 };
    const diff = {
      attack: item.stats.attack - cur.attack,
      defense: item.stats.defense - cur.defense,
      maxHealth: item.stats.maxHealth - cur.maxHealth,
    };
    return `vs equipped: ${describeStats(diff) || 'no change'}`;
  }

  private renderUi(): void {
    this.layer.removeAll(true);
    this.info.setText('');
    const inv = gameState.inventory;

    this.text(16, 10, 'INVENTORY', '#c8a2ff', 12);
    this.text(GAME_WIDTH - 80, 10, '[ Close ]', '#ffffff', 10)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.close());

    this.text(16, 34, 'EQUIPPED (tap to remove)', '#888888');
    let y = 48;
    for (const slot of SLOTS) {
      const id = inv.equipped[slot];
      if (id) {
        const item = ITEM_BY_ID[id];
        this.text(16, y, `${slot.toUpperCase()}: ${item.name}`, colorCss(RARITY_COLOR[item.rarity]))
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => {
            const ok = inv.unequip(slot);
            this.renderUi();
            if (!ok) this.info.setText('Bag is full');
          });
        this.text(16, y + 11, describeStats(item.stats), '#aaaaaa');
      } else {
        this.text(16, y, `${slot.toUpperCase()}: (empty)`, '#555555');
      }
      y += 28;
    }

    this.text(16, 140, `Level ${gameState.progress.level}`, '#ffffff', 10);
    this.text(16, 156, 'BONUS FROM GEAR', '#888888');
    this.text(16, 168, describeStats(inv.getStats()) || 'none', '#ffffff');

    this.text(236, 34, `BAG ${inv.bag.length}/${BALANCE.inventory.bagSize} (tap to equip)`, '#888888');
    inv.bag.forEach((id, i) => {
      const item = ITEM_BY_ID[id];
      this.text(236, 48 + i * 14, `${item.name}  ${describeStats(item.stats)}`, colorCss(RARITY_COLOR[item.rarity]))
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          inv.equip(id);
          this.renderUi();
        })
        .on('pointerover', () => this.info.setText(this.compare(item)))
        .on('pointerout', () => this.info.setText(''));
    });
  }
}