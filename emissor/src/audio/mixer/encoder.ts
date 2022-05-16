import { spawn } from "child_process";

class PTModuleProcessor
  extends AudioWorkletProcessor
  implements AudioWorkletProcessorImpl
{
  ffmpeg = spawn("ffmpeg", [
    "-nostats",
    "-loglevel",
    "0",
    // Formato de entrada (RAW Float32 Little Endian)
    "-f",
    "f32le",

    // Quantidade de canais de entrada
    "-ac",
    "2",

    // Sample rate de entrada
    "-r",
    "44100",

    // Arquivo de entrada (pipe)
    "-i",
    "pipe:0",

    // Utilizar o codec de audio aac
    "-codec:a",
    "aac",

    // Utilizar o formato adts
    "-f",
    "adts",

    // Define o bitrate do arquivo de saída
    "-b:a",
    "96k",

    "-compression_level",
    "10",

    // Arquivo de saída (pipe)
    "pipe:1",
  ]);

  constructor() {
    super();

    this.ffmpeg.stdout.on("data", (data) => {
      this.port.postMessage({
        type: "data",
        data: data,
      });
    });
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][]
    // parameters: Record<string, Float32Array>
  ): boolean {
    inputs.forEach((input, i) => {
      if (!input.length) return true;
      const result = new Float32Array(input.length * input[0].length);

      input.forEach((channel, c) => {
        outputs[i][c].set(channel);

        channel.forEach((value, v) => {
          result[v * input.length + c] = value;
        });
      });

      const resultBuffer = Buffer.from(result.buffer);

      this.ffmpeg.stdin.write(resultBuffer);
    });

    return true;
  }
}

// you also need to register your class so that it can be intanciated from the main thread
registerProcessor("encoder", PTModuleProcessor);
