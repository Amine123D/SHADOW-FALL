import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import { BALANCE } from '../data/balance';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import {
  calculateDamage,
  rectOf,
  rectsOverlap,
  rollCritical,
} from '../systems/CombatSystem';

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private enemy!: Enemy;

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

    this.player = new Player(this, 60, 100);
    this.physics.add.collider(this.player.sprite, ground);

    this.enemy = new Enemy(this, 220, 200);
    this.physics.add.collider(this.enemy.sprite, ground);

    this.add.text(8, 8, 'Arrows: move/jump   Z: attack   X: dodge', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#aaaaaa',
    });
  }

  update(time: number): void {
    this.player.update(time);
    this.enemy.update();

    const hitbox = this.player.getAttackHitbox(time);
    if (
      hitbox &&
      this.enemy.health > 0 &&
      !this.player.hasHit(this.enemy) &&
      rectsOverlap(hitbox, rectOf(this.enemy.sprite))
    ) {
      this.player.markHit(this.enemy);
      const isCritical = rollCritical(BALANCE.attack.critChance);
      const damage = calculateDamage({
        baseDamage: BALANCE.player.baseAttack,
        defense: this.enemy.defense,
        isCritical,
        critMultiplier: BALANCE.attack.critMultiplier,
      });
      this.enemy.takeHit(damage, isCritical, this.player.facing);
    }
  }
}