const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript',
  '.wasm': 'application/wasm',
  '.jsdos': 'application/zip',
  '.zip':  'application/zip',
  '.ico':  'image/x-icon',
  '.png':  'image/png',
  '.map':  'application/json',
};

const server = http.createServer((req, res) => {
  // Required headers for SharedArrayBuffer (WASM threads)
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Access-Control-Allow-Origin', '*');

  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);

  // Security: stay within ROOT
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404); res.end('Not found: ' + urlPath); return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Length', stat.size);
    res.writeHead(200);

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║  🕎  Haggadah Interactive Web Player  ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
  console.log(`  ➜  Local:   http://localhost:${PORT}`);
  console.log('');
  console.log('  Press Ctrl+C to stop the server.');
  console.log('');
});
