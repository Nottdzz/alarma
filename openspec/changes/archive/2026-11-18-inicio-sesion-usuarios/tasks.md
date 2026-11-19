# Tasks

## 1. Implementación del Inicio de Sesión

- [x] 1.1 Implementar la función asíncrona `iniciarSesion(req, res, next)` en `src/controllers/authController.js` y exportarla
- [x] 1.2 Implementar validación de presencia y contenido de `email` y `password`, retornando HTTP 400 con código `ERR_MISSING_CREDENTIALS` si alguno falta o está vacío tras `.trim()`
- [x] 1.3 Implementar consulta preparada en SQLite (`SELECT id, nombre, email, password_hash FROM usuarios WHERE email = ?`) con correo normalizado a minúsculas
- [x] 1.4 Implementar verificación criptográfica con `bcrypt.compare`, respondiendo HTTP 401 con código `ERR_INVALID_CREDENTIALS` y mensaje genérico si el usuario no existe o la contraseña no coincide
- [x] 1.5 Implementar generación de token JWT con `jwt.sign` (payload `{ id, email }`, `process.env.JWT_SECRET`, expiración 24h) y retorno HTTP 200 OK con token y datos públicos del usuario
- [x] 1.6 Agregar la ruta `POST /login` en `src/routes/authRoutes.js` asociada al controlador `iniciarSesion`

## 2. Pruebas y Verificación

- [x] 2.1 Crear un script de pruebas automatizado para validar peticiones contra `POST /api/auth/login` (credenciales faltantes, usuario inexistente, contraseña incorrecta y login exitoso)
- [x] 2.2 Ejecutar las pruebas automatizadas y asegurar que los códigos HTTP (200, 400, 401), tokens JWT y esquemas JSON cumplan los estándares del proyecto
- [x] 2.3 Validar los cambios de OpenSpec con `npx openspec validate --changes`
