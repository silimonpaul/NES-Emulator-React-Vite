import { INSFMapper } from './interfaces';

export class NSFMapper implements INSFMapper {
  private rom: Uint8Array;
  private loadAddress: number;
  private banking: boolean;
  private banks: number[];

  constructor(nsf: Uint8Array, loadAddress: number, banking: boolean, initBanks: number[]) {
    // Skip the 128-byte header
    this.rom = new Uint8Array(nsf.length - 0x80);
    for (let i = 0; i < this.rom.length; i++) {
      this.rom[i] = nsf[i + 0x80];
    }

    this.loadAddress = loadAddress;
    this.banking = banking;
    this.banks = [...initBanks];
  }

  public reset(): void {
    // No reset functionality needed for NSF mapper
  }

  public read(address: number): number {
    address &= 0xffff;

    if (address < 0x8000) {
      return 0;
    }

    if (!this.banking) {
      const offset = address - this.loadAddress;
      if (offset >= 0 && offset < this.rom.length) {
        return this.rom[offset];
      }
      return 0;
    }

    // Handle banked memory
    const bank = Math.floor((address - 0x8000) / 0x1000);
    if (bank >= 0 && bank < 8) {
      const bankNumber = this.banks[bank];
      const offset = bankNumber * 0x1000 + (address & 0xfff);
      if (offset < this.rom.length) {
        return this.rom[offset];
      }
    }

    return 0;
  }

  public write(address: number, value: number): void {
    address &= 0xffff;

    if (address < 0x8000 || !this.banking) {
      return;
    }

    // Update bank number
    const bank = Math.floor((address - 0x8000) / 0x1000);
    if (bank >= 0 && bank < 8) {
      this.banks[bank] = value;
    }
  }
} 