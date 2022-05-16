import { readFile } from "fs/promises";
import http2 from "http2";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const certDir = path.join(dirname(fileURLToPath(import.meta.url)), "cert");

const [key, cert] = await Promise.all([
  readFile(path.join(certDir, "server.key")),
  readFile(path.join(certDir, "server.cert")),
]);

const server = http2.createSecureServer({ key, cert });

server.on("stream", (stream, headers) => {
  // stream is a Duplex
  stream.respond({
    "content-type": "text/html; charset=utf-8",
    ":status": 200,
  });

  stream.pushStream(
    {
      [http2.constants.HTTP2_HEADER_PATH]: "/index.css",
      [http2.constants.HTTP2_HEADER_CONTENT_TYPE]: "text/css",
    },
    (err, stream) => {
      stream.end("html, body { background-color: #111; color: #fff; }");
    }
  );

  stream.end(`
    
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Hello</title>
        <link rel="stylesheet" href="/index.css">
      </head>
      <body>
        <h1>Hello</h1>
        <p>
          <a href="/">Home</a>
        </p>
      </body>
    </html>
  `);
});

server.listen(8080, () => console.log("Server started at 8080!"));
