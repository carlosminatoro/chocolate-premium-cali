const path = require('path');
const fs = require('fs');
const http = require('http');

const PORT = process.env.PORT || 3000;

// Intentar usar Express si está instalado
let useExpress = false;
try {
  const express = require('express');
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Prevenir cache agresivo en navegadores móviles
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    next();
  });

  // Servir archivos estáticos
  app.use(express.static(path.join(__dirname)));

  // Endpoint Webhook
  app.post('/webhook', (req, res) => {
    console.log('🔔 [Webhook Recibido]:', JSON.stringify(req.body, null, 2));
    res.status(200).json({ status: 'success', message: 'Webhook recibido correctamente' });
  });

  // Healthcheck
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
  });

  // Fallback SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`👑 Cacao Imperial (Express) activo en puerto ${PORT}`);
  });

  useExpress = true;
} catch (err) {
  useExpress = false;
}

// Servidor nativo Node.js en caso de no tener node_modules instalados
if (!useExpress) {
  const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.opus': 'audio/ogg'
  };

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let pathname = decodeURIComponent(url.pathname);

    // Endpoint Webhook (POST)
    if (pathname === '/webhook' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          console.log('🔔 [Webhook Recibido]:', body ? JSON.parse(body) : {});
        } catch(e) {
          console.log('🔔 [Webhook Recibido (raw)]:', body);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', message: 'Webhook recibido correctamente' }));
      });
      return;
    }

    // Endpoint Health Check (GET)
    if (pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
      return;
    }

    if (pathname === '/') {
      pathname = '/index.html';
    }

    let filePath = path.join(__dirname, pathname);

    // Evitar Directory Traversal
    if (!filePath.startsWith(__dirname)) {
      res.writeHead(403);
      res.end('Acceso denegado');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Fallback a index.html
        filePath = path.join(__dirname, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (readErr, content) => {
        if (readErr) {
          res.writeHead(500);
          res.end('Error interno del servidor');
          return;
        }
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        res.end(content);
      });
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`👑 Cacao Imperial (Native HTTP) activo en puerto ${PORT}`);
  });
}
