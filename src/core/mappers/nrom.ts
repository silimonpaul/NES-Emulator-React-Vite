import { BaseMapper, NESSystem, ROMHeader } from './base-mapper';

export class NROM extends BaseMapper {
    constructor(nes: NESSystem, rom: Uint8Array, header: ROMHeader) {
        super(nes, rom, header);
        this.name = "NROM";
        this.version = 1;
    }

    reset(hard: boolean): void {
        if (hard) {
            // clear chr ram
            this.chrRam.fill(0);
            
            // clear prg ram, only if not battery backed
            if (!this.header.battery) {
                this.prgRam.fill(0);
            }
            
            // clear ppu ram
            this.ppuRam.fill(0);
        }
    }

    protected getRomAdr(adr: number): number {
        if (this.header.banks === 2) {
            return adr & 0x7fff;
        }
        return adr & 0x3fff;
    }

    protected getMirroringAdr(adr: number): number {
        if (this.header.verticalMirroring) {
            return adr & 0x7ff;
        } else {
            // horizontal
            return (adr & 0x3ff) | ((adr & 0x800) >> 1);
        }
    }

    protected getChrAdr(adr: number): number {
        return adr;
    }

    read(adr: number): number {
        if (adr < 0x6000) {
            return 0; // not readable
        }
        if (adr < 0x8000) {
            return this.prgRam[adr & 0x1fff];
        }
        return this.rom[this.header.base + this.getRomAdr(adr)];
    }

    write(adr: number, value: number): void {
        if (adr < 0x6000 || adr >= 0x8000) {
            return; // no mapper registers
        }
        this.prgRam[adr & 0x1fff] = value;
    }

    ppuRead(adr: number): number {
        if (adr < 0x2000) {
            if (this.header.chrBanks === 0) {
                return this.chrRam[this.getChrAdr(adr)];
            } else {
                return this.rom[this.header.chrBase + this.getChrAdr(adr)];
            }
        } else {
            return this.ppuRam[this.getMirroringAdr(adr)];
        }
    }

    ppuWrite(adr: number, value: number): void {
        if (adr < 0x2000) {
            if (this.header.chrBanks === 0) {
                this.chrRam[this.getChrAdr(adr)] = value;
                return;
            }
            // not writable if chrBanks > 0
            return;
        }
        this.ppuRam[this.getMirroringAdr(adr)] = value;
    }
} 