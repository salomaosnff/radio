import http from "http";
import { URL } from "url";
import type { Mixer } from "./mixer/mixer";

export function broadcast(stream: Mixer) {
  console.log("Connectando");

  const request = http.request(
    new URL("/?stream_id=1", "http://localhost:5000"),
    {
      method: "POST",
      headers: {
        "Content-Type": "audio/aac",
        "Transfer-Encoding": "chunked",
      },
    }
  );

  stream.pipe(request);

  request.on("error", () => setTimeout(broadcast, 1000, stream));
}
