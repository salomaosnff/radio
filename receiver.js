import http from "http";
import { map } from "./shared.js";

const server = http.createServer((req, res) => {
  const query = new URL(req.url, "http://localhost:3000").searchParams;
  const streamId = query.get("stream_id");

  if (req.method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    });

    return res.end();
  }

  if (req.method !== "POST") {
    res.writeHead(405, {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    });

    return res.end("Method not allowed");
  }

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

  if (map.has(streamId)) {
    res.writeHead(400, {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    });

    return res.end("Stream already exists");
  }

  map.set(streamId, req);

  req.on("end", () => map.delete(streamId));
});

server.listen(5000, () => console.log("Receiver started at 5000!"));
