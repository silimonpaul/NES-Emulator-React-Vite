import { NSFMapper } from './nsf-mapper';
import { NSFCPU, NSFAPU, NSFTags, NSFComponents, INSFMapper } from './interfaces';

export class NSFPlayer {
  private cpu: NSFCPU;
  private apu: NSFAPU;
  private ram: Uint8Array;
  private callArea: Uint8Array;
  private mapper: INSFMapper;

  public totalSongs: number;
  public startSong: number;
  public tags: NSFTags;
  private playReturned: boolean;
  private frameIrqWanted: boolean;
  private dmcIrqWanted: boolean;

  constructor(components: NSFComponents) {
    this.cpu = components.cpu;
    this.apu = components.apu;
    this.ram = new Uint8Array(0x800);
    this.callArea = new Uint8Array(0x10);
    this.mapper = components.mapper;
    this.totalSongs = 0;
    this.startSong = 0;
    this.tags = {
      name: "",
      artist: "",
      copyright: ""
    };
    this.playReturned = true;
    this.frameIrqWanted = false;
    this.dmcIrqWanted = false;
  }

  public loadNsf(nsf: Uint8Array): boolean {
    if (nsf.length < 0x80) {
      console.log("Invalid NSF loaded");
      return false;
    }

    if (
      nsf[0] !== 0x4e || nsf[1] !== 0x45 || nsf[2] !== 0x53 ||
      nsf[3] !== 0x4d || nsf[4] !== 0x1a
    ) {
      console.log("Invalid NSF loaded");
      return false;
    }

    if (nsf[5] !== 1) {
      console.log("Unknown NSF version: " + nsf[5]);
      return false;
    }

    this.totalSongs = nsf[6];
    this.startSong = nsf[7];
    const loadAdr = nsf[8] | (nsf[9] << 8);
    
    if (loadAdr < 0x8000) {
      console.log("Load address less than 0x8000 is not supported");
      return false;
    }

    const initAdr = nsf[0xa] | (nsf[0xb] << 8);
    const playAdr = nsf[0xc] | (nsf[0xd] << 8);

    // Parse tags
    this.tags = {
      name: this.parseString(nsf, 0xe, 32),
      artist: this.parseString(nsf, 0x2e, 32),
      copyright: this.parseString(nsf, 0x4e, 32)
    };

    // Initialize banks
    const initBanks = new Array(8).fill(0);
    let total = 0;
    for (let i = 0; i < 8; i++) {
      initBanks[i] = nsf[0x70 + i];
      total += nsf[0x70 + i];
    }
    const banking = total > 0;

    // Set up the NSF mapper
    this.mapper = new NSFMapper(nsf, loadAdr, banking, initBanks);

    // Set up the call area
    this.setupCallArea(initAdr, playAdr);

    this.playSong(this.startSong);
    console.log("Loaded NSF file");
    return true;
  }

  private parseString(data: Uint8Array, offset: number, maxLength: number): string {
    let result = "";
    for (let i = 0; i < maxLength; i++) {
      if (data[offset + i] === 0) break;
      result += String.fromCharCode(data[offset + i]);
    }
    return result;
  }

  private setupCallArea(initAdr: number, playAdr: number): void {
    this.callArea[0] = 0x20; // JSR
    this.callArea[1] = initAdr & 0xff;
    this.callArea[2] = initAdr >> 8;
    this.callArea[3] = 0xea; // NOP
    this.callArea[4] = 0xea; // NOP
    this.callArea[5] = 0xea; // NOP
    this.callArea[6] = 0xea; // NOP
    this.callArea[7] = 0xea; // NOP
    this.callArea[8] = 0x20; // JSR
    this.callArea[9] = playAdr & 0xff;
    this.callArea[10] = playAdr >> 8;
    this.callArea[11] = 0xea; // NOP
    this.callArea[12] = 0xea; // NOP
    this.callArea[13] = 0xea; // NOP
    this.callArea[14] = 0xea; // NOP
    this.callArea[15] = 0xea; // NOP
  }

  public playSong(songNum: number): void {
    // Reset RAM
    this.ram.fill(0);
    
    this.playReturned = true;
    this.apu.reset();
    this.cpu.reset();
    this.mapper.reset();
    this.frameIrqWanted = false;
    this.dmcIrqWanted = false;

    // Initialize APU registers
    for (let i = 0x4000; i <= 0x4013; i++) {
      this.apu.write(i, 0);
    }
    this.apu.write(0x4015, 0);
    this.apu.write(0x4015, 0xf);
    this.apu.write(0x4017, 0x40);

    // Run the init routine
    this.cpu.br[0] = 0x3ff0;
    this.cpu.r[0] = songNum - 1;
    this.cpu.r[1] = 0;

    // Don't allow init to take more than 10 frames
    let cycleCount = 0;
    let finished = false;
    while (cycleCount < 297800) {
      this.cpu.cycle();
      this.apu.cycle();
      if (this.cpu.br[0] === 0x3ff5) {
        finished = true;
        break;
      }
      cycleCount++;
    }

    if (!finished) {
      console.log("Init did not finish within 10 frames");
    }
  }

  public runFrame(): void {
    if (this.playReturned) {
      this.cpu.br[0] = 0x3ff8;
    }
    this.playReturned = false;

    let cycleCount = 0;
    while (cycleCount < 29780) {
      this.cpu.irqWanted = this.dmcIrqWanted || this.frameIrqWanted;
      if (!this.playReturned) {
        this.cpu.cycle();
      }
      this.apu.cycle();
      if (this.cpu.br[0] === 0x3ffd) {
        this.playReturned = true;
      }
      cycleCount++;
    }
  }

  public getSamples(data: Float32Array, count: number): void {
    const output = this.apu.getOutput();
    const runAdd = 29780 / count;
    let inputPos = 0;
    let running = 0;

    for (let i = 0; i < count; i++) {
      running += runAdd;
      let total = 0;
      const avgCount = running & 0xffff;
      for (let j = inputPos; j < inputPos + avgCount && j < output.buffer.length; j++) {
        total += output.buffer[j];
      }
      data[i] = total / avgCount;
      inputPos += avgCount;
      running -= avgCount;
    }
  }

  public read(adr: number): number {
    adr &= 0xffff;

    if (adr < 0x2000) {
      return this.ram[adr & 0x7ff];
    }
    if (adr < 0x3ff0) {
      return 0;
    }
    if (adr < 0x4000) {
      return this.callArea[adr & 0xf];
    }
    if (adr < 0x4020) {
      if (adr === 0x4014 || adr === 0x4016 || adr === 0x4017) {
        return 0;
      }
      return this.apu.read(adr);
    }
    return this.mapper.read(adr);
  }

  public write(adr: number, value: number): void {
    adr &= 0xffff;

    if (adr < 0x2000) {
      this.ram[adr & 0x7ff] = value;
      return;
    }
    if (adr < 0x4000) {
      return;
    }
    if (adr < 0x4020) {
      if (adr === 0x4014 || adr === 0x4016) {
        return;
      }
      this.apu.write(adr, value);
      return;
    }
    this.mapper.write(adr, value);
  }
} 