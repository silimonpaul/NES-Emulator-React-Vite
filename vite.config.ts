import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          'nes-core': [
            './src/core/nes.ts',
            './src/core/cpu.ts',
            './src/core/ppu.ts',
            './src/core/apu.ts',
          ],
          'nes-mappers': [
            './src/core/mappers/nrom.ts',
            './src/core/mappers/mmc1.ts',
            './src/core/mappers/uxrom.ts',
            './src/core/mappers/cnrom.ts',
            './src/core/mappers/mmc3.ts',
            './src/core/mappers/axrom.ts',
            './src/core/mappers/colordreams.ts',
          ],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  publicDir: 'public',
}); 