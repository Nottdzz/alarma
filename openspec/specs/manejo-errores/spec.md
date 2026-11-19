# manejo-errores Specification

## Purpose
Centralizar la captura de excepciones no controladas y la resolución de rutas no encontradas en la aplicación Express, garantizando respuestas JSON estructuradas con formato de error uniforme.

## Requirements

### Requirement: Manejo de rutas no encontradas (404 Not Found)
El sistema SHALL interceptar cualquier petición HTTP cuya URL o método no coincida con los endpoints definidos y SHALL responder con código HTTP 404 y formato estándar de error.

#### Scenario: Petición a ruta inexistente
- **WHEN** un cliente envía una petición a un endpoint no registrado (ej. `GET /api/no-existe`)
- **THEN** el sistema responde con código HTTP 404 Not Found
- **AND** el cuerpo de la respuesta contiene `{ "success": false, "error": { "code": "ERR_NOT_FOUND", "message": "Ruta no encontrada" } }`

### Requirement: Manejador global de excepciones
El sistema SHALL capturar cualquier error síncrono o asíncrono delegado mediante `next(error)` en controladores o middlewares y SHALL responder con el código HTTP correspondiente sin filtrar trazas internas del servidor al cliente.

#### Scenario: Captura de excepción controlada
- **WHEN** un middleware o controlador delega un error con código de estado HTTP explícito (ej. 400 Bad Request)
- **THEN** el sistema responde con dicho código HTTP
- **AND** el cuerpo contiene `{ "success": false, "error": { "code": "...", "message": "..." } }`

#### Scenario: Captura de error interno del servidor (500)
- **WHEN** ocurre un error inesperado no tipificado
- **THEN** el sistema responde con código HTTP 500 Internal Server Error
- **AND** retorna un mensaje amigable con código `ERR_INTERNAL_SERVER_ERROR`
