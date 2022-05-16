import { Source } from "../source";

export class AudioSource extends Source {
  public readonly audio: HTMLAudioElement;
  node!: AudioNode;

  get url() {
    return this.audio.src;
  }

  constructor() {
    super();

    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous";
  }

  setup(setupContext: { destination: GainNode; audioContext: AudioContext }) {
    this.node = setupContext.audioContext.createMediaElementSource(this.audio);
    this.node.connect(setupContext.destination);
  }

  load(url: string) {
    return new Promise<this>((resolve, reject) => {
      this.audio.addEventListener("canplay", () => resolve(this), {
        once: true,
      });
      this.audio.addEventListener("error", reject, { once: true });
      this.audio.src = url;
      this.audio.load();
    });
  }
}
