// Simple static file server for ../landing_page on http://127.0.0.1:5174
import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', 'landing_page');
const HOST = '127.0.0.1';
const PORT = 5174;

const MIME = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.map': 'application/json; charset=UTF-8',
  '.txt': 'text/plain; charset=UTF-8',
};

function safeJoin(base, target) {
  const targetPath = path.posix.normalize(target).replace(/^\/+/, '');
  return path.join(base, targetPath);
}

function send(res, status, content, headers = {}) {
  res.writeHead(status, {
    'Cache-Control': status === 200 ? 'no-cache' : 'no-store',
    'Access-Control-Allow-Origin': '*',
    ...headers,
  });
  res.end(content);
}

const server = http.createServer((req, res) => {
  try {
    const parsed = new URL(req.url, `http://${req.headers.host}`);
    let pathname = decodeURIComponent(parsed.pathname);

    if (pathname === '/') pathname = '/index.html';

    const filePath = safeJoin(ROOT, pathname);
    if (!filePath.startsWith(ROOT)) {
      send(res, 403, 'Forbidden');
      return;
    }

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        const idx = path.join(ROOT, 'index.html');
        fs.readFile(idx, (e2, buf) => {
          if (e2) return send(res, 404, 'Not Found');
          send(res, 200, buf, { 'Content-Type': MIME['.html'] });
        });
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const type = MIME[ext] || 'application/octet-stream';
      fs.readFile(filePath, (e3, buf) => {
        if (e3) return send(res, 500, 'Server Error');
        send(res, 200, buf, { 'Content-Type': type });
      });
    });
  } catch (e) {
    send(res, 500, 'Server Error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[landing] Serving ${ROOT} at http://${HOST}:${PORT}`);
});
