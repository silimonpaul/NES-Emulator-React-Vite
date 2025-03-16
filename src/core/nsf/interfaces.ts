export interface NSFCPU {
  cycle(): void;
  reset(): void;
  br: number[];
  r: number[];
  irqWanted: boolean;
}

export interface NSFAudioOutput {
  buffer: Float32Array;
  sampleRate: number;
}

export interface NSFAPU {
  cycle(): void;
  reset(): void;
  read(address: number): number;
  write(address: number, value: number): void;
  getOutput(): NSFAudioOutput;
}

export interface INSFMapper {
  reset(): void;
  read(address: number): number;
  write(address: number, value: number): void;
}

export interface NSFTags {
  name: string;
  artist: string;
  copyright: string;
}

export interface NSFComponents {
  cpu: NSFCPU;
  apu: NSFAPU;
  mapper: INSFMapper;
} 