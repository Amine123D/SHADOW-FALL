import Phaser from 'phaser';
import { BALANCE } from '../data/balance';
import { Rect } from '../systems/CombatSystem';

type PlayerState = 'normal' | 'attacking' | 'dodging' | 'hurt';

export class Player {
  readonly sprite: Phaser.GameObjects.Rectangle;
  readonly maxHealth = BALANCE.player.maxHealth;
  health = BALANCE.player.maxHealth;
  facing: 1 | -1 = 1;
  invulnerable = false;

  private readonly body: Phaser.Physics.Arcade.Body;
  private readonly slash: Phaser.GameObjects.Rectangle;
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly attackKey: Phaser.Input.Keyboard.Key;
  private readonly dodgeKey: Phaser.Input.Keyboard.Key;

  private state: PlayerState = 'normal';
  private stateEndsAt = 0;
  private attackStartedAt = 0;
  private attackReadyAt = 0;
  private dodgeReadyAt = 0;
  private iFramesUntil = 0;
  private hitTargets = new Set<object>();

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.rectangle(x, y, 16, 24, 0xc8a2ff);
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);

    this.slash = scene.add
      .rectangle(0, 0, BALANCE.attack.width, BALANCE.attack.height, 0xffffff, 0.6)
      .setVisible(false);

    const keyboard = scene.input.keyboard!;
    this.cursors = keyboard.createCursorKeys();
    this.attackKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.dodgeKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
  }

  canBeHit(time: number): boolean {
    return !this.invulnerable && time >= this.iFramesUntil && this.health > 0;
  }

  takeDamage(amount: number, direction: 1 | -1, time: number): boolean {
    if (!this.canBeHit(time)) return false;
    const H = BALANCE.hurt;
    this.health = Math.max(0, this.health - amount);
    this.state = 'hurt';
    this.stateEndsAt = time + H.stunMs;
    this.iFramesUntil = time + H.invulnMs;
    this.body.setVelocity(direction * H.knockback, -120);
    this.slash.setVisible(false);
    return true;
  }

  update(time: number): void {
    const P = BALANCE.player;
    const D = BALANCE.dodge;

    if (this.health <= 0) {
      this.body.setVelocityX(0);
      this.slash.setVisible(false);
      return;
    }

    if (this.state === 'dodging') {
      if (time >= this.stateEndsAt) {
        this.state = 'normal';
        this.invulnerable = false;
        this.sprite.setAlpha(1);
      } else {
        this.body.setVelocityX(this.facing * D.speed);
        return;
      }
    }

    if (this.state === 'attacking' && time >= this.stateEndsAt) {
      this.state = 'normal';
    }
    if (this.state === 'hurt' && time >= this.stateEndsAt) {
      this.state = 'normal';
    }

    if (this.state === 'normal') {
      if (this.cursors.left.isDown) {
        this.body.setVelocityX(-P.moveSpeed);
        this.facing = -1;
      } else if (this.cursors.right.isDown) {
        this.body.setVelocityX(P.moveSpeed);
        this.facing = 1;
      } else {
        this.body.setVelocityX(0);
      }

      if (
        Phaser.Input.Keyboard.JustDown(this.cursors.up) &&
        this.body.blocked.down
      ) {
        this.body.setVelocityY(P.jumpVelocity);
      }

      if (
        Phaser.Input.Keyboard.JustDown(this.attackKey) &&
        time >= this.attackReadyAt
      ) {
        this.startAttack(time);
      } else if (
        Phaser.Input.Keyboard.JustDown(this.dodgeKey) &&
        time >= this.dodgeReadyAt
      ) {
        this.startDodge(time);
      }
    } else if (this.state === 'attacking') {
      this.body.setVelocityX(0);
    }

    if (this.state !== 'dodging') {
      const blink = time < this.iFramesUntil && Math.floor(time / 60) % 2 === 1;
      this.sprite.setAlpha(blink ? 0.4 : 1);
    }

    const hitbox = this.getAttackHitbox(time);
    if (hitbox) {
      this.slash
        .setPosition(hitbox.x + hitbox.width / 2, hitbox.y + hitbox.height / 2)
        .setVisible(true);
    } else {
      this.slash.setVisible(false);
    }
  }

  private startAttack(time: number): void {
    const A = BALANCE.attack;
    this.state = 'attacking';
    this.attackStartedAt = time;
    this.stateEndsAt = time + A.durationMs;
    this.attackReadyAt = time + A.durationMs + A.cooldownMs;
    this.hitTargets.clear();
    this.body.setVelocityX(0);
  }

  private startDodge(time: number): void {
    const D = BALANCE.dodge;
    this.state = 'dodging';
    this.stateEndsAt = time + D.durationMs;
    this.dodgeReadyAt = time + D.durationMs + D.cooldownMs;
    this.invulnerable = true;
    this.sprite.setAlpha(0.4);
  }

  getAttackHitbox(time: number): Rect | null {
    if (this.state !== 'attacking') return null;
    const A = BALANCE.attack;
    const t = time - this.attackStartedAt;
    if (t < A.hitStartMs || t > A.hitEndMs) return null;

    const x =
      this.facing === 1
        ? this.sprite.x + this.sprite.width / 2
        : this.sprite.x - this.sprite.width / 2 - A.width;
    return { x, y: this.sprite.y - A.height / 2, width: A.width, height: A.height };
  }

  hasHit(target: object): boolean {
    return this.hitTargets.has(target);
  }

  markHit(target: object): void {
    this.hitTargets.add(target);
  }
}