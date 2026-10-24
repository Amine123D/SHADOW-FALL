import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/constants';

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('WorldScene');
  }

  create(): void {
    const ground = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 10,
      GAME_WIDTH,
      20,
      0x2b2b3a
    );
    this.physics.add.existing(ground, true);

    this.player = this.add.rectangle(60, 100, 16, 24, 0xc8a2ff);
    this.physics.add.existing(this.player);

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, ground);

    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  update(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    if (this.cursors.left.isDown) body.setVelocityX(-120);
    else if (this.cursors.right.isDown) body.setVelocityX(120);
    else body.setVelocityX(0);

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && body.blocked.down) {
      body.setVelocityY(-260);
    }
  }
}