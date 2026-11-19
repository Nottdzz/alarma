# Design

## Context

El inicio de sesión permite autenticar a los estudiantes escolares que previamente registraron su cuenta. El backend en Express y CommonJS cuenta con el middleware `verificarToken` para proteger rutas privadas, por lo que el endpoint `POST /api/auth/login` debe emitir un token JWT firmado compatible con dicho middleware. Se debe garantizar la seguridad de la autenticación mediante comparación asíncrona de hash con `bcrypt` y mitigar la enumeración de cuentas.

Para la motivación general, véase `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Implementar la función asíncrona `iniciarSesion(req, res, next)` en `src/controllers/authController.js`.
- Configurar y exponer la ruta `POST /login` en `src/routes/authRoutes.js`.
- Validar la presencia y contenido no vacío de `email` y `password`, retornando HTTP 400 y código `ERR_MISSING_CREDENTIALS` ante omisiones.
- Normalizar el email (`.trim().toLowerCase()`) y consultar la tabla `usuarios` mediante `get('SELECT id, nombre, email, password_hash FROM usuarios WHERE email = ?', [emailNormalizado])`.
- Evaluar las credenciales con `bcrypt.compare(password, usuario.password_hash)`.
- Responder con HTTP 401 y código `ERR_INVALID_CREDENTIALS` de forma unificada si el usuario no existe o si la contraseña no coincide.
- Firmar un token JWT con payload `{ id: usuario.id, email: usuario.email }` usando `process.env.JWT_SECRET` y expiración en 24 horas (`{ expiresIn: '24h' }`).
- Responder HTTP 200 OK con el token y los datos básicos del usuario (`id`, `nombre`, `email`), garantizando que `password_hash` nunca sea devuelto.

**Non-Goals:**
- Implementar recuperación o reseteo de contraseña (fuera del alcance actual).
- Implementar bloqueo temporal de cuenta o mecanismos de captcha tras múltiples intentos fallidos.

## Decisions

### 1. Mitigación de enumeración de usuarios
- **Decisión**: Unificar la respuesta HTTP 401 tanto cuando el correo no existe en la base de datos como cuando la contraseña es errónea, devolviendo exactamente el mismo código `ERR_INVALID_CREDENTIALS` y mensaje: *"Correo electrónico o contraseña incorrectos"*.
- **Rationale**: Evita que atacantes o terceros descubran qué correos de estudiantes están registrados en el sistema.

### 2. Duración y payload del token JWT
- **Decisión**: Emitir tokens con expiración de 24 horas (`24h`) y payload conteniendo únicamente `id` y `email`.
- **Rationale**: 24 horas cubre adecuadamente la sesión escolar diaria sin requerir refresh tokens complejos en el frontend, y coincide exactamente con lo esperado por `authMiddleware.js`.

### 3. Respuestas y manejo de errores
- **Decisión**: Formato de respuesta JSON estandarizado:
  - Error 400: `{ "success": false, "error": { "code": "ERR_MISSING_CREDENTIALS", "message": "..." } }`.
  - Error 401: `{ "success": false, "error": { "code": "ERR_INVALID_CREDENTIALS", "message": "..." } }`.
  - Éxito 200: `{ "success": true, "message": "Inicio de sesión exitoso", "data": { "token": "...", "usuario": { "id", "nombre", "email" } } }`.

## Risks / Trade-offs

- **[Riesgo] Ausencia de `JWT_SECRET` en producción**:
  - *Mitigación*: Utilizar `process.env.JWT_SECRET || 'supersecretkey'`, consistente con la configuración de `authMiddleware.js` y `.env.example`.
- **[Riesgo] Exposición accidental del campo `password_hash`**:
  - *Mitigación*: La construcción del objeto `usuario` en la respuesta 200 se realiza por asignación explícita de campos públicos (`id`, `nombre`, `email`).
