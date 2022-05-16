import http from "http";
import "./receiver.js";
import { map } from "./shared.js";

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost:3000");

  if (req.method !== "GET") {
    res.writeHead(405, {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    });

    return res.end("Method not allowed");
  }

  const streamId = url.searchParams.get("stream_id");

  if (!streamId) {
    res.writeHead(400, {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    });

    return res.end("Missing streamId");
  }

  if (!map.has(streamId)) {
    res.writeHead(400, {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    });

    return res.end("Stream does not exists!");
  }

  res.writeHead(200, {
    "Content-Type": "audio/aac",
    "Transfer-Encoding": "chunked",
    "Cache-Control": "max-age=0, no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "Last-Modified": new Date().toUTCString(),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Origin, X-Requested-With, Content-Type, Accept",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  });

  const stream = map.get(streamId);

  stream.pipe(res);
});

server.listen(3001, () => {
  console.log("Server is listening on port 3001");
});
