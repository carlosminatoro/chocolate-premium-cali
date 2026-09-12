const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para procesar JSON (para webhooks)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (HTML, CSS, JS, imágenes)
app.use(express.static(path.join(__dirname)));

// Endpoint para Webhook (recepción de eventos o confirmaciones)
app.post('/webhook', (req, res) => {
  console.log('🔔 [Webhook Recibido]:', JSON.stringify(req.body, null, 2));
  // Responder con éxito para confirmar recepción de webhook
  res.status(200).json({ status: 'success', message: 'Webhook recibido correctamente' });
});

// Endpoint de salud (Health check para Railway)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Ruta principal y fallback para SPA/Landing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`👑 Cacao Imperial Web Server activo en el puerto ${PORT}`);
});
