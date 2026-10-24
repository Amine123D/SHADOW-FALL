import Phaser from 'phaser';

export type Action =
  | 'left'
  | 'right'
  | 'jump'
  | 'attack'
  | 'dodge'
  | 'rush'
  | 'quake'
  | 'stance';

const ACTIONS: Action[] = [
  'left',
  'right',
  'jump',
  'attack',
  'dodge',
  'rush',
  'quake',
  'stance',
];

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  attack: boolean;
  dodge: boolean;
  rush: boolean;
  quake: boolean;
  stance: boolean;
}

const blank = (): Record<Action, boolean> => ({
  left: false,
  right: false,
  jump: false,
  attack: false,
  dodge: false,
  rush: false,
  quake: false,
  stance: false,
});

export class InputSystem {
  private readonly keys: Record<Action, Phaser.Input.Keyboard.Key>;
  private readonly held = blank();
  private readonly tapped = blank();

  constructor(scene: Phaser.Scene) {
    const kb = scene.input.keyboard;
    if (!kb) throw new Error('Keyboard input is not available');
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = {
      left: kb.addKey(K.LEFT),
      right: kb.addKey(K.RIGHT),
      jump: kb.addKey(K.UP),
      attack: kb.addKey(K.Z),
      dodge: kb.addKey(K.X),
      rush: kb.addKey(K.A),
      quake: kb.addKey(K.S),
      stance: kb.addKey(K.D),
    };
  }

  // Call once per frame. "pressed" actions are true only on the frame they start.
  poll(): InputState {
    const pressed = (a: Action): boolean => {
      const fromKeyboard = Phaser.Input.Keyboard.JustDown(this.keys[a]);
      const fromTouch = this.tapped[a];
      this.tapped[a] = false;
      return fromKeyboard || fromTouch;
    };
    return {
      left: this.keys.left.isDown || this.held.left,
      right: this.keys.right.isDown || this.held.right,
      jump: pressed('jump'),
      attack: pressed('attack'),
      dodge: pressed('dodge'),
      rush: pressed('rush'),
      quake: pressed('quake'),
      stance: pressed('stance'),
    };
  }

  setVirtual(action: Action, down: boolean): void {
    this.held[action] = down;
    if (down) this.tapped[action] = true;
  }

  // Clears everything so no direction or attack stays stuck after a pause or focus loss.
  releaseAll(): void {
    for (const a of ACTIONS) {
      this.held[a] = false;
      this.tapped[a] = false;
      this.keys[a].reset();
    }
  }
}