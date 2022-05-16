import { Source } from "../source";

export class ClockSource extends Source {
  get files() {
    const files = [];
    const now = new Date();
    let hour = now.getHours();
    const minunes = now.getMinutes();

    // normalize to 12-hour clock
    if (hour > 12) {
      hour -= 12;
    }

    if (minunes === 0) {
      files.push(`HRS${hour.toString().padStart(2, "0")}_O.mp3`);
    } else {
      files.push(`HRS${hour.toString().padStart(2, "0")}.mp3`);
      files.push(`MIN${minunes.toString().padStart(2, "0")}.mp3`);
    }

    return files;
  }

  setup(setupContext: {
    destination: GainNode;
    audioContext: AudioContext;
  }): void {
    const audios = this.files.map((file) => {
      const audio = new Audio(`/audio/hora/${file}`);
      const src = setupContext.audioContext.createMediaElementSource(audio);

      src.connect(setupContext.destination);

      return audio;
    });

    if (audios.length === 2) {
      audios[0].addEventListener("ended", () => audios[1].play());
    }

    audios
      .at(-1)
      ?.addEventListener("ended", () => this.mixer.removeChannel(this));

    audios.at(0)?.addEventListener("canplay", () => audios.at(0)?.play());
  }
}
