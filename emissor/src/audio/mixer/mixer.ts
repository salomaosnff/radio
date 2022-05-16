import { Readable } from "stream";
import type { Source } from "./source";
import workletUrl from "./encoder?url";

export class Mixer extends Readable {
  ctx = new AudioContext({
    sampleRate: 44100,
    latencyHint: "playback",
  });

  channels = new WeakMap<Source, GainNode>();

  static init() {
    return new Mixer().init();
  }

  encoder!: AudioWorkletNode;

  private _returnPlayback = false;

  get returnPlayback() {
    return this._returnPlayback;
  }

  set returnPlayback(value: boolean) {
    this._returnPlayback = value;

    if (value) {
      this.connect();
    } else {
      this.disconnect();
    }
  }

  connect() {
    this.encoder.connect(this.ctx.destination);
  }

  disconnect() {
    this.encoder.disconnect();
  }

  _read() {
    return;
  }

  async init() {
    await this.ctx.audioWorklet.addModule(workletUrl);
    this.encoder = new AudioWorkletNode(this.ctx, "encoder", {
      channelCount: 2,
    });

    this.encoder.port.onmessage = (e: MessageEvent) => {
      if (e.data.type === "data") {
        this.push(e.data.data);
      }
    };

    return this;
  }

  add(channel: Source) {
    channel.destination = this.ctx.createGain();

    channel.destination.gain.value = channel.muted ? 0 : channel.volume;

    channel.setup({
      audioContext: this.ctx,
      destination: channel.destination,
    });

    channel.destination.connect(this.encoder);

    this.channels.set(channel, channel.destination);
  }

  removeChannel(channel: Source) {
    const destination = this.channels.get(channel);

    if (destination) {
      destination.disconnect();
      this.channels.delete(channel);
    }
  }

  toMediaStream() {
    return new ReadableStream({
      start: (controller) => {
        this.on("data", (data) => controller.enqueue(data));
      },
    });
  }
}
