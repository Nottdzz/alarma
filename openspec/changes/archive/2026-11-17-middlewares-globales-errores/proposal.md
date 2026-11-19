# Proposal

## Why
El servidor backend requiere una configuración consistente de procesamiento de entrada (CORS, análisis de cuerpos JSON y servicio de archivos estáticos para el frontend) y una capa centralizada de captura de excepciones. Sin estos middlewares, las peticiones sin ruta coincidente devuelven el HTML predeterminado de Express y los errores no capturados pueden exponer trazas internas o provocar respuestas desestructuradas que incumplen el estándar de desarrollo de la API.

## What Changes
- Configuración de `express.static('public')` en `/src/server.js` para servir la interfaz web escolar estática desde `/public`.
- Creación de `/src/middlewares/errorMiddleware.js` conteniendo:
  - `notFoundHandler`: Middleware que detecta cualquier ruta o recurso no registrado (404) y delega un error formateado hacia el manejador global.
  - `errorHandler`: Middleware global de control de excepciones `(err, req, res, next)` que estandariza las respuestas fallidas con `{ "success": false, "error": { "code": "...", "message": "..." } }`.
- Integración de ambos middlewares al final de la cadena de rutas en `/src/server.js`.

**Alcance:**
- Middlewares de entrada en `/src/server.js` (`cors`, `express.json`, `express.static`).
- Manejo de rutas no encontradas (404) y captura global de excepciones en `/src/middlewares/errorMiddleware.js`.

**Fuera del alcance:**
- Middlewares de autenticación o validación de tokens JWT (se gestionan en la capability `autenticacion`).
- Rutas específicas de recursos de la API.

## Capabilities

### New Capabilities
- `manejo-errores`: Gestión global de excepciones y rutas no encontradas (404) con respuestas estructuradas bajo el estándar JSON de error del proyecto.

### Modified Capabilities
- `servidor-base`: Se añade el servicio de archivos estáticos desde la carpeta `public/` y se enlaza el middleware global de errores al pipeline de Express.

## Impact
- **Servidor**: `/src/server.js` monta `express.static('public')`, `notFoundHandler` y `errorHandler`.
- **Respuestas**: Todas las rutas inexistentes o que generen excepciones retornarán un código HTTP acorde y el cuerpo `{ "success": false, "error": { "code", "message" } }`.
