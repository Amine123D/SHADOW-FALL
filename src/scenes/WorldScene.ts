import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import { BALANCE } from '../data/balance';
import { ENEMIES } from '../data/enemies';
import { ASHEN_COLOSSUS } from '../data/bosses';
import type { AbilityId } from '../data/abilities';
import { ITEMS, RARITY_COLOR, colorCss } from '../data/items';
import type { ItemDef } from '../data/items';
import { gameState } from '../game/GameRegistry';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import type { ShootFn } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { Projectile } from '../entities/Projectile';
import { InputSystem } from '../systems/InputSystem';
import { TouchControls } from '../ui/TouchControls';
import {
  calculateDamage,
  rectOf,
  rectsOverlap,
  rollCritical,
} from '../systems/CombatSystem';
import { rollDrop } from '../systems/LootSystem';
import { addXp, xpToNext } from '../systems/ProgressionSystem';
import { saveGame } from '../systems/SaveSystem';
import { audio } from '../systems/AudioSystem';

interface Drop {
  sprite: Phaser.GameObjects.Rectangle;
  item: ItemDef;
}

const GROUND_TOP = GAME_HEIGHT - 20;
const CHECKPOINT_X = 450;

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private controls!: InputSystem;
  private ground!: Phaser.GameObjects.Rectangle;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private drops: Drop[] = [];
  private boss: Boss | null = null;
  private bossSpawnAt = 0;
  private bossDefeated = false;
  private healthFill!: Phaser.GameObjects.Rectangle;
  private xpFill!: Phaser.GameObjects.Rectangle;
  private levelText!: Phaser.GameObjects.Text;
  private cooldownText!: Phaser.GameObjects.Text;
  private checkpointFlag!: Phaser.GameObjects.Rectangle;
  private checkpointActive = false;
  private attackPower: number = BALANCE.player.baseAttack;
  private armor = 0;
  private respawnAt = 0;
  private deathShown = false;
  private lastBagFullMsg = 0;
  private lastCooldownText = '';

  constructor() {
    super('WorldScene');
  }

  create(): void {
    this.enemies = [];
    this.projectiles = [];
    this.drops = [];
    this.boss = null;
    this.bossSpawnAt = 0;
    this.respawnAt = 0;
    this.deathShown = false;
    this.lastBagFullMsg = 0;
    this.lastCooldownText = '';
    this.checkpointActive = gameState.checkpoint !== null;
    this.bossDefeated = this.checkpointActive;

    this.input.addPointer(3);

    this.ground = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 10,
      GAME_WIDTH,
      20,
      0x2b2b3a
    );
    this.physics.add.existing(this.ground, true);

    this.controls = new InputSystem(this);
    const spawn = gameState.checkpoint ?? { x: 40, y: 200 };
    this.player = new Player(this, spawn.x, spawn.y, this.controls);
    this.player.onSfx = (name) => audio.play(name);
    this.physics.add.collider(this.player.sprite, this.ground);

    const platforms: Array<[number, number, number]> = [
      [110, 205, 70],
      [215, 190, 70],
    ];
    for (const [x, y, w] of platforms) {
      const plat = this.add.rectangle(x, y, w, 8, 0x3b3b52);
      this.physics.add.existing(plat, true);
      this.physics.add.collider(this.player.sprite, plat);
    }

    const flagColor = this.checkpointActive ? 0x66dd88 : 0x555566;
    this.checkpointFlag = this.add.rectangle(
      CHECKPOINT_X,
      GROUND_TOP - 15,
      6,
      30,
      flagColor
    );

    const shoot: ShootFn = (x, y, dir, damage) => {
      this.projectiles.push(
        new Projectile(this, x, y, dir, damage, this.time.now)
      );
    };

    const spawns: Array<[keyof typeof ENEMIES, number]> = [
      ['crawler', 170],
      ['brute', 270],
      ['spitter', 360],
    ];
    for (const [id, x] of spawns) {
      const enemy = new Enemy(this, ENEMIES[id], x, 200, shoot);
      this.physics.add.collider(enemy.sprite, this.ground);
      this.enemies.push(enemy);
    }

    this.add.text(
      8,
      8,
      'Arrows move/jump  Z attack  X dodge  A/S/D abilities  I bag  Esc pause',
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
    this.cooldownText = this.add.text(8, 54, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#88ccff',
    });

    this.applyStats();
    this.refreshHud();

    if (this.sys.game.device.input.touch) {
      new TouchControls(
        this,
        this.controls,
        () => this.openOverlay('InventoryScene'),
        () => this.openOverlay('PauseScene')
      );
    }

    const keyboard = this.input.keyboard!;
    keyboard.on('keydown-I', () => this.openOverlay('InventoryScene'));
    keyboard.on('keydown-ESC', () => this.openOverlay('PauseScene'));

    const onBlur = () => {
      this.controls.releaseAll();
      this.openOverlay('PauseScene');
    };
    const onResume = () => {
      this.applyStats();
      this.controls.releaseAll();
    };
    this.game.events.on(Phaser.Core.Events.BLUR, onBlur);
    this.events.on(Phaser.Scenes.Events.RESUME, onResume);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(Phaser.Core.Events.BLUR, onBlur);
      this.events.off(Phaser.Scenes.Events.RESUME, onResume);
      audio.stopMusic();
    });

    audio.startMusic();
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

  private incoming(raw: number): number {
    return Math.max(
      1,
      Math.round((raw - this.armor) * this.player.damageMultiplier)
    );
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
      duration: 1100,
      onComplete: () => t.destroy(),
    });
  }

  private grantXp(reward: number, x: number, y: number): void {
    this.popup(`+${reward} XP`, x, y - 30, '#66ccff');
    const levelsGained = addXp(gameState.progress, reward);
    if (levelsGained > 0) {
      this.applyStats();
      this.player.health = this.player.maxHealth;
      this.popup('LEVEL UP!', this.player.sprite.x, this.player.sprite.y - 30, '#ffdd44');
      audio.play('levelup');
    }
    this.refreshHud();
  }

  private onEnemyKilled(enemy: Enemy): void {
    const reward = BALANCE.xpReward[enemy.def.name] ?? 10;
    this.grantXp(reward, enemy.sprite.x, enemy.sprite.y);
    const item = rollDrop();
    if (item) this.spawnDrop(item, enemy.sprite.x);
  }

  private spawnBoss(): void {
    const boss = new Boss(
      this,
      ASHEN_COLOSSUS,
      380,
      150,
      GROUND_TOP,
      (x, y, dir, damage, speed) => {
        this.projectiles.push(
          new Projectile(this, x, y, dir, damage, this.time.now, {
            speed,
            width: 14,
            height: 10,
            color: 0xff8844,
            lifeMs: 3500,
          })
        );
      }
    );
    this.physics.add.collider(boss.sprite, this.ground);
    boss.onPhaseChange = (phase) => {
      this.popup(`Phase ${phase}!`, GAME_WIDTH / 2, 80, '#ff8866');
      audio.play('boss');
    };
    this.boss = boss;
    audio.play('boss');
    this.popup('The Ashen Colossus awakens!', GAME_WIDTH / 2, 80, '#ff8866');
  }

  private onBossDefeated(boss: Boss): void {
    this.bossDefeated = true;
    audio.play('win');
    this.popup('Ashen Colossus defeated!', GAME_WIDTH / 2, 80, '#ffdd44');
    this.grantXp(ASHEN_COLOSSUS.xpReward, boss.sprite.x, boss.sprite.y);

    const pool = ITEMS.filter((i) => i.rarity === 'rare' || i.rarity === 'epic');
    const item = pool[Math.floor(Math.random() * pool.length)];
    this.spawnDrop(item, boss.sprite.x);

    this.checkpointFlag.setFillStyle(0xddaa33);
    this.popup('Reach the gold checkpoint', CHECKPOINT_X - 40, 170, '#ddaa33');
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
    audio.play('checkpoint');
    this.popup('Checkpoint! Vertical slice complete', GAME_WIDTH / 2, 100, '#66dd88');
    saveGame(1, gameState.toSave())
      .then(() => this.popup('Game saved', GAME_WIDTH / 2, 130, '#aaaaaa'))
      .catch(() => this.popup('Save failed', GAME_WIDTH / 2, 130, '#ff6666'));
  }

  update(time: number): void {
    this.player.update(time);
    const p = this.player.sprite;
    const hit = this.player.getActiveHit(time);

    for (const enemy of this.enemies) {
      enemy.update(time, p.x, p.y);
      if (enemy.isDead) continue;

      if (
        hit &&
        !this.player.hasHit(enemy) &&
        rectsOverlap(hit.rect, rectOf(enemy.sprite))
      ) {
        this.player.markHit(enemy);
        const isCritical = rollCritical(BALANCE.attack.critChance);
        const damage = calculateDamage({
          baseDamage: Math.round(this.attackPower * hit.multiplier),
          defense: enemy.def.defense,
          isCritical,
          critMultiplier: BALANCE.attack.critMultiplier,
        });
        enemy.takeHit(damage, isCritical, this.player.facing, time);
        audio.play(isCritical ? 'crit' : 'hit');
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
        this.player.takeDamage(this.incoming(enemy.def.damage), enemy.facing, time);
      }
    }

    const allCleared = this.enemies.every((e) => e.isDead);

    if (!this.bossDefeated && this.boss === null && allCleared) {
      if (this.bossSpawnAt === 0) {
        this.bossSpawnAt = time + 1500;
        this.popup('The ground trembles...', GAME_WIDTH / 2, 100, '#ffaa66');
      } else if (time >= this.bossSpawnAt) {
        this.spawnBoss();
      }
    }

    const boss = this.boss;
    if (boss && !boss.isDead) {
      boss.update(time, p.x);

      if (
        hit &&
        !this.player.hasHit(boss) &&
        rectsOverlap(hit.rect, rectOf(boss.sprite))
      ) {
        const isCritical = rollCritical(BALANCE.attack.critChance);
        const damage = calculateDamage({
          baseDamage: Math.round(this.attackPower * hit.multiplier),
          defense: boss.def.defense,
          isCritical,
          critMultiplier: BALANCE.attack.critMultiplier,
        });
        if (boss.takeHit(damage, isCritical, time)) {
          this.player.markHit(boss);
          audio.play(isCritical ? 'crit' : 'hit');
          if (boss.isDead) this.onBossDefeated(boss);
        }
      }

      const bossBox = boss.getAttackHitbox();
      if (
        bossBox &&
        !boss.hitPlayerThisAttack &&
        rectsOverlap(bossBox, rectOf(p))
      ) {
        boss.hitPlayerThisAttack = true;
        this.player.takeDamage(this.incoming(boss.def.slam.damage), boss.facing, time);
      }
    }

    for (const proj of this.projectiles) {
      proj.update(time);
      if (!proj.alive) continue;
      if (rectsOverlap(rectOf(proj.sprite), rectOf(p))) {
        if (this.player.takeDamage(this.incoming(proj.damage), proj.direction, time)) {
          proj.destroy();
        }
      }
    }
    this.projectiles = this.projectiles.filter((proj) => proj.alive);

    for (const drop of this.drops) {
      if (!rectsOverlap(rectOf(p), rectOf(drop.sprite))) continue;
      if (gameState.inventory.add(drop.item.id)) {
        audio.play('pickup');
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
      this.bossDefeated &&
      !this.checkpointActive &&
      this.player.health > 0 &&
      rectsOverlap(rectOf(p), rectOf(this.checkpointFlag))
    ) {
      this.activateCheckpoint();
    }

    if (this.bossDefeated && allCleared) {
      if (this.respawnAt === 0) {
        this.respawnAt = time + BALANCE.respawnDelayMs;
      } else if (time >= this.respawnAt) {
        this.enemies.forEach((e) => e.respawn());
        this.respawnAt = 0;
      }
    }

    this.healthFill.scaleX = this.player.health / this.player.maxHealth;

    const cd = (id: AbilityId): string => {
      const ms = this.player.cooldowns.remainingMs(id, time);
      return ms > 0 ? `${(ms / 1000).toFixed(1)}s` : 'ready';
    };
    const cdText = `A Rush ${cd('rush')}  S Quake ${cd('quake')}  D Guard ${cd('stance')}`;
    if (cdText !== this.lastCooldownText) {
      this.lastCooldownText = cdText;
      this.cooldownText.setText(cdText);
    }

    if (this.player.health <= 0 && !this.deathShown) {
      this.deathShown = true;
      this.add
        .text(GAME_WIDTH / 2, 110, 'You fell.\nPress R or tap to try again', {
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#ffffff',
          align: 'center',
        })
        .setOrigin(0.5);
      this.input.keyboard!.once('keydown-R', () => this.scene.restart());
      this.time.delayedCall(600, () => {
        this.input.once('pointerdown', () => this.scene.restart());
      });
    }
  }
}