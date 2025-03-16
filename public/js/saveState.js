class SaveStateManager {
  constructor(nes) {
    this.nes = nes;
    this.states = new Map();
  }

  saveState(slot = 0) {
    const state = {
      cpu: this.serializeComponent(this.nes.cpu),
      ppu: this.serializeComponent(this.nes.ppu),
      apu: this.serializeComponent(this.nes.apu),
      ram: Array.from(this.nes.ram),
      mapper: this.serializeComponent(this.nes.mapper),
      timestamp: Date.now()
    };
    this.states.set(slot, state);
    this.saveToLocalStorage(slot, state);
    return true;
  }

  loadState(slot = 0) {
    const state = this.states.get(slot) || this.loadFromLocalStorage(slot);
    if (!state) return false;

    this.deserializeComponent(this.nes.cpu, state.cpu);
    this.deserializeComponent(this.nes.ppu, state.ppu);
    this.deserializeComponent(this.nes.apu, state.apu);
    this.nes.ram.set(state.ram);
    this.deserializeComponent(this.nes.mapper, state.mapper);
    return true;
  }

  serializeComponent(component) {
    if (!component.saveVars) return null;
    const state = {};
    for (const variable of component.saveVars) {
      if (component[variable] instanceof Uint8Array) {
        state[variable] = Array.from(component[variable]);
      } else {
        state[variable] = component[variable];
      }
    }
    return state;
  }

  deserializeComponent(component, state) {
    if (!state || !component.saveVars) return;
    for (const variable of component.saveVars) {
      if (state[variable] instanceof Array) {
        component[variable] = new Uint8Array(state[variable]);
      } else {
        component[variable] = state[variable];
      }
    }
  }

  saveToLocalStorage(slot, state) {
    try {
      localStorage.setItem(`nesState_${slot}`, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }

  loadFromLocalStorage(slot) {
    try {
      const data = localStorage.getItem(`nesState_${slot}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
      return null;
    }
  }
}