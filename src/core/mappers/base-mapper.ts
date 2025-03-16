export interface ROMHeader {
    battery: boolean;
    verticalMirroring: boolean;
    banks: number;
    chrBanks: number;
    base: number;
    chrBase: number;
    prgAnd: number;
    chrAnd: number;
}

export interface NESSystem {
    // Add NES system interface methods as needed
}

export abstract class BaseMapper {
    protected name: string;
    protected version: number;
    protected nes: NESSystem;
    protected rom: Uint8Array;
    protected header: ROMHeader;
    protected chrRam: Uint8Array;
    protected prgRam: Uint8Array;
    protected ppuRam: Uint8Array;
    protected saveVars: string[];

    constructor(nes: NESSystem, rom: Uint8Array, header: ROMHeader) {
        this.nes = nes;
        this.rom = rom;
        this.header = header;
        this.chrRam = new Uint8Array(0x2000);
        this.prgRam = new Uint8Array(0x2000);
        this.ppuRam = new Uint8Array(0x800);
        this.saveVars = ["name", "chrRam", "prgRam", "ppuRam"];
        this.reset(true);
    }

    abstract reset(hard: boolean): void;
    
    getBattery(): number[] {
        return Array.from(this.prgRam);
    }

    setBattery(data: number[]): boolean {
        if (data.length !== 0x2000) {
            return false;
        }
        this.prgRam = new Uint8Array(data);
        return true;
    }

    protected abstract getRomAdr(adr: number): number;
    protected abstract getMirroringAdr(adr: number): number;
    protected abstract getChrAdr(adr: number): number;

    peak(adr: number): number {
        return this.read(adr);
    }

    abstract read(adr: number): number;
    abstract write(adr: number, value: number): void;

    ppuPeak(adr: number): number {
        return this.ppuRead(adr);
    }

    abstract ppuRead(adr: number): number;
    abstract ppuWrite(adr: number, value: number): void;
} 