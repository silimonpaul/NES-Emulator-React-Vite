mappers[3] = function (nes, rom, header) {
  this.name = "CNROM";
  this.version = 1;

  this.nes = nes;
  this.rom = rom;
  this.h = header;

  this.chrRam = new Uint8Array(0x2000);
  this.ppuRam = new Uint8Array(0x800);
  this.chrBank = 0;

  this.getChrAdr = function (adr) {
    return this.chrBank * 0x2000 + (adr & 0x1fff);
  };

  this.read = function (adr) {
    if (adr < 0x8000) return 0;
    return this.rom[this.h.base + (adr & 0x7fff)];
  };

  this.peak = function (adr) {
    return this.read(adr);
  };

  this.write = function (adr, value) {
    if (adr < 0x8000) return;
    const oldChr = this.chrBank;
    this.chrBank = value & 0x03; // CNROM only uses 2 bits for CHR banking
    if (oldChr !== this.chrBank) {
      log(`CNROM CHR Bank: ${this.chrBank}`);
    }
  };

  this.ppuRead = function (adr) {
    if (adr < 0x2000) {
      const chrAdr = this.h.chrBase + this.getChrAdr(adr);
      return this.rom[chrAdr];
    }
    return this.ppuRam[adr & 0x7ff];
  };

  this.ppuPeak = function (adr) {
    return this.ppuRead(adr);
  };

  this.ppuWrite = function (adr, value) {
    if (adr < 0x2000) return; // CHR ROM can't be written to
    this.ppuRam[adr & 0x7ff] = value;
  };

  this.reset = function (hard) {
    this.chrBank = 0;
    if (hard) {
      this.chrRam.fill(0);
      this.ppuRam.fill(0);
    }
  };

  this.getBattery = function () {
    return [];
  };

  this.setBattery = function (data) {
    return true;
  };

  this.reset(true);
};
