class NESAudioProcessor extends AudioWorkletProcessor {
  private sampleBuffer: Float32Array;
  private writeIndex: number;
  private readIndex: number;

  constructor() {
    super();
    this.sampleBuffer = new Float32Array(16384);
    this.writeIndex = 0;
    this.readIndex = 0;

    this.port.onmessage = (e: MessageEvent) => {
      const samples = e.data.samples;
      for (let i = 0; i < samples.length; i++) {
        this.sampleBuffer[this.writeIndex] = samples[i];
        this.writeIndex = (this.writeIndex + 1) % this.sampleBuffer.length;
      }
    };
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][], _parameters: Record<string, Float32Array>): boolean {
    const output = outputs[0][0];

    for (let i = 0; i < output.length; i++) {
      if (this.readIndex === this.writeIndex) {
        output[i] = 0;
        continue;
      }
      output[i] = this.sampleBuffer[this.readIndex];
      this.readIndex = (this.readIndex + 1) % this.sampleBuffer.length;
    }

    return true;
  }
}

registerProcessor('nes-audio-processor', NESAudioProcessor); 