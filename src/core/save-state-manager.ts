interface Component {
  saveVars?: string[];
  [key: string]: any;
}

interface NESState {
  cpu: Record<string, any> | null;
  ppu: Record<string, any> | null;
  apu: Record<string, any> | null;
  ram: number[];
  mapper: Record<string, any> | null;
  timestamp: number;
}

interface NESSystem {
  cpu: Component;
  ppu: Component;
  apu: Component;
  ram: Uint8Array;
  mapper: Component;
}

export class SaveStateManager {
  private nes: NESSystem;
  private states: Map<number, NESState>;

  constructor(nes: NESSystem) {
    this.nes = nes;
    this.states = new Map();
  }

  public saveState(slot: number = 0): boolean {
    const state: NESState = {
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

  public loadState(slot: number = 0): boolean {
    const state = this.states.get(slot) || this.loadFromLocalStorage(slot);
    if (!state) return false;

    this.deserializeComponent(this.nes.cpu, state.cpu);
    this.deserializeComponent(this.nes.ppu, state.ppu);
    this.deserializeComponent(this.nes.apu, state.apu);
    this.nes.ram.set(state.ram);
    this.deserializeComponent(this.nes.mapper, state.mapper);
    return true;
  }

  private serializeComponent(component: Component): Record<string, any> | null {
    if (!component.saveVars) return null;
    
    const state: Record<string, any> = {};
    for (const variable of component.saveVars) {
      if (component[variable] instanceof Uint8Array) {
        state[variable] = Array.from(component[variable]);
      } else {
        state[variable] = component[variable];
      }
    }
    return state;
  }

  private deserializeComponent(component: Component, state: Record<string, any> | null): void {
    if (!state || !component.saveVars) return;
    
    for (const variable of component.saveVars) {
      if (state[variable] instanceof Array) {
        component[variable] = new Uint8Array(state[variable]);
      } else {
        component[variable] = state[variable];
      }
    }
  }

  private saveToLocalStorage(slot: number, state: NESState): void {
    try {
      localStorage.setItem(`nesState_${slot}`, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }

  private loadFromLocalStorage(slot: number): NESState | null {
    try {
      const data = localStorage.getItem(`nesState_${slot}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
      return null;
    }
  }

  public getStateInfo(slot: number): { timestamp: number } | null {
    const state = this.states.get(slot) || this.loadFromLocalStorage(slot);
    if (!state) return null;
    return {
      timestamp: state.timestamp
    };
  }

  public clearState(slot: number): void {
    this.states.delete(slot);
    localStorage.removeItem(`nesState_${slot}`);
  }

  public clearAllStates(): void {
    this.states.clear();
    for (let i = 0; i < 10; i++) {
      localStorage.removeItem(`nesState_${i}`);
    }
  }
} 