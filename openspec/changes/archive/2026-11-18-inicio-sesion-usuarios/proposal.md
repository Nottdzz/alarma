# Proposal

## Why

Para que los estudiantes escolares puedan acceder de forma autenticada a sus recursos privados (horarios semanales, alarmas, estados emocionales y notas), es indispensable proveer el servicio de inicio de sesión (`POST /api/auth/login`). Este servicio valida las credenciales frente a la base de datos SQLite mediante comparación de hash seguro con `bcrypt`, previene la enumeración de cuentas mediante respuestas de error genéricas y emite un token JWT con vigencia de 24 horas para su uso en las solicitudes protegidas subsecuentes.

## What Changes

- Implementación de la función controladora asíncrona `iniciarSesion(req, res, next)` en `src/controllers/authController.js`.
- Configuración de la ruta `POST /login` en el enrutador `src/routes/authRoutes.js`.
- Validación de campos obligatorios en `req.body`: si falta `email` o `password` (o son cadenas vacías tras `.trim()`), responder con HTTP 400 Bad Request y código `ERR_MISSING_CREDENTIALS`.
- Búsqueda del usuario en la tabla `usuarios` mediante consulta preparada parametrizada (`SELECT id, nombre, email, password_hash FROM usuarios WHERE email = ?`) con el correo normalizado a minúsculas.
- Comparación asíncrona de la contraseña recibida contra el hash almacenado mediante `bcrypt.compare(password, usuario.password_hash)`.
- Respuesta de seguridad HTTP 401 Unauthorized con código `ERR_INVALID_CREDENTIALS` y mensaje unificado ("Correo electrónico o contraseña incorrectos") tanto si el usuario no existe como si la contraseña no coincide.
- Generación y firma de token JWT con `jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET, { expiresIn: '24h' })`.
- Retorno de respuesta HTTP 200 OK con formato estándar `{ success: true, message: 'Inicio de sesión exitoso', data: { token, usuario: { id, nombre, email } } }`, excluyendo estrictamente `password_hash`.

## Capabilities

### Modified Capabilities
- `autenticacion`: Refina el requisito de `Inicio de sesión` detallando la validación previa de campos requeridos (`ERR_MISSING_CREDENTIALS`), el código estandarizado ante credenciales erróneas (`ERR_INVALID_CREDENTIALS`) y la estructura de la carga útil del token JWT con expiración de 24 horas.

## Impact

- **Archivos modificados**:
  - `src/controllers/authController.js` (exporta `iniciarSesion`)
  - `src/routes/authRoutes.js` (expone `POST /login`)
- **Dependencias**: Utiliza `bcrypt` para la verificación de hash, `jsonwebtoken` para la generación del JWT, y la instancia de base de datos de `src/config/database.js`.
