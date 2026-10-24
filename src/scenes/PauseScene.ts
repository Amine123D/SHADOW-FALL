import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import { gameState } from '../game/GameRegistry';
import { saveGame } from '../systems/SaveSystem';
import { audio } from '../systems/AudioSystem';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75);
    this.add
      .text(GAME_WIDTH / 2, 50, 'PAUSED', {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#c8a2ff',
      })
      .setOrigin(0.5);

    const status = this.add
      .text(GAME_WIDTH / 2, 220, '', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#ffdd88',
      })
      .setOrigin(0.5);

    this.button(95, 'Resume', () => this.resume());
    this.button(122, 'Save game', () => {
      saveGame(1, gameState.toSave())
        .then(() => {
          if (status.active) status.setText('Game saved.');
        })
        .catch(() => {
          if (status.active) status.setText('Save failed.');
        });
    });

    this.volumeRow(160, 'Music', () => audio.settings.music, (v) => audio.setMusicVolume(v));
    this.volumeRow(188, 'Effects', () => audio.settings.sfx, (v) => audio.setSfxVolume(v));

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

  private volumeRow(
    y: number,
    label: string,
    get: () => number,
    set: (v: number) => void
  ): void {
    const style = { fontFamily: 'monospace', fontSize: '13px', color: '#ffffff' };
    const text = this.add.text(GAME_WIDTH / 2, y, '', style).setOrigin(0.5);
    const refresh = () => text.setText(`${label}: ${Math.round(get() * 100)}%`);

    this.add
      .text(GAME_WIDTH / 2 - 100, y, '[ - ]', style)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        set(get() - 0.1);
        refresh();
      });
    this.add
      .text(GAME_WIDTH / 2 + 100, y, '[ + ]', style)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        set(get() + 0.1);
        refresh();
      });
    refresh();
  }
}