interface EmulatorConfigData {
  audio: {
    enabled: boolean;
    volume: number;
    bufferSize: number;
  };
  video: {
    scale: number;
    filter: 'nearest' | 'linear';
    fullscreen: boolean;
    vsync: boolean;
  };
  input: {
    keyboard: boolean;
    gamepad: boolean;
    touchscreen: boolean;
  };
  system: {
    region: 'NTSC' | 'PAL';
    fps: number;
    debugMode: boolean;
  };
}

export class EmulatorConfig {
  private config: EmulatorConfigData;

  constructor() {
    this.config = {
      audio: {
        enabled: true,
        volume: 0.5,
        bufferSize: 2048
      },
      video: {
        scale: 2,
        filter: 'nearest',
        fullscreen: false,
        vsync: true
      },
      input: {
        keyboard: true,
        gamepad: true,
        touchscreen: false
      },
      system: {
        region: 'NTSC',
        fps: 60,
        debugMode: false
      }
    };

    this.loadConfig();
  }

  public get<T>(key: string): T {
    return key.split('.').reduce((o: any, i: string) => o[i], this.config) as T;
  }

  public set<T>(key: string, value: T): void {
    const keys = key.split('.');
    const last = keys.pop()!;
    const obj = keys.reduce((o: any, i: string) => o[i], this.config);
    obj[last] = value;
    this.saveConfig();
  }

  private loadConfig(): void {
    try {
      const saved = localStorage.getItem('emulator_config');
      if (saved) {
        this.config = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load config:', e);
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem('emulator_config', JSON.stringify(this.config));
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  }

  public reset(): void {
    localStorage.removeItem('emulator_config');
    this.loadConfig();
  }
} 