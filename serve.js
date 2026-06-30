/**
 * Background Noise 整合服务
 * 端口 3004 — 提供前端静态文件 + 代理 API 到 NestJS 后端（3000）
 * 供 Cloudflare Tunnel 指向使用
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3004;
const API_PORT = 3002;
const FRONTEND_DIR = path.join(__dirname, 'frontend', 'dist');

// MIME types
const MIME = {
  '.html': 'text/html;charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

function serveStatic(res, filePath) {
  const ext = path.extname(filePath);
  const isHtml = ext === '.html';
  const headers = {
    'Content-Type': MIME[ext] || 'application/octet-stream',
  };
  if (isHtml) {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA: 如果文件不存在，返回 index.html（支持前端路由）
      const indexPath = path.join(FRONTEND_DIR, 'index.html');
      fs.readFile(indexPath, (err2, indexData) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
          return;
        }
        res.writeHead(200, {
          'Content-Type': 'text/html;charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        });
        res.end(indexData);
      });
      return;
    }
    res.writeHead(200, headers);
    res.end(data);
  });
}

function proxyAPI(req, res) {
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

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Backend 服务不可用', detail: err.message }));
  });

  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  // API 请求代理到后端
  if (req.url.startsWith('/api/')) {
    proxyAPI(req, res);
    return;
  }

  // /uploads/ 也代理到后端
  if (req.url.startsWith('/uploads/')) {
    proxyAPI(req, res);
    return;
  }

  // 静态文件
  const filePath = path.join(FRONTEND_DIR, req.url === '/' ? 'index.html' : req.url);
  serveStatic(res, filePath);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Background Noise 服务已启动: http://127.0.0.1:${PORT}`);
  console.log(`   静态文件: ${FRONTEND_DIR}`);
  console.log(`   API 代理 → 127.0.0.1:${API_PORT}`);
});

process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
process.on('SIGINT', () => { server.close(() => process.exit(0)); });
