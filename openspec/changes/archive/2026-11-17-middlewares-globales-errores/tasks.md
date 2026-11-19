# Tasks

## 1. Middleware de Errores y Excepciones

- [x] 1.1 Implementar el archivo `/src/middlewares/errorMiddleware.js` conteniendo la clase auxiliar `AppError`, el middleware `notFoundHandler` (404) y el manejador global de excepciones `errorHandler` respetando el formato JSON `{ "success": false, "error": { "code", "message" } }`.

## 2. Configuración del Pipeline en el Servidor

- [x] 2.1 Configurar en `/src/server.js` el servicio de archivos estáticos `express.static('public')` e integrar `notFoundHandler` y `errorHandler` al final del pipeline de Express.

## 3. Verificación Operativa

- [x] 3.1 Ejecutar pruebas automatizadas que verifiquen:
  - Respuesta 404 con JSON estructurado ante rutas no registradas (ej. `GET /api/no-existe`).
  - Respuesta 500 con JSON estructurado ante excepciones no capturadas.
  - Servicio de archivos estáticos desde la carpeta `public/`.
