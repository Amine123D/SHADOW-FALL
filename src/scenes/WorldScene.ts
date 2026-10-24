import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import { BALANCE } from '../data/balance';
import { ENEMIES } from '../data/enemies';
import { ItemDef, RARITY_COLOR, colorCss } from '../data/items';
import { gameState } from '../game/GameRegistry';
import { Player } from '../entities/Player';
import { Enemy, ShootFn } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import {
  calculateDamage,
  rectOf,
  rectsOverlap,
  rollCritical,
} from '../systems/CombatSystem';
import { rollDrop } from '../systems/LootSystem';
import { addXp, xpToNext } from '../systems/ProgressionSystem';
import { saveGame } from '../systems/SaveSystem';

interface Drop {
  sprite: Phaser.GameObjects.Rectangle;
  item: ItemDef;
}

const GROUND_TOP = GAME_HEIGHT - 20;
const CHECKPOINT_X = 460;

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private drops: Drop[] = [];
  private healthFill!: Phaser.GameObjects.Rectangle;
  private xpFill!: Phaser.GameObjects.Rectangle;
  private levelText!: Phaser.GameObjects.Text;
  private checkpointFlag!: Phaser.GameObjects.Rectangle;
  private checkpointActive = false;
  private attackPower: number = BALANCE.player.baseAttack;
  private armor = 0;
  private respawnAt = 0;
  private deathShown = false;
  private lastBagFullMsg = 0;

  constructor() {
    super('WorldScene');
  }

  create(): void {
    this.enemies = [];
    this.projectiles = [];
    this.drops = [];
    this.respawnAt = 0;
    this.deathShown = false;
    this.lastBagFullMsg = 0;
    this.checkpointActive = gameState.checkpoint !== null;

    const ground = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 10,
      GAME_WIDTH,
      20,
      0x2b2b3a
    );
    this.physics.add.existing(ground, true);

    const spawn = gameState.checkpoint ?? { x: 40, y: 200 };
    this.player = new Player(this, spawn.x, spawn.y);
    this.physics.add.collider(this.player.sprite, ground);

    const platforms: Array<[number, number, number]> = [
      [110, 205, 70],
      [215, 190, 70],
    ];
    for (const [x, y, w] of platforms) {
      const plat = this.add.rectangle(x, y, w, 8, 0x3b3b52);
      this.physics.add.existing(plat, true);
      this.physics.add.collider(this.player.sprite, plat);
    }

    this.checkpointFlag = this.add.rectangle(
      CHECKPOINT_X,
      GROUND_TOP - 15,
      6,
      30,
      this.checkpointActive ? 0x66dd88 : 0xddaa33
    );

    const shoot: ShootFn = (x, y, dir, damage) => {
      this.projectiles.push(
        new Projectile(this, x, y, dir, damage, this.time.now)
      );
    };

    const spawns: Array<[keyof typeof ENEMIES, number]> = [
      ['crawler', 170],
      ['brute', 290],
      ['spitter', 390],
    ];
    for (const [id, x] of spawns) {
      const enemy = new Enemy(this, ENEMIES[id], x, 200, shoot);
      this.physics.add.collider(enemy.sprite, ground);
      this.enemies.push(enemy);
    }

    this.add.text(
      8,
      8,
      'Arrows: move/jump  Z: attack  X: dodge  I: inventory  Esc: pause',
      { fontFamily: 'monospace', fontSize: '9px', color: '#aaaaaa' }
    );
    this.add.rectangle(8, 26, 100, 8, 0x333333).setOrigin(0, 0.5);
    this.healthFill = this.add
      .rectangle(8, 26, 100, 8, 0xd04a6a)
      .setOrigin(0, 0.5);
    this.levelText = this.add.text(8, 32, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#ffffff',
    });
    this.add.rectangle(8, 46, 100, 5, 0x333333).setOrigin(0, 0.5);
    this.xpFill = this.add.rectangle(8, 46, 100, 5, 0x4a9aff).setOrigin(0, 0.5);

    this.applyStats();
    this.refreshHud();

    const keyboard = this.input.keyboard!;
    keyboard.on('keydown-I', () => this.openOverlay('InventoryScene'));
    keyboard.on('keydown-ESC', () => this.openOverlay('PauseScene'));

    const onResume = () => this.applyStats();
    this.events.on(Phaser.Scenes.Events.RESUME, onResume);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.RESUME, onResume);
    });
  }

  private openOverlay(key: 'InventoryScene' | 'PauseScene'): void {
    if (this.scene.isPaused() || this.player.health <= 0) return;
    if (!gameState.tryToggle()) return;
    this.scene.pause();
    this.scene.launch(key);
  }

  private applyStats(): void {
    const gear = gameState.inventory.getStats();
    const P = BALANCE.progression;
    const level = gameState.progress.level;

    const maxHp = Math.max(
      20,
      BALANCE.player.maxHealth + (level - 1) * P.hpPerLevel + gear.maxHealth
    );
    const delta = maxHp - this.player.maxHealth;
    this.player.maxHealth = maxHp;
    if (this.player.health > 0) {
      this.player.health = Math.min(
        maxHp,
        this.player.health + Math.max(0, delta)
      );
    }

    this.attackPower = Math.max(
      1,
      BALANCE.player.baseAttack + gear.attack + (level - 1) * P.attackPerLevel
    );
    this.armor = gear.defense;
  }

  private refreshHud(): void {
    const { level, xp } = gameState.progress;
    const need = xpToNext(level);
    this.levelText.setText(`Lv ${level}  XP ${xp}/${need}`);
    this.xpFill.scaleX = Math.min(1, xp / need);
  }

  private popup(text: string, x: number, y: number, color = '#ffffff'): void {
    if (!this.scene.isActive()) return;
    const t = this.add
      .text(x, y, text, { fontFamily: 'monospace', fontSize: '10px', color })
      .setOrigin(0.5);
    this.tweens.add({
      targets: t,
      y: y - 18,
      alpha: 0,
      duration: 900,
      onComplete: () => t.destroy(),
    });
  }

  private onEnemyKilled(enemy: Enemy): void {
    const p = this.player.sprite;
    const reward = BALANCE.xpReward[enemy.def.name] ?? 10;
    this.popup(`+${reward} XP`, enemy.sprite.x, enemy.sprite.y - 30, '#66ccff');

    const levelsGained = addXp(gameState.progress, reward);
    if (levelsGained > 0) {
      this.applyStats();
      this.player.health = this.player.maxHealth;
      this.popup('LEVEL UP!', p.x, p.y - 30, '#ffdd44');
    }
    this.refreshHud();

    const item = rollDrop();
    if (item) this.spawnDrop(item, enemy.sprite.x);
  }

  private spawnDrop(item: ItemDef, x: number): void {
    const sprite = this.add
      .rectangle(x, GROUND_TOP - 6, 10, 10, RARITY_COLOR[item.rarity])
      .setStrokeStyle(1, 0xffffff);
    this.tweens.add({
      targets: sprite,
      y: sprite.y - 3,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
    this.drops.push({ sprite, item });
  }

  private activateCheckpoint(): void {
    this.checkpointActive = true;
    gameState.checkpoint = { x: CHECKPOINT_X, y: 200 };
    this.checkpointFlag.setFillStyle(0x66dd88);
    this.player.health = this.player.maxHealth;
    this.popup('Checkpoint!', CHECKPOINT_X, 190, '#66dd88');
    saveGame(1, gameState.toSave())
      .then(() => this.popup('Game saved', CHECKPOINT_X - 20, 175, '#aaaaaa'))
      .catch(() => this.popup('Save failed', CHECKPOINT_X - 20, 175, '#ff6666'));
  }

  update(time: number): void {
    this.player.update(time);
    const p = this.player.sprite;

    for (const enemy of this.enemies) {
      enemy.update(time, p.x, p.y);
      if (enemy.isDead) continue;

      const hitbox = this.player.getAttackHitbox(time);
      if (
        hitbox &&
        !this.player.hasHit(enemy) &&
        rectsOverlap(hitbox, rectOf(enemy.sprite))
      ) {
        this.player.markHit(enemy);
        const isCritical = rollCritical(BALANCE.attack.critChance);
        const damage = calculateDamage({
          baseDamage: this.attackPower,
          defense: enemy.def.defense,
          isCritical,
          critMultiplier: BALANCE.attack.critMultiplier,
        });
        enemy.takeHit(damage, isCritical, this.player.facing, time);
        if (enemy.isDead) {
          this.onEnemyKilled(enemy);
          continue;
        }
      }

      const enemyBox = enemy.getAttackHitbox();
      if (
        enemyBox &&
        !enemy.hitPlayerThisAttack &&
        rectsOverlap(enemyBox, rectOf(p))
      ) {
        enemy.hitPlayerThisAttack = true;
        const dmg = Math.max(1, enemy.def.damage - this.armor);
        this.player.takeDamage(dmg, enemy.facing, time);
      }
    }

    for (const proj of this.projectiles) {
      proj.update(time);
      if (!proj.alive) continue;
      if (rectsOverlap(rectOf(proj.sprite), rectOf(p))) {
        const dmg = Math.max(1, proj.damage - this.armor);
        if (this.player.takeDamage(dmg, proj.direction, time)) {
          proj.destroy();
        }
      }
    }
    this.projectiles = this.projectiles.filter((proj) => proj.alive);

    for (const drop of this.drops) {
      if (!rectsOverlap(rectOf(p), rectOf(drop.sprite))) continue;
      if (gameState.inventory.add(drop.item.id)) {
        this.popup(
          drop.item.name,
          p.x,
          p.y - 30,
          colorCss(RARITY_COLOR[drop.item.rarity])
        );
        this.tweens.killTweensOf(drop.sprite);
        drop.sprite.destroy();
      } else if (time - this.lastBagFullMsg > 1500) {
        this.lastBagFullMsg = time;
        this.popup('Bag full! (I)', p.x, p.y - 30, '#ff8866');
      }
    }
    this.drops = this.drops.filter((d) => d.sprite.active);

    if (
      !this.checkpointActive &&
      this.player.health > 0 &&
      rectsOverlap(rectOf(p), rectOf(this.checkpointFlag))
    ) {
      this.activateCheckpoint();
    }

    if (this.enemies.every((e) => e.isDead)) {
      if (this.respawnAt === 0) {
        this.respawnAt = time + BALANCE.respawnDelayMs;
      } else if (time >= this.respawnAt) {
        this.enemies.forEach((e) => e.respawn());
        this.respawnAt = 0;
      }
    }

    this.healthFill.scaleX = this.player.health / this.player.maxHealth;

    if (this.player.health <= 0 && !this.deathShown) {
      this.deathShown = true;
      this.add
        .text(GAME_WIDTH / 2, 110, 'You fell.\nPress R to try again', {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: '#ffffff',
          align: 'center',
        })
        .setOrigin(0.5);
      this.input.keyboard!.once('keydown-R', () => this.scene.restart());
    }
  }
}