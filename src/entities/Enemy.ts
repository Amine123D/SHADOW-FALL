import Phaser from 'phaser';
import { BALANCE } from '../data/balance';

const NORMAL_COLOR = 0xd04a4a;

export class Enemy {
  readonly sprite: Phaser.GameObjects.Rectangle;
  health: number;
  readonly maxHealth = BALANCE.dummy.maxHealth;
  readonly defense = BALANCE.dummy.defense;

  private readonly scene: Phaser.Scene;
  private readonly body: Phaser.Physics.Arcade.Body;
  private readonly label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.health = this.maxHealth;

    this.sprite = scene.add.rectangle(x, y, 18, 26, NORMAL_COLOR);
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);
    this.body.setDragX(500);

    this.label = scene.add
      .text(x, y - 30, '', { fontFamily: 'monospace', fontSize: '10px', color: '#ffffff' })
      .setOrigin(0.5);
    this.refreshLabel();
  }

  takeHit(damage: number, isCritical: boolean, direction: 1 | -1): void {
    if (this.health <= 0) return;

    this.health = Math.max(0, this.health - damage);
    this.body.setVelocityX(direction * BALANCE.attack.knockback);
    this.refreshLabel();

    this.sprite.setFillStyle(0xffffff);
    this.scene.time.delayedCall(80, () => this.sprite.setFillStyle(NORMAL_COLOR));

    const text = this.scene.add
      .text(this.sprite.x, this.sprite.y - 20, String(damage), {
        fontFamily: 'monospace',
        fontSize: isCritical ? '14px' : '10px',
        color: isCritical ? '#ffdd44' : '#ffffff',
      })
      .setOrigin(0.5);
    this.scene.tweens.add({
      targets: text,
      y: text.y - 20,
      alpha: 0,
      duration: 500,
      onComplete: () => text.destroy(),
    });

    if (this.health === 0) {
      this.scene.time.delayedCall(800, () => {
        this.health = this.maxHealth;
        this.refreshLabel();
      });
    }
  }

  update(): void {
    this.label.setPosition(this.sprite.x, this.sprite.y - 30);
  }

  private refreshLabel(): void {
    this.label.setText(`${this.health}/${this.maxHealth}`);
  }
}