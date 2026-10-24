import Phaser from 'phaser';
import { GAME_WIDTH } from '../game/constants';
import { gameState } from '../game/GameRegistry';
import { loadGame, SaveData } from '../systems/SaveSystem';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    this.add
      .text(GAME_WIDTH / 2, 80, 'SHADOWFALL', {
        fontFamily: 'monospace',
        fontSize: '36px',
        color: '#c8a2ff',
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(GAME_WIDTH / 2, 150, 'Loading...', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    let saved: SaveData | null = null;
    let started = false;

    const begin = (continueGame: boolean) => {
      if (started) return;
      started = true;
      gameState.reset();
      if (continueGame && saved) gameState.applySave(saved);
      this.scene.start('WorldScene');
    };

    loadGame(1).then((save) => {
      saved = save;
      if (!prompt.active) return;
      if (save) {
        prompt.setText('SPACE / tap: Continue     N: New game');
        this.add
          .text(GAME_WIDTH / 2, 185, '[ New game ]', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#aaaaaa',
          })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => begin(false));
      } else {
        prompt.setText('SPACE / tap: New game');
      }
    });

    this.input.keyboard?.on('keydown-SPACE', () => begin(true));
    this.input.keyboard?.on('keydown-N', () => begin(false));
    this.input.on(
      'pointerdown',
      (_pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
        if (over.length === 0) begin(true);
      }
    );
  }
}