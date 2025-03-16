function Nina(nes) {
  this.nes = nes;

  // PRG-ROM banks
  this.prgRom = new Uint8Array(0);
  // CHR-ROM banks
  this.chrRom = new Uint8Array(0);

  // Mirroring (h = horizontal, v = vertical)
  this.h = true; // NINA-03/06 uses horizontal mirroring by default

  this.reset = function (hard) {
    // Initialize CHR bank to 0
    this.chrBank = 0;
  };

  this.write = function (adr, value) {
    if (adr >= 0x4100 && adr <= 0x5fff) {
      // Lower 2 bits select the 8KB CHR bank
      this.chrBank = value & 0x03;
    }
  };

  this.read = function (adr) {
    // PRG ROM is fixed, 32KB
    if (adr >= 0x8000) {
      return this.prgRom[adr - 0x8000];
    }

    return 0;
  };

  this.ppuRead = function (adr) {
    // CHR ROM banking, 8KB banks
    if (adr < 0x2000) {
      return this.chrRom[this.chrBank * 0x2000 + adr];
    }

    return 0;
  };

  this.ppuWrite = function (adr, value) {
    // CHR-ROM can't be written to
    return;
  };

  this.loadRom = function (rom) {
    if (rom.valid) {
      console.log("Loading NINA-03/06 mapper ROM:", rom);
      // Load PRG-ROM
      this.prgRom = rom.prg;
      // Load CHR-ROM
      this.chrRom = rom.chr;
      // Initialize CHR bank to 0
      this.chrBank = 0;
      // Set mirroring based on ROM header
      this.h = rom.mir === 0;
      return true;
    }
    return false;
  };

  this.getSaveState = function () {
    return {
      prgRom: Array.from(this.prgRom),
      chrRom: Array.from(this.chrRom),
      chrBank: this.chrBank,
      h: this.h,
    };
  };

  this.loadSaveState = function (state) {
    this.prgRom = new Uint8Array(state.prgRom);
    this.chrRom = new Uint8Array(state.chrRom);
    this.chrBank = state.chrBank;
    this.h = state.h;
  };

  // Required mapper interface methods
  this.peak = function (adr) {
    return this.read(adr);
  };

  // Initialize state
  this.reset(true);
}

// Register the mapper
if (typeof mappers !== "undefined") {
  // Register for mapper 79 (NINA-03/06)
  mappers[79] = Nina;
  console.log("NINA-03/06 mapper (79) registered");
}
