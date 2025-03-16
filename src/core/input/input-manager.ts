type ButtonMapping = 'p1_up' | 'p1_down' | 'p1_left' | 'p1_right' | 'p1_a' | 'p1_b' | 'p1_start' | 'p1_select' |
                   'p2_up' | 'p2_down' | 'p2_left' | 'p2_right' | 'p2_a' | 'p2_b' | 'p2_start' | 'p2_select';

export class InputManager {
  private keyStates: Map<string, boolean>;
  private gamepadStates: Map<number, Gamepad>;
  private buttonMappings: Map<string, ButtonMapping>;

  constructor() {
    this.keyStates = new Map();
    this.gamepadStates = new Map();
    this.buttonMappings = new Map();
    
    this.setupDefaultMappings();
    this.setupEventListeners();
  }

  private setupDefaultMappings(): void {
    // Player 1 default mappings
    this.buttonMappings.set('ArrowUp', 'p1_up');
    this.buttonMappings.set('ArrowDown', 'p1_down');
    this.buttonMappings.set('ArrowLeft', 'p1_left');
    this.buttonMappings.set('ArrowRight', 'p1_right');
    this.buttonMappings.set('x', 'p1_a');
    this.buttonMappings.set('z', 'p1_b');
    this.buttonMappings.set('Enter', 'p1_start');
    this.buttonMappings.set('Shift', 'p1_select');

    // Player 2 default mappings
    this.buttonMappings.set('i', 'p2_up');
    this.buttonMappings.set('k', 'p2_down');
    this.buttonMappings.set('j', 'p2_left');
    this.buttonMappings.set('l', 'p2_right');
    this.buttonMappings.set('g', 'p2_a');
    this.buttonMappings.set('t', 'p2_b');
    this.buttonMappings.set('p', 'p2_start');
    this.buttonMappings.set('o', 'p2_select');
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    window.addEventListener('gamepadconnected', (e) => this.handleGamepadConnected(e));
    window.addEventListener('gamepaddisconnected', (e) => this.handleGamepadDisconnected(e));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const mapping = this.buttonMappings.get(event.key);
    if (mapping) {
      event.preventDefault();
      this.keyStates.set(mapping, true);
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const mapping = this.buttonMappings.get(event.key);
    if (mapping) {
      event.preventDefault();
      this.keyStates.set(mapping, false);
    }
  }

  private handleGamepadConnected(event: GamepadEvent): void {
    this.gamepadStates.set(event.gamepad.index, event.gamepad);
    console.log(`Gamepad connected: ${event.gamepad.id}`);
  }

  private handleGamepadDisconnected(event: GamepadEvent): void {
    this.gamepadStates.delete(event.gamepad.index);
    console.log('Gamepad disconnected');
  }

  public updateGamepadState(): void {
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      if (gamepad) {
        this.gamepadStates.set(gamepad.index, gamepad);
        this.processGamepadInput(gamepad);
      }
    }
  }

  private processGamepadInput(gamepad: Gamepad): void {
    // Process D-pad (buttons 12-15)
    const player = gamepad.index === 0 ? 'p1' : 'p2';
    this.keyStates.set(`${player}_up`, gamepad.buttons[12].pressed);
    this.keyStates.set(`${player}_down`, gamepad.buttons[13].pressed);
    this.keyStates.set(`${player}_left`, gamepad.buttons[14].pressed);
    this.keyStates.set(`${player}_right`, gamepad.buttons[15].pressed);

    // Process face buttons
    this.keyStates.set(`${player}_b`, gamepad.buttons[0].pressed);
    this.keyStates.set(`${player}_a`, gamepad.buttons[1].pressed);
    this.keyStates.set(`${player}_select`, gamepad.buttons[8].pressed);
    this.keyStates.set(`${player}_start`, gamepad.buttons[9].pressed);
  }

  public getButtonState(button: ButtonMapping): boolean {
    return this.keyStates.get(button) || false;
  }

  public remapButton(oldKey: string, newKey: string): void {
    const mapping = this.buttonMappings.get(oldKey);
    if (mapping) {
      this.buttonMappings.delete(oldKey);
      this.buttonMappings.set(newKey, mapping);
      this.saveKeyBindings();
    }
  }

  private saveKeyBindings(): void {
    try {
      const mappings = Object.fromEntries(this.buttonMappings);
      localStorage.setItem('keyBindings', JSON.stringify(mappings));
    } catch (e) {
      console.error('Failed to save key bindings:', e);
    }
  }

  private loadKeyBindings(): void {
    try {
      const saved = localStorage.getItem('keyBindings');
      if (saved) {
        const mappings = JSON.parse(saved);
        this.buttonMappings = new Map(Object.entries(mappings));
      }
    } catch (e) {
      console.error('Failed to load key bindings:', e);
    }
  }
} 