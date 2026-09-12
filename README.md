# Cacao Imperial & Jabonería Botánica — Landing Page (Cali)

Landing page de alta conversión para venta de chocolatería fina al 80% y jabones botánicos con **Pago Contra Entrega en Cali**, efectos de parallax e integración a WhatsApp.

## 🚀 Despliegue en Railway

Esta aplicación está configurada para desplegarse automáticamente en [Railway](https://railway.app) en 2 sencillos pasos:

1. **Crear nuevo servicio en Railway:**
   - Entra a tu dashboard en Railway.
   - Haz clic en **+ New** > **GitHub Repo**.
   - Selecciona el repositorio `krmito/chocolate-premium-cali`.
2. **Generar dominio público:**
   - Una vez desplegado, ve a la pestaña **Settings** del servicio en Railway.
   - En la sección **Networking**, haz clic en **Generate Domain**.
   - ¡Listo! Tu página estará disponible públicamente con HTTPS y certificado SSL automático.

## 🔔 Soporte de Webhooks

El servidor incluye un endpoint `/webhook` (`POST`) para conectar servicios externos (pasarelas, bots de WhatsApp, Make/Zapier o sistemas CRM):

- **URL del Webhook:** `https://tu-dominio.railway.app/webhook`
- **Método:** `POST`
- **Body:** JSON

## 🛠️ Ejecución Local

```bash
npm install
npm start
```
El servidor se iniciará en `http://localhost:3000`.
