# Tasks

## 1. Implementación del Middleware de Autenticación

- [x] 1.1 Crear el archivo `src/middlewares/authMiddleware.js` e implementar la función middleware `verificarToken`
- [x] 1.2 Implementar la extracción del encabezado `Authorization` y validar el formato `Bearer <JWT_TOKEN>`, respondiendo HTTP 401 con código `ERR_NO_TOKEN` si no se cumple
- [x] 1.3 Implementar la verificación del token con `jsonwebtoken` (`jwt.verify`) y `process.env.JWT_SECRET`, capturando errores de expiración o firma inválida y respondiendo HTTP 401 con código `ERR_INVALID_TOKEN`
- [x] 1.4 Inyectar el contexto del usuario (`id`, `email`) en `req.usuario` y permitir la continuación del flujo mediante `next()`
- [x] 1.5 Exportar `verificarToken` mediante CommonJS (`module.exports = { verificarToken }`) para su uso en rutas privadas

## 2. Pruebas y Verificación

- [x] 2.1 Crear un script de pruebas temporales para simular peticiones con Express probando token válido, token ausente, formato inválido, token expirado y firma incorrecta
- [x] 2.2 Ejecutar las pruebas automatizadas y asegurar que los códigos HTTP y payloads JSON coinciden con el estándar del proyecto
- [x] 2.3 Validar la especificación con `npx openspec validate --changes`
