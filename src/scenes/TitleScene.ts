import Phaser from 'phaser';
import { GAME_WIDTH } from '../game/constants';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    this.add
      .text(GAME_WIDTH / 2, 90, 'SHADOWFALL', {
        fontFamily: 'monospace',
        fontSize: '36px',
        color: '#c8a2ff',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 150, 'Tap or press SPACE to start', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const start = () => this.scene.start('WorldScene');
    this.input.once('pointerdown', start);
    this.input.keyboard?.once('keydown-SPACE', start);
  }
}