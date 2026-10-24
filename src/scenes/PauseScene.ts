import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import { gameState } from '../game/GameRegistry';
import { saveGame } from '../systems/SaveSystem';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
    this.add
      .text(GAME_WIDTH / 2, 70, 'PAUSED', {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#c8a2ff',
      })
      .setOrigin(0.5);

    const status = this.add
      .text(GAME_WIDTH / 2, 190, '', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#ffdd88',
      })
      .setOrigin(0.5);

    this.button(120, 'Resume', () => this.resume());
    this.button(150, 'Save game', () => {
      saveGame(1, gameState.toSave())
        .then(() => {
          if (status.active) status.setText('Game saved.');
        })
        .catch(() => {
          if (status.active) status.setText('Save failed.');
        });
    });

    this.input.keyboard!.on('keydown-ESC', this.resume, this);
  }

  private resume(): void {
    if (!gameState.tryToggle()) return;
    this.scene.resume('WorldScene');
    this.scene.stop();
  }

  private button(y: number, label: string, onClick: () => void): void {
    this.add
      .text(GAME_WIDTH / 2, y, `[ ${label} ]`, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', onClick);
  }
}