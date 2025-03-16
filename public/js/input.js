class InputManager {
  constructor() {
    this.keyStates = new Map();
    this.gamepadStates = new Map();
    this.buttonMappings = new Map();
    
    this.setupDefaultMappings();
    this.setupEventListeners();
  }

  setupDefaultMappings() {
    // Player 1 default mappings
    this.buttonMappings.set('ArrowUp', 'p1_up');
    this.buttonMappings.set('ArrowDown', 'p1_down');
    this.buttonMappings.set('ArrowLeft', 'p1_left');
    this.buttonMappings.set('ArrowRight', 'p1_right');
    this.buttonMappings.set('x', 'p1_a');
    this.buttonMappings.set('z', 'p1_b');
    this.buttonMappings.set('Enter', 'p1_start');
    this.buttonMappings.set('Shift', 'p1_select');
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    window.addEventListener('gamepadconnected', (e) => this.handleGamepadConnected(e));
    window.addEventListener('gamepaddisconnected', (e) => this.handleGamepadDisconnected(e));
  }

  handleKeyDown(event) {
    const mapping = this.buttonMappings.get(event.key);
    if (mapping) {
      event.preventDefault();
      this.keyStates.set(mapping, true);
    }
  }

  handleKeyUp(event) {
    const mapping = this.buttonMappings.get(event.key);
    if (mapping) {
      event.preventDefault();
      this.keyStates.set(mapping, false);
    }
  }

  handleGamepadConnected(event) {
    this.gamepadStates.set(event.gamepad.index, event.gamepad);
  }

  handleGamepadDisconnected(event) {
    this.gamepadStates.delete(event.gamepad.index);
  }

  updateGamepadState() {
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      if (gamepad) {
        // Update gamepad state
        this.gamepadStates.set(gamepad.index, gamepad);
      }
    }
  }

  getButtonState(button) {
    return this.keyStates.get(button) || false;
  }

  remapButton(oldKey, newKey) {
    const mapping = this.buttonMappings.get(oldKey);
    if (mapping) {
      this.buttonMappings.delete(oldKey);
      this.buttonMappings.set(newKey, mapping);
    }
  }
}