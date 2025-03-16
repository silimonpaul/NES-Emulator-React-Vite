import React, { useEffect, useState } from 'react';
import './App.css';

// We'll gradually convert these to TypeScript imports
declare global {
  interface Window {
    nes: any;
    audioHandler: any;
    zip: any;
  }
}

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const scripts = [
      '/lib/zip.js',
      '/lib/inflate.js',
      '/nes/mappers.js',
      '/mappers/nrom.js',
      '/mappers/mmc1.js',
      '/mappers/uxrom.js',
      '/mappers/cnrom.js',
      '/mappers/mmc3.js',
      '/mappers/axrom.js',
      '/mappers/colordreams.js',
      '/nes/cpu.js',
      '/nes/ppu.js',
      '/nes/apu.js',
      '/nes/nes.js',
      '/js/audio-worklet.js',
      '/js/audio.js',
      '/js/main.js',
      '/js/input.js',
      '/js/saveState.js',
      '/js/utils.js',
      '/js/config.js',
      '/js/debugTools.js'
    ];

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.body.appendChild(script);
      });
    };

    const loadScriptsSequentially = async () => {
      try {
        for (const script of scripts) {
          await loadScript(script);
        }
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading scripts:', error);
      }
    };

    loadScriptsSequentially();

    // Initialize audio on first user interaction
    const initAudio = () => {
      if (window.audioHandler) {
        window.audioHandler.resume().catch((e: Error) => {
          console.error('Failed to start audio:', e);
        });
      }
    };

    document.addEventListener('click', initAudio, { once: true });

    return () => {
      document.removeEventListener('click', initAudio);
      scripts.forEach(src => {
        const script = document.querySelector(`script[src="${src}"]`);
        if (script) {
          document.body.removeChild(script);
        }
      });
    };
  }, []);

  return (
    <div className="App">
      <canvas 
        id="output" 
        width="256" 
        height="240" 
        style={{ 
          imageRendering: 'pixelated',
          width: '512px',  // Double size for clearer display
          height: '480px'
        }}
      />
      <div id="root"></div>
      <div className="controls">
        <input id="rom" type="file" accept=".nes,.NES,.zip,.ZIP" />
        <button id="fullscreen">Fullscreen</button>
        <button id="toggleLog">Toggle Log</button>
        <button id="configControls">Configure Controls</button>
        <button id="saveState">Save State</button>
        <button id="loadState">Load State</button>
        <button id="stop">Stop</button>
      </div>
    </div>
  );
}

export default App; 