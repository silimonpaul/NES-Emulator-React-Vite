mappers[90] = function (nes, rom, header) {
  // Changed from 11 to 90
  this.name = "Color Dreams";
  this.version = 1;

  this.nes = nes;
  this.rom = rom;
  this.h = header;

  this.chrRam = new Uint8Array(0x2000);
  this.ppuRam = new Uint8Array(0x800);
  this.prgBank = 0;
  this.chrBank = 0;

  this.getRomAdr = function (adr) {
    const bankSize = 0x4000;
    const offset = adr & 0x3fff;
    if (adr >= 0xc000) {
      return 3 * bankSize + offset;
    }
    return this.prgBank * bankSize + offset;
  };

  this.getMirroringAdr = function (adr) {
    return adr & 0x3ff;
  };

  this.getChrAdr = function (adr) {
    const bankSize = 0x2000;
    const offset = adr & 0x1fff;
    const bank = this.chrBank % this.h.chrBanks;
    return bank * bankSize + offset;
  };

  this.write = function (adr, value) {
    if (adr < 0x8000) return;

    const oldPrg = this.prgBank;
    const oldChr = this.chrBank;

    // Color Dreams/Magic Dragon register format
    this.prgBank = (value >> 4) & 0x03; // Upper 2 bits for PRG
    this.chrBank = value & 0x0f; // Lower 4 bits for CHR

    // Ensure banks are within bounds
    this.prgBank %= Math.max(1, this.h.prgBanks || 4);
    this.chrBank %= Math.max(1, this.h.chrBanks);

    if (oldPrg !== this.prgBank || oldChr !== this.chrBank) {
      log(`Bank Switch - PRG: ${this.prgBank}/3, CHR: ${this.chrBank}/7`);
    }
  };

  this.read = function (adr) {
    if (adr < 0x8000) return 0;
    const romAdr = this.h.base + this.getRomAdr(adr);
    return romAdr < this.rom.length ? this.rom[romAdr] : 0;
  };

  this.peak = function (adr) {
    return this.read(adr);
  };

  this.ppuRead = function (adr) {
    if (adr < 0x2000) {
      if (this.h.chrBanks === 0) return this.chrRam[adr];
      const chrAdr = this.h.chrBase + this.getChrAdr(adr);
      return chrAdr < this.rom.length ? this.rom[chrAdr] : 0;
    }
    return this.ppuRam[this.getMirroringAdr(adr)];
  };

  this.ppuPeak = function (adr) {
    return this.ppuRead(adr);
  };

  this.ppuWrite = function (adr, value) {
    if (adr < 0x2000) {
      if (this.h.chrBanks === 0) this.chrRam[adr] = value;
      return;
    }
    this.ppuRam[this.getMirroringAdr(adr)] = value;
  };

  this.getBattery = function () {
    return [];
  };

  this.setBattery = function (data) {
    return true;
  };

  this.reset = function (hard) {
    this.prgBank = 0;
    this.chrBank = 0;

    if (hard) {
      this.chrRam.fill(0);
      this.ppuRam.fill(0);
    }

    log("=== Color Dreams Mapper Reset ===");
    log(`PRG Banks: ${this.h.prgBanks || 4}`);
    log(`CHR Banks: ${this.h.chrBanks}`);
    log(`Current PRG Bank: ${this.prgBank}`);
    log(`Current CHR Bank: ${this.chrBank}`);
    log("===============================");
  };

  this.reset(true);
};
