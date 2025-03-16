const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// Define source and output directories
const srcDir = path.join(__dirname, "src");
const publicDir = path.join(__dirname, "public");

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Define directory structure
const dirs = ["lib", "js", "nes", "mappers"].map((dir) =>
  path.join(publicDir, dir)
);

// Create directories
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Verify source files exist
const requiredSrcFiles = [
  "core/cpu.ts",
  "core/ppu.ts",
  "core/apu.ts",
  "core/nes.ts",
  // ... add other required files
];

const missingFiles = requiredSrcFiles.filter(
  (file) => !fs.existsSync(path.join(srcDir, file))
);

if (missingFiles.length > 0) {
  console.error("Missing required source files:", missingFiles);
  process.exit(1);
}

// Copy external libraries
const libFiles = [
  { src: "node_modules/jszip/dist/jszip.min.js", dest: "lib/zip.js" },
  { src: "node_modules/jszip/dist/jszip.min.js.map", dest: "lib/zip.js.map" },
  { src: "node_modules/pako/dist/pako_inflate.min.js", dest: "lib/inflate.js" },
];

libFiles.forEach(({ src, dest }) => {
  const srcPath = path.join(__dirname, src);
  const destPath = path.join(publicDir, dest);

  if (!fs.existsSync(srcPath)) {
    console.error(`Error: Required library file not found: ${src}`);
    process.exit(1);
  }

  fs.copyFileSync(srcPath, destPath);
});

// Run TypeScript compiler
exec("tsc", (error, stdout, stderr) => {
  if (error || stderr) {
    console.error("TypeScript compilation failed:", error || stderr);
    process.exit(1);
  }

  console.log("TypeScript compilation successful");

  // Move compiled files
  const compiledFiles = {
    "core/mappers/nrom.js": "mappers/nrom.js",
    "core/mappers/mmc1.js": "mappers/mmc1.js",
    "core/mappers/uxrom.js": "mappers/uxrom.js",
    "core/mappers/cnrom.js": "mappers/cnrom.js",
    "core/mappers/mmc3.js": "mappers/mmc3.js",
    "core/mappers/axrom.js": "mappers/axrom.js",
    "core/mappers/colordreams.js": "mappers/colordreams.js",
    "core/mappers/mapper-factory.js": "nes/mappers.js",
    "core/cpu.js": "nes/cpu.js",
    "core/ppu.js": "nes/ppu.js",
    "core/apu.js": "nes/apu.js",
    "core/nes.js": "nes/nes.js",
    "core/audio/audio-worklet.js": "js/audio-worklet.js",
    "core/audio/audio-handler.js": "js/audio.js",
    "core/main.js": "js/main.js",
    "core/input.js": "js/input.js",
    "utils/save-state.js": "js/saveState.js",
    "utils/emulator-utils.js": "js/utils.js",
    "utils/config.js": "js/config.js",
    "core/debug/debug-tools.js": "js/debugTools.js",
  };

  Object.entries(compiledFiles).forEach(([src, dest]) => {
    const srcPath = path.join(publicDir, src);
    const destPath = path.join(publicDir, dest);

    if (!fs.existsSync(srcPath)) {
      console.error(`Warning: Compiled file not found: ${src}`);
      return;
    }

    fs.renameSync(srcPath, destPath);
  });
});
