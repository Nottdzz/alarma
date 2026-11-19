# Design

## Context
Ver motivación en `proposal.md`. Actualmente el servidor Express en `/src/server.js` cuenta con `cors` y `express.json()`, pero carece del servicio de archivos estáticos para la interfaz de usuario escolar (`/public`) y no posee un pipeline estandarizado para rutas no encontradas (404) ni un manejador global de errores `(err, req, res, next)`.

## Goals / Non-Goals

**Goals:**
- Configurar `express.static('public')` en `/src/server.js`.
- Crear el módulo `/src/middlewares/errorMiddleware.js` con `notFoundHandler` y `errorHandler`.
- Estandarizar la estructura de respuesta JSON de error para cualquier fallo:
  ```json
  {
    "success": false,
    "error": {
      "code": "CODIGO_O_HTTP",
      "message": "Descripción amigable"
    }
  }
  ```
- Integrar ambos middlewares en el orden correcto en Express (al final de la pila de rutas).

**Non-Goals:**
- Middlewares de autenticación JWT o autorización de roles.
- Logging persistente en servicios externos (Datadog, Sentry, etc.).

## Decisions

### Decisión 1: Estructura del pipeline de Express
- **Elección:** Orden de ejecución explícito:
  1. `cors()`
  2. `express.json()` y `express.urlencoded()`
  3. `express.static('public')`
  4. Rutas de la API (`/api/...`)
  5. `notFoundHandler` (captura cualquier petición no resuelta por las rutas anteriores)
  6. `errorHandler` (manejador global con 4 parámetros: `(err, req, res, next)`)
- **Racional:** Es la arquitectura canónica de Express para asegurar que ningún error ni ruta no encontrada quede sin capturar.

### Decisión 2: Clase `AppError` para errores operacionales
- **Elección:** Definir y exportar una clase `AppError extends Error` con atributos `statusCode`, `code` y `message`.
- **Racional:** Permite a los controladores lanzar errores semánticos (ej. `new AppError(400, 'ERR_DATOS_INVALIDOS', 'El email es requerido')`) que el `errorHandler` procesará automáticamente sin código boilerplate redundante.

### Decisión 3: Protección de trazas en respuestas HTTP
- **Elección:** No exponer `err.stack` en el payload JSON hacia el cliente, registrándolo en consola únicamente cuando el error sea inesperado (HTTP 500).
- **Racional:** Cumple con las mejores prácticas de seguridad, evitando fuga de información interna del servidor.

## Risks / Trade-offs

- **[Riesgo: Manejador de errores no reconocido por Express]** → **Mitigación**: Respetar obligatoriamente la firma de cuatro parámetros `(err, req, res, next)` en `errorHandler`; omitir `next` provocaría que Express lo trate como un middleware ordinario.
