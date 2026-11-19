# Proposal

## Why

Para permitir que los estudiantes escolares utilicen el sistema de gestión de horarios, alarmas, estado emocional y notas, es fundamental contar con un mecanismo de registro seguro de cuentas de usuario. La funcionalidad de registro (`POST /api/auth/register`) valida los datos de entrada, previene correos duplicados, cifra la contraseña con `bcrypt` (factor de costo 10) y persiste la información en SQLite mediante consultas parametrizadas, devolviendo una respuesta HTTP estandarizada.

## What Changes

- Implementación de la función controladora asíncrona `registrarUsuario` en `src/controllers/authController.js`.
- Creación del enrutador de autenticación `src/routes/authRoutes.js` exponiendo la ruta `POST /register`.
- Integración de las rutas de autenticación en `src/server.js` bajo el prefijo `/api/auth`.
- Validación estricta en el controlador:
  - Presencia y contenido no vacío tras `.trim()` de `nombre`, `email` y `password`.
  - Formato sintáctico de correo electrónico mediante expresión regular.
  - Longitud mínima de contraseña de 6 caracteres.
  - Respuesta HTTP 400 con código `ERR_VALIDATION_DATA` ante fallos de validación.
- Validación de unicidad de email en la base de datos SQLite mediante consulta parametrizada (`SELECT id FROM usuarios WHERE email = ?`), respondiendo HTTP 409 con código `ERR_EMAIL_EXISTS` si ya está registrado.
- Hasheo de contraseña con `bcrypt.hash(password, 10)` e inserción en la tabla `usuarios` mediante consulta preparada.
- Respuesta HTTP 201 Created estandarizada retornando los datos públicos del nuevo usuario (`id`, `nombre`, `email`) y excluyendo `password_hash`.

## Capabilities

### Modified Capabilities
- `autenticacion`: Refina el requisito de `Registro de usuarios` especificando la validación de longitud de contraseña (mínimo 6 caracteres), códigos de error específicos (`ERR_VALIDATION_DATA` y `ERR_EMAIL_EXISTS`) y la estructura estandarizada de la respuesta 201 Created.

## Impact

- **Código nuevo/modificado**:
  - `src/controllers/authController.js` (creado)
  - `src/routes/authRoutes.js` (creado)
  - `src/server.js` (actualizado para registrar `/api/auth`)
- **Dependencias**: `bcrypt` (ya instalada), `sqlite3` (a través de `src/config/database.js`).
- **Endpoints**: `POST /api/auth/register` queda disponible para el cliente frontend.
