class EmulatorConfig {
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

  get(key) {
    return key.split('.').reduce((o, i) => o[i], this.config);
  }

  set(key, value) {
    const keys = key.split('.');
    const last = keys.pop();
    const obj = keys.reduce((o, i) => o[i], this.config);
    obj[last] = value;
    this.saveConfig();
  }

  loadConfig() {
    try {
      const saved = localStorage.getItem('emulator_config');
      if (saved) {
        this.config = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load config:', e);
    }
  }

  saveConfig() {
    try {
      localStorage.setItem('emulator_config', JSON.stringify(this.config));
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  }

  reset() {
    localStorage.removeItem('emulator_config');
    this.loadConfig();
  }
}