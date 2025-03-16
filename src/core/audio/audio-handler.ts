export class AudioHandler {
  private actx: AudioContext | null;
  private audioNode: AudioWorkletNode | null;
  private scriptNode: ScriptProcessorNode | null;
  private gainNode: GainNode | null;
  private limiter: DynamicsCompressorNode | null;
  private inputBuffer: Float32Array;
  private inputBufferPos: number;
  private inputReadPos: number;
  public sampleBuffer: Float32Array;
  public samplesPerFrame: number;
  public hasAudio: boolean;

  constructor() {
    this.hasAudio = true;
    this.actx = null;
    this.audioNode = null;
    this.scriptNode = null;
    this.gainNode = null;
    this.limiter = null;
    this.inputBuffer = new Float32Array(16384);
    this.inputBufferPos = 0;
    this.inputReadPos = 0;
    this.sampleBuffer = new Float32Array(735);
    this.samplesPerFrame = 735;

    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      console.log("Audio disabled: no Web Audio API support");
      this.hasAudio = false;
      return;
    }

    try {
      this.actx = new AudioContext({
        latencyHint: "interactive",
        sampleRate: 44100,
      });

      const samples = this.actx.sampleRate / 60;
      this.sampleBuffer = new Float32Array(samples);
      this.samplesPerFrame = samples;

      // Modern audio worklet setup
      this.setupAudioWorklet();

      // Audio graph setup
      this.gainNode = this.actx.createGain();
      this.gainNode.gain.value = 0.5;

      // Modern dynamics processing
      this.limiter = this.actx.createDynamicsCompressor();
      this.limiter.threshold.value = -0.5;
      this.limiter.knee.value = 0;
      this.limiter.ratio.value = 20.0;
      this.limiter.attack.value = 0.005;
      this.limiter.release.value = 0.05;

      this.gainNode.connect(this.limiter);
      this.limiter.connect(this.actx.destination);

      console.log("Audio initialized, sample rate: " + this.actx.sampleRate);
    } catch (e) {
      console.log("Audio initialization failed: " + (e as Error).message);
      this.hasAudio = false;
    }
  }

  private async setupAudioWorklet(): Promise<void> {
    if (!this.actx) return;

    try {
      await this.actx.audioWorklet.addModule("js/audio-worklet.js");
      this.audioNode = new AudioWorkletNode(this.actx, "nes-audio-processor", {
        outputChannelCount: [1],
        processorOptions: {
          sampleRate: this.actx.sampleRate,
        },
      });
      this.audioNode.connect(this.gainNode!);
    } catch (e) {
      console.log("AudioWorklet setup failed, falling back to ScriptProcessor");
      this.setupScriptProcessor();
    }
  }

  private setupScriptProcessor(): void {
    if (!this.actx || !this.gainNode) return;

    this.inputBuffer = new Float32Array(16384);
    this.inputBufferPos = 0;
    this.inputReadPos = 0;

    this.scriptNode = this.actx.createScriptProcessor(2048, 0, 1);
    this.scriptNode.onaudioprocess = (e: AudioProcessingEvent) => {
      const output = e.outputBuffer.getChannelData(0);
      const bufferSize = this.inputBuffer.length;

      for (let i = 0; i < output.length; i++) {
        if (this.inputReadPos >= this.inputBufferPos) {
          output[i] = 0;
          continue;
        }
        output[i] = this.inputBuffer[this.inputReadPos % bufferSize];
        this.inputReadPos++;
      }
    };
    this.scriptNode.connect(this.gainNode);
  }

  public async resume(): Promise<void> {
    if (!this.hasAudio || !this.actx) return;
    try {
      await this.actx.resume();
    } catch (e) {
      console.log("Error resuming audio: " + (e as Error).message);
    }
  }

  public start(): void {
    if (!this.hasAudio) return;
    this.resume();
  }

  public stop(): void {
    if (!this.hasAudio) return;
    if (this.scriptNode) {
      this.scriptNode.disconnect();
    }
    if (this.audioNode) {
      this.audioNode.disconnect();
    }
    this.setVolume(0);
  }

  public setVolume(value: number): void {
    if (this.gainNode && this.actx) {
      this.gainNode.gain.setValueAtTime(
        Math.max(0, Math.min(1, value)),
        this.actx.currentTime
      );
    }
  }

  public nextBuffer(): void {
    if (!this.hasAudio) return;

    if (this.audioNode) {
      this.audioNode.port.postMessage({
        samples: this.sampleBuffer,
      });
    } else if (this.scriptNode) {
      const bufferSize = this.inputBuffer.length;
      for (let i = 0; i < this.samplesPerFrame; i++) {
        this.inputBuffer[this.inputBufferPos % bufferSize] = this.sampleBuffer[i];
        this.inputBufferPos++;
      }
    }
  }
}

// Add AudioContext type augmentation for older browsers
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
} 