import Phaser from 'phaser';
import type { Action, InputSystem } from '../systems/InputSystem';

interface HoldSpec {
  action: Action;
  label: string;
  x: number;
  y: number;
  r: number;
  color: number;
}

export class TouchControls {
  private readonly scene: Phaser.Scene;
  private readonly controls: InputSystem;
  private readonly pointerAction = new Map<number, Action>();
  private readonly buttons = new Map<Action, Phaser.GameObjects.Arc>();
  private readonly colors = new Map<Action, number>();

  constructor(
    scene: Phaser.Scene,
    controls: InputSystem,
    onInventory: () => void,
    onPause: () => void
  ) {
    this.scene = scene;
    this.controls = controls;

    this.addHold({ action: 'left', label: '<', x: 30, y: 238, r: 20, color: 0xffffff });
    this.addHold({ action: 'right', label: '>', x: 80, y: 238, r: 20, color: 0xffffff });

    this.addHold({ action: 'jump', label: 'JUMP', x: 446, y: 238, r: 20, color: 0x66ccff });
    this.addHold({ action: 'attack', label: 'ATK', x: 398, y: 238, r: 20, color: 0xff6666 });
    this.addHold({ action: 'dodge', label: 'DODGE', x: 350, y: 238, r: 20, color: 0xcccc66 });

    this.addHold({ action: 'rush', label: 'RUSH', x: 446, y: 196, r: 18, color: 0xffaa55 });
    this.addHold({ action: 'quake', label: 'QUAKE', x: 398, y: 196, r: 18, color: 0xcc88ff });
    this.addHold({ action: 'stance', label: 'GUARD', x: 350, y: 196, r: 18, color: 0x6fa8ff });

    this.addTap(452, 14, 12, 'BAG', onInventory);
    this.addTap(424, 14, 12, 'II', onPause);

    scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      this.release(pointer.id);
    });
    scene.input.on('gameout', () => this.releaseAll());
  }

  private addHold(spec: HoldSpec): void {
    const { scene } = this;
    const btn = scene.add
      .circle(spec.x, spec.y, spec.r, spec.color, 0.3)
      .setStrokeStyle(1, 0xffffff, 0.5)
      .setScrollFactor(0)
      .setDepth(100);
    btn.setInteractive(
      new Phaser.Geom.Circle(spec.r, spec.r, spec.r),
      Phaser.Geom.Circle.Contains
    );
    scene.add
      .text(spec.x, spec.y, spec.label, {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101)
      .setAlpha(0.85);

    this.buttons.set(spec.action, btn);
    this.colors.set(spec.action, spec.color);

    btn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.press(pointer.id, spec.action);
    });
    btn.on('pointerover', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) this.press(pointer.id, spec.action);
    });
    btn.on('pointerout', (pointer: Phaser.Input.Pointer) => {
      this.release(pointer.id);
    });
  }

  private addTap(
    x: number,
    y: number,
    r: number,
    label: string,
    onTap: () => void
  ): void {
    const { scene } = this;
    const btn = scene.add
      .circle(x, y, r, 0xffffff, 0.25)
      .setStrokeStyle(1, 0xffffff, 0.5)
      .setScrollFactor(0)
      .setDepth(100);
    btn.setInteractive(new Phaser.Geom.Circle(r, r, r), Phaser.Geom.Circle.Contains);
    scene.add
      .text(x, y, label, {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101)
      .setAlpha(0.85);
    btn.on('pointerdown', onTap);
  }

  private press(pointerId: number, action: Action): void {
    this.release(pointerId);
    this.pointerAction.set(pointerId, action);
    this.controls.setVirtual(action, true);
    this.buttons.get(action)?.setFillStyle(this.colors.get(action) ?? 0xffffff, 0.65);
  }

  private release(pointerId: number): void {
    const action = this.pointerAction.get(pointerId);
    if (action === undefined) return;
    this.pointerAction.delete(pointerId);
    this.controls.setVirtual(action, false);
    this.buttons.get(action)?.setFillStyle(this.colors.get(action) ?? 0xffffff, 0.3);
  }

  releaseAll(): void {
    for (const id of [...this.pointerAction.keys()]) this.release(id);
  }
}