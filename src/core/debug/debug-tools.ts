interface CPUState {
  pc: number;
  a: number;
  x: number;
  y: number;
  sp: number;
  timestamp: number;
}

interface DisassembledInstruction {
  address: number;
  opcode: number;
  length: number;
  instruction: string;
}

interface NESSystem {
  cpu: {
    br: number[];
    r: number[];
  };
  read: (address: number) => number;
}

export class DebugTools {
  private nes: NESSystem;
  private breakpoints: Set<number>;
  private enabled: boolean;
  private cpuTrace: CPUState[];
  private maxTraceLength: number;

  constructor(nes: NESSystem) {
    this.nes = nes;
    this.breakpoints = new Set();
    this.enabled = false;
    this.cpuTrace = [];
    this.maxTraceLength = 1000;
  }

  public toggleDebug(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  public addBreakpoint(address: number): void {
    this.breakpoints.add(address);
  }

  public removeBreakpoint(address: number): void {
    this.breakpoints.delete(address);
  }

  public clearBreakpoints(): void {
    this.breakpoints.clear();
  }

  public traceCPU(): void {
    if (!this.enabled) return;
    
    const state: CPUState = {
      pc: this.nes.cpu.br[0],
      a: this.nes.cpu.r[0],
      x: this.nes.cpu.r[1],
      y: this.nes.cpu.r[2],
      sp: this.nes.cpu.r[3],
      timestamp: performance.now()
    };

    this.cpuTrace.push(state);
    if (this.cpuTrace.length > this.maxTraceLength) {
      this.cpuTrace.shift();
    }
  }

  public getMemoryDump(start: number, length: number): Uint8Array {
    const dump = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      dump[i] = this.nes.read(start + i);
    }
    return dump;
  }

  public disassemble(address: number, numInstructions: number = 1): DisassembledInstruction[] {
    const instructions: DisassembledInstruction[] = [];
    let currentAddress = address;

    for (let i = 0; i < numInstructions; i++) {
      const opcode = this.nes.read(currentAddress);
      const instruction = this.disassembleInstruction(currentAddress, opcode);
      instructions.push(instruction);
      currentAddress += instruction.length;
    }

    return instructions;
  }

  private disassembleInstruction(address: number, opcode: number): DisassembledInstruction {
    // Basic instruction disassembly
    return {
      address,
      opcode,
      length: this.getInstructionLength(opcode),
      instruction: this.formatInstruction(opcode)
    };
  }

  private getInstructionLength(opcode: number): number {
    // Simplified instruction length lookup
    // In a real implementation, this would be based on the actual 6502 instruction set
    return 1;
  }

  private formatInstruction(opcode: number): string {
    // Simplified instruction formatting
    // In a real implementation, this would format based on the actual 6502 instruction set
    return EmulatorUtils.formatHex(opcode, 2);
  }

  public getCPUTrace(): CPUState[] {
    return [...this.cpuTrace];
  }

  public clearCPUTrace(): void {
    this.cpuTrace = [];
  }

  public isBreakpointHit(address: number): boolean {
    return this.breakpoints.has(address);
  }
} 