import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;
const API_PORT = parseInt(process.env.PORT || '3000') + 1;

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
  '.webp': 'image/webp',
};

// Start backend API server
const backendEntry = path.join(__dirname, 'backend', 'dist', 'index.js');
if (fs.existsSync(backendEntry)) {
  const env = { ...process.env, PORT: String(API_PORT), NODE_ENV: process.env.NODE_ENV || 'production' };
  const backend = spawn('node', [backendEntry], { cwd: path.join(__dirname, 'backend'), env, stdio: 'inherit' });
  backend.on('error', (err) => console.error('Backend error:', err));
  console.log('Backend API starting on port ' + API_PORT);
}

// Proxy API requests to backend
function proxyToBackend(req, res) {
  const options = {
    hostname: '127.0.0.1',
    port: API_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${API_PORT}` },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', () => {
    res.writeHead(502);
    res.end(JSON.stringify({ error: 'Backend starting...' }));
  });

  req.pipe(proxyReq);
}

http.createServer((req, res) => {
  if (req.url.startsWith('/api/') || req.url === '/health') {
    return proxyToBackend(req, res);
  }

  let filePath = path.join(DIST, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Server on port ${PORT}, API on ${API_PORT}`));
