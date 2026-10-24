import Phaser from 'phaser';
import { GAME_WIDTH } from '../game/constants';
import type { BossAttackId, BossDef } from '../data/bosses';
import { nextAttack, phaseIndexFor } from '../systems/BossSystem';
import type { Rect } from '../systems/CombatSystem';

type BossState =
  | 'approach'
  | 'windup'
  | 'attack'
  | 'recovery'
  | 'transition'
  | 'dead';

export type ShockwaveFn = (
  x: number,
  y: number,
  dir: 1 | -1,
  damage: number,
  speed: number
) => void;

const SLAM_TELEGRAPH = 0xffee55;
const SHOCK_TELEGRAPH = 0xff9944;

export class Boss {
  readonly sprite: Phaser.GameObjects.Rectangle;
  readonly def: BossDef;
  health: number;
  facing: 1 | -1 = -1;
  hitPlayerThisAttack = false;
  onPhaseChange: (phase: number) => void = () => {};

  private readonly scene: Phaser.Scene;
  private readonly body: Phaser.Physics.Arcade.Body;
  private readonly barBack: Phaser.GameObjects.Rectangle;
  private readonly barFill: Phaser.GameObjects.Rectangle;
  private readonly nameText: Phaser.GameObjects.Text;
  private readonly onShockwave: ShockwaveFn;
  private readonly groundY: number;
  private state: BossState = 'approach';
  private stateEndsAt = 0;
  private phase = 0;
  private attackCounter = 0;
  private currentAttack: BossAttackId;
  private flashUntil = 0;
  private shownColor: number;

  constructor(
    scene: Phaser.Scene,
    def: BossDef,
    x: number,
    y: number,
    groundY: number,
    onShockwave: ShockwaveFn
  ) {
    this.scene = scene;
    this.def = def;
    this.groundY = groundY;
    this.onShockwave = onShockwave;
    this.health = def.maxHealth;
    this.shownColor = def.color;

    this.sprite = scene.add.rectangle(x, y, def.width, def.height, def.color);
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);

    this.barBack = scene.add
      .rectangle(GAME_WIDTH / 2, 32, 180, 8, 0x222222)
      .setStrokeStyle(1, 0x888888);
    this.barFill = scene.add
      .rectangle(GAME_WIDTH / 2 - 90, 32, 180, 8, 0xd0402a)
      .setOrigin(0, 0.5);
    this.nameText = scene.add
      .text(GAME_WIDTH / 2, 21, def.name, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#ffcc99',
      })
      .setOrigin(0.5);

    this.currentAttack = nextAttack(def.phases[0], 0);
  }

  get isDead(): boolean {
    return this.state === 'dead';
  }

  update(time: number, playerX: number): void {
    if (this.state === 'dead') return;

    const def = this.def;
    const scale = def.phases[this.phase].speedScale;
    const dx = playerX - this.sprite.x;
    const dist = Math.abs(dx);

    switch (this.state) {
      case 'transition':
        this.body.setVelocityX(0);
        if (time >= this.stateEndsAt) this.state = 'approach';
        break;
      case 'approach':
        this.facing = dx >= 0 ? 1 : -1;
        if (this.currentAttack === 'shockwave') {
          this.beginWindup(time, def.shockwave.windupMs / scale);
        } else if (dist <= def.slam.range) {
          this.beginWindup(time, def.slam.windupMs / scale);
        } else {
          this.body.setVelocityX(this.facing * def.moveSpeed * scale);
        }
        break;
      case 'windup':
        this.body.setVelocityX(0);
        if (time >= this.stateEndsAt) this.beginAttack(time);
        break;
      case 'attack':
        this.body.setVelocityX(0);
        if (time >= this.stateEndsAt) {
          const recovery =
            this.currentAttack === 'slam'
              ? def.slam.recoveryMs
              : def.shockwave.recoveryMs;
          this.state = 'recovery';
          this.stateEndsAt = time + recovery / scale;
        }
        break;
      case 'recovery':
        this.body.setVelocityX(0);
        if (time >= this.stateEndsAt) {
          this.attackCounter += 1;
          this.pickAttack();
          this.state = 'approach';
        }
        break;
    }

    let color = def.color;
    if (time < this.flashUntil) {
      color = 0xffffff;
    } else if (this.state === 'windup') {
      color = this.currentAttack === 'slam' ? SLAM_TELEGRAPH : SHOCK_TELEGRAPH;
    } else if (this.state === 'transition') {
      color = Math.floor(time / 100) % 2 === 0 ? 0xffffff : def.color;
    }
    if (color !== this.shownColor) {
      this.sprite.setFillStyle(color);
      this.shownColor = color;
    }
  }

  private pickAttack(): void {
    this.currentAttack = nextAttack(
      this.def.phases[this.phase],
      this.attackCounter
    );
  }

  private beginWindup(time: number, ms: number): void {
    this.state = 'windup';
    this.stateEndsAt = time + ms;
  }

  private beginAttack(time: number): void {
    this.state = 'attack';
    this.hitPlayerThisAttack = false;
    if (this.currentAttack === 'slam') {
      this.stateEndsAt = time + this.def.slam.attackMs;
    } else {
      this.stateEndsAt = time + 100;
      const s = this.def.shockwave;
      this.onShockwave(this.sprite.x - 24, this.groundY - 6, -1, s.damage, s.speed);
      this.onShockwave(this.sprite.x + 24, this.groundY - 6, 1, s.damage, s.speed);
    }
  }

  getAttackHitbox(): Rect | null {
    if (this.state !== 'attack' || this.currentAttack !== 'slam') return null;
    const w = this.def.slam.width;
    const x =
      this.facing === 1
        ? this.sprite.x + this.sprite.width / 2
        : this.sprite.x - this.sprite.width / 2 - w;
    return {
      x,
      y: this.sprite.y - this.sprite.height / 2,
      width: w,
      height: this.sprite.height,
    };
  }

  // Returns false if the hit was ignored (dead, or invulnerable during a phase change).
  takeHit(damage: number, isCritical: boolean, time: number): boolean {
    if (this.state === 'dead' || this.state === 'transition') return false;

    this.health = Math.max(0, this.health - damage);
    this.flashUntil = time + 80;
    this.barFill.scaleX = this.health / this.def.maxHealth;

    const text = this.scene.add
      .text(this.sprite.x, this.sprite.y - this.sprite.height / 2 - 6, String(damage), {
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
      this.die();
      return true;
    }

    const newPhase = phaseIndexFor(
      this.health / this.def.maxHealth,
      this.def.phases
    );
    if (newPhase > this.phase) {
      this.phase = newPhase;
      this.state = 'transition';
      this.stateEndsAt = time + this.def.transitionMs;
      this.attackCounter = 0;
      this.hitPlayerThisAttack = true;
      this.pickAttack();
      this.body.setVelocityX(0);
      this.onPhaseChange(newPhase + 1);
    }
    return true;
  }

  private die(): void {
    this.state = 'dead';
    this.body.setVelocity(0, 0);
    this.body.enable = false;
    this.sprite.setVisible(false);
    this.barBack.setVisible(false);
    this.barFill.setVisible(false);
    this.nameText.setVisible(false);
  }
}