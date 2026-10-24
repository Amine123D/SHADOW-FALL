import Phaser from 'phaser';
import { BALANCE } from '../data/balance';

export interface ProjectileOptions {
  speed?: number;
  width?: number;
  height?: number;
  color?: number;
  lifeMs?: number;
}

export class Projectile {
  readonly sprite: Phaser.GameObjects.Rectangle;
  readonly damage: number;
  readonly direction: 1 | -1;
  alive = true;

  private readonly diesAt: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: 1 | -1,
    damage: number,
    time: number,
    options: ProjectileOptions = {}
  ) {
    this.damage = damage;
    this.direction = direction;
    this.diesAt = time + (options.lifeMs ?? BALANCE.projectile.lifeMs);

    this.sprite = scene.add.rectangle(
      x,
      y,
      options.width ?? 8,
      options.height ?? 5,
      options.color ?? 0x9be564
    );
    scene.physics.add.existing(this.sprite);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocityX(direction * (options.speed ?? BALANCE.projectile.speed));
  }

  update(time: number): void {
    if (this.alive && time >= this.diesAt) this.destroy();
  }

  destroy(): void {
    if (!this.alive) return;
    this.alive = false;
    this.sprite.destroy();
  }
}