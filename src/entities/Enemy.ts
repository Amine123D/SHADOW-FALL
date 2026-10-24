import Phaser from 'phaser';
import { BALANCE } from '../data/balance';
import { EnemyDef } from '../data/enemies';
import { Rect } from '../systems/CombatSystem';

type EnemyState =
  | 'patrol'
  | 'approach'
  | 'windup'
  | 'attack'
  | 'recovery'
  | 'stagger'
  | 'dead';

export type ShootFn = (
  x: number,
  y: number,
  dir: 1 | -1,
  damage: number
) => void;

const TELEGRAPH_COLOR = 0xffee55;
const FLASH_COLOR = 0xffffff;

export class Enemy {
  readonly sprite: Phaser.GameObjects.Rectangle;
  readonly def: EnemyDef;
  health: number;
  facing: 1 | -1 = -1;
  hitPlayerThisAttack = false;

  private readonly scene: Phaser.Scene;
  private readonly body: Phaser.Physics.Arcade.Body;
  private readonly label: Phaser.GameObjects.Text;
  private readonly onShoot: ShootFn;
  private readonly spawnX: number;
  private readonly spawnY: number;
  private state: EnemyState = 'patrol';
  private stateEndsAt = 0;
  private flashUntil = 0;
  private patrolDir: 1 | -1 = 1;
  private shownColor: number;

  constructor(
    scene: Phaser.Scene,
    def: EnemyDef,
    x: number,
    y: number,
    onShoot: ShootFn
  ) {
    this.scene = scene;
    this.def = def;
    this.onShoot = onShoot;
    this.spawnX = x;
    this.spawnY = y;
    this.health = def.maxHealth;
    this.shownColor = def.color;

    this.sprite = scene.add.rectangle(x, y, def.width, def.height, def.color);
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);
    this.body.setDragX(600);

    this.label = scene.add
      .text(x, y - def.height, '', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.refreshLabel();
  }

  get isDead(): boolean {
    return this.state === 'dead';
  }

  update(time: number, playerX: number, playerY: number): void {
    if (this.state === 'dead') return;

    const def = this.def;
    const dx = playerX - this.sprite.x;
    const dy = playerY - this.sprite.y;
    const dist = Math.abs(dx);
    const sees = dist < def.detectRange && Math.abs(dy) < 70;

    switch (this.state) {
      case 'patrol': {
        if (sees) {
          this.state = 'approach';
          break;
        }
        if (this.sprite.x > this.spawnX + 40) this.patrolDir = -1;
        else if (this.sprite.x < this.spawnX - 40) this.patrolDir = 1;
        this.facing = this.patrolDir;
        this.body.setVelocityX(this.patrolDir * def.speed * 0.4);
        break;
      }
      case 'approach': {
        if (dist > def.detectRange * 1.5 || Math.abs(dy) > 120) {
          this.state = 'patrol';
          break;
        }
        this.facing = dx >= 0 ? 1 : -1;
        const cornered = this.body.blocked.left || this.body.blocked.right;
        if (def.role === 'ranged' && dist < def.attackRange * 0.5 && !cornered) {
          this.body.setVelocityX(-this.facing * def.speed);
          break;
        }
        if (dist <= def.attackRange) {
          this.state = 'windup';
          this.stateEndsAt = time + def.windupMs;
          this.body.setVelocityX(0);
          break;
        }
        this.body.setVelocityX(this.facing * def.speed);
        break;
      }
      case 'windup': {
        this.body.setVelocityX(0);
        if (time >= this.stateEndsAt) {
          this.state = 'attack';
          this.stateEndsAt = time + def.attackMs;
          this.hitPlayerThisAttack = false;
          if (def.role === 'ranged') {
            this.onShoot(
              this.sprite.x + this.facing * 10,
              this.sprite.y,
              this.facing,
              def.damage
            );
          }
        }
        break;
      }
      case 'attack': {
        this.body.setVelocityX(0);
        if (time >= this.stateEndsAt) {
          this.state = 'recovery';
          this.stateEndsAt = time + def.recoveryMs;
        }
        break;
      }
      case 'recovery':
      case 'stagger': {
        if (time >= this.stateEndsAt) this.state = 'approach';
        break;
      }
    }

    const color =
      time < this.flashUntil
        ? FLASH_COLOR
        : this.state === 'windup'
          ? TELEGRAPH_COLOR
          : def.color;
    if (color !== this.shownColor) {
      this.sprite.setFillStyle(color);
      this.shownColor = color;
    }

    this.label.setPosition(this.sprite.x, this.sprite.y - def.height);
  }

  getAttackHitbox(): Rect | null {
    if (this.state !== 'attack' || this.def.role !== 'melee') return null;
    const w = this.def.attackWidth;
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

  takeHit(
    damage: number,
    isCritical: boolean,
    direction: 1 | -1,
    time: number
  ): void {
    if (this.state === 'dead') return;

    this.health = Math.max(0, this.health - damage);
    this.flashUntil = time + 80;
    this.refreshLabel();

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
      this.die();
      return;
    }

    const busy = this.state === 'windup' || this.state === 'attack';
    if (this.def.armored && busy) return;

    this.state = 'stagger';
    this.stateEndsAt = time + BALANCE.enemyStaggerMs;
    this.body.setVelocityX(
      direction * BALANCE.attack.knockback * (1 - this.def.knockbackResist)
    );
  }

  respawn(): void {
    this.health = this.def.maxHealth;
    this.state = 'patrol';
    this.flashUntil = 0;
    this.sprite.setVisible(true);
    this.sprite.setFillStyle(this.def.color);
    this.shownColor = this.def.color;
    this.label.setVisible(true);
    this.body.enable = true;
    this.body.reset(this.spawnX, this.spawnY);
    this.refreshLabel();
  }

  private die(): void {
    this.state = 'dead';
    this.sprite.setVisible(false);
    this.label.setVisible(false);
    this.body.setVelocity(0, 0);
    this.body.enable = false;
  }

  private refreshLabel(): void {
    this.label.setText(`${this.health}/${this.def.maxHealth}`);
  }
}