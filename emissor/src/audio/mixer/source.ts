import type { Mixer } from "./mixer";

export abstract class Source {
  protected mixer!: Mixer;
  destination!: GainNode;

  _muted = false;
  _volume = 1;

  abstract setup(setupContext: {
    destination: GainNode;
    audioContext: AudioContext;
  }): void;

  get muted() {
    return this._muted;
  }

  set muted(value: boolean) {
    this._muted = value;

    this.destination.gain.value = value ? 0 : this._volume;
  }

  get volume() {
    return this._volume;
  }

  set volume(value: number) {
    value = Math.max(0, Math.min(1, value));
    this._muted = value <= 0;
    this._volume = value;

    this.destination.gain.value = value;
  }
}
