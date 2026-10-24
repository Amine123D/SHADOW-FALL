import Phaser from 'phaser';
import { BALANCE } from '../data/balance';
import { ABILITIES, ABILITY_TUNING } from '../data/abilities';
import { AbilityCooldowns } from '../systems/AbilitySystem';
import type { InputState, InputSystem } from '../systems/InputSystem';
import type { SfxName } from '../systems/AudioSystem';
import type { Rect } from '../systems/CombatSystem';

type PlayerState =
  | 'normal'
  | 'attacking'
  | 'dodging'
  | 'hurt'
  | 'rushing'
  | 'quake'
  | 'stance';

export interface ActiveHit {
  id: 'attack' | 'rush' | 'quake';
  rect: Rect;
  multiplier: number;
}

const BASE_COLOR = 0xc8a2ff;
const STANCE_COLOR = 0x6fa8ff;

export class Player {
  readonly sprite: Phaser.GameObjects.Rectangle;
  readonly cooldowns = new AbilityCooldowns();
  maxHealth: number = BALANCE.player.maxHealth;
  health: number = BALANCE.player.maxHealth;
  facing: 1 | -1 = 1;
  invulnerable = false;
  onSfx: (name: SfxName) => void = () => {};

  private readonly body: Phaser.Physics.Arcade.Body;
  private readonly slash: Phaser.GameObjects.Rectangle;
  private readonly controls: InputSystem;

  private state: PlayerState = 'normal';
  private stateEndsAt = 0;
  private actionStartedAt = 0;
  private attackReadyAt = 0;
  private dodgeReadyAt = 0;
  private iFramesUntil = 0;
  private hitTargets = new Set<object>();

  constructor(scene: Phaser.Scene, x: number, y: number, controls: InputSystem) {
    this.controls = controls;
    this.sprite = scene.add.rectangle(x, y, 16, 24, BASE_COLOR);
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);

    this.slash = scene.add
      .rectangle(0, 0, BALANCE.attack.width, BALANCE.attack.height, 0xffffff, 0.6)
      .setVisible(false);
  }

  get damageMultiplier(): number {
    return this.state === 'stance'
      ? ABILITY_TUNING.stance.damageTakenMultiplier
      : 1;
  }

  canBeHit(time: number): boolean {
    return !this.invulnerable && time >= this.iFramesUntil && this.health > 0;
  }

  takeDamage(amount: number, direction: 1 | -1, time: number): boolean {
    if (!this.canBeHit(time)) return false;
    this.health = Math.max(0, this.health - amount);
    this.onSfx('hurt');

    if (this.state === 'stance') {
      this.iFramesUntil = time + 300;
      return true;
    }

    const H = BALANCE.hurt;
    this.state = 'hurt';
    this.stateEndsAt = time + H.stunMs;
    this.iFramesUntil = time + H.invulnMs;
    this.body.setVelocity(direction * H.knockback, -120);
    this.slash.setVisible(false);
    return true;
  }

  update(time: number): void {
    const input = this.controls.poll();

    if (this.health <= 0) {
      this.body.setVelocityX(0);
      this.slash.setVisible(false);
      return;
    }

    if (this.state !== 'normal' && time >= this.stateEndsAt) {
      this.endState();
    }

    switch (this.state) {
      case 'normal':
        this.updateNormal(input, time);
        break;
      case 'dodging':
        this.body.setVelocityX(this.facing * BALANCE.dodge.speed);
        break;
      case 'rushing':
        this.body.setVelocityX(this.facing * ABILITY_TUNING.rush.speed);
        break;
      case 'attacking':
      case 'quake':
      case 'stance':
        this.body.setVelocityX(0);
        break;
      case 'hurt':
        break;
    }

    if (this.state !== 'dodging') {
      const blink = time < this.iFramesUntil && Math.floor(time / 60) % 2 === 1;
      this.sprite.setAlpha(blink ? 0.4 : 1);
    }

    const hit = this.getActiveHit(time);
    if (hit) {
      this.slash.setSize(hit.rect.width, hit.rect.height);
      this.slash.setPosition(
        hit.rect.x + hit.rect.width / 2,
        hit.rect.y + hit.rect.height / 2
      );
      this.slash.setVisible(true);
    } else {
      this.slash.setVisible(false);
    }
  }

  private endState(): void {
    if (this.state === 'dodging') {
      this.invulnerable = false;
      this.sprite.setAlpha(1);
    }
    if (this.state === 'stance') {
      this.sprite.setFillStyle(BASE_COLOR);
    }
    this.state = 'normal';
  }

  private updateNormal(input: InputState, time: number): void {
    const P = BALANCE.player;

    if (input.left) {
      this.body.setVelocityX(-P.moveSpeed);
      this.facing = -1;
    } else if (input.right) {
      this.body.setVelocityX(P.moveSpeed);
      this.facing = 1;
    } else {
      this.body.setVelocityX(0);
    }

    if (input.jump && this.body.blocked.down) {
      this.body.setVelocityY(P.jumpVelocity);
      this.onSfx('jump');
    }

    if (input.dodge && time >= this.dodgeReadyAt) {
      this.startDodge(time);
    } else if (input.attack && time >= this.attackReadyAt) {
      this.startAttack(time);
    } else if (input.rush && this.cooldowns.isReady('rush', time)) {
      this.startRush(time);
    } else if (input.quake && this.cooldowns.isReady('quake', time)) {
      this.startQuake(time);
    } else if (input.stance && this.cooldowns.isReady('stance', time)) {
      this.startStance(time);
    }
  }

  private startAttack(time: number): void {
    const A = BALANCE.attack;
    this.state = 'attacking';
    this.actionStartedAt = time;
    this.stateEndsAt = time + A.durationMs;
    this.attackReadyAt = time + A.durationMs + A.cooldownMs;
    this.hitTargets.clear();
    this.body.setVelocityX(0);
    this.onSfx('swing');
  }

  private startDodge(time: number): void {
    const D = BALANCE.dodge;
    this.state = 'dodging';
    this.stateEndsAt = time + D.durationMs;
    this.dodgeReadyAt = time + D.durationMs + D.cooldownMs;
    this.invulnerable = true;
    this.sprite.setAlpha(0.4);
    this.onSfx('dodge');
  }

  private startRush(time: number): void {
    this.cooldowns.start('rush', time, ABILITIES.rush.cooldownMs);
    this.state = 'rushing';
    this.actionStartedAt = time;
    this.stateEndsAt = time + ABILITY_TUNING.rush.durationMs;
    this.hitTargets.clear();
    this.onSfx('rush');
  }

  private startQuake(time: number): void {
    const Q = ABILITY_TUNING.quake;
    this.cooldowns.start('quake', time, ABILITIES.quake.cooldownMs);
    this.state = 'quake';
    this.actionStartedAt = time;
    this.stateEndsAt = time + Q.windupMs + Q.activeMs + Q.recoveryMs;
    this.hitTargets.clear();
    this.body.setVelocityX(0);
    this.onSfx('quake');
  }

  private startStance(time: number): void {
    this.cooldowns.start('stance', time, ABILITIES.stance.cooldownMs);
    this.state = 'stance';
    this.stateEndsAt = time + ABILITY_TUNING.stance.durationMs;
    this.sprite.setFillStyle(STANCE_COLOR);
    this.onSfx('stance');
  }

  getActiveHit(time: number): ActiveHit | null {
    const t = time - this.actionStartedAt;

    if (this.state === 'attacking') {
      const A = BALANCE.attack;
      if (t < A.hitStartMs || t > A.hitEndMs) return null;
      const x =
        this.facing === 1
          ? this.sprite.x + this.sprite.width / 2
          : this.sprite.x - this.sprite.width / 2 - A.width;
      return {
        id: 'attack',
        rect: { x, y: this.sprite.y - A.height / 2, width: A.width, height: A.height },
        multiplier: 1,
      };
    }

    if (this.state === 'rushing') {
      const w = ABILITY_TUNING.rush.hitWidth;
      const x =
        this.facing === 1
          ? this.sprite.x + this.sprite.width / 2
          : this.sprite.x - this.sprite.width / 2 - w;
      return {
        id: 'rush',
        rect: { x, y: this.sprite.y - this.sprite.height / 2, width: w, height: this.sprite.height },
        multiplier: ABILITIES.rush.damageMultiplier,
      };
    }

    if (this.state === 'quake') {
      const Q = ABILITY_TUNING.quake;
      if (t < Q.windupMs || t > Q.windupMs + Q.activeMs) return null;
      return {
        id: 'quake',
        rect: {
          x: this.sprite.x - Q.halfWidth,
          y: this.sprite.y + this.sprite.height / 2 - Q.height,
          width: Q.halfWidth * 2,
          height: Q.height,
        },
        multiplier: ABILITIES.quake.damageMultiplier,
      };
    }

    return null;
  }

  hasHit(target: object): boolean {
    return this.hitTargets.has(target);
  }

  markHit(target: object): void {
    this.hitTargets.add(target);
  }
}