# Design

## Context

El registro de usuarios es el punto de entrada para que los escolares comiencen a gestionar sus horarios, alarmas, emociones y notas. La persistencia se basa en SQLite3 con consultas parametrizadas implementadas en `src/config/database.js` (`get`, `run`). La seguridad de contraseñas exige el uso de `bcrypt` con un factor de coste 10. Las respuestas del servidor deben adherirse a las convenciones de JSON estandarizado del proyecto.

Para la motivación general, véase `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Implementar la función controladora asíncrona `registrarUsuario` en `src/controllers/authController.js`.
- Configurar el enrutador Express `src/routes/authRoutes.js` y montar `POST /register`.
- Integrar el enrutador en `src/server.js` bajo `/api/auth`.
- Validar exhaustivamente la entrada:
  - `nombre`, `email` y `password` requeridos y no vacíos tras `.trim()`.
  - Formato válido de email según expresión regular estándar.
  - Longitud de contraseña de al menos 6 caracteres.
- Verificar duplicidad de email consultando `usuarios` mediante `get('SELECT id FROM usuarios WHERE email = ?', [emailNormalizado])`.
- Generar el hash con `bcrypt.hash(password, 10)`.
- Insertar el registro con `run('INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)', [nombre, emailNormalizado, passwordHash])`.
- Responder HTTP 201 Created con el formato estándar `{ success: true, message: 'Usuario registrado correctamente', data: { id, nombre, email } }`.

**Non-Goals:**
- Implementar el inicio de sesión (`POST /api/auth/login`), el cual se abordará en su respectivo cambio.
- Envío de correos de confirmación o verificación por doble factor (fuera del alcance escolar del MVP).

## Decisions

### 1. Validación temprana y códigos de error unificados
- **Decisión**: Validar los campos en el cuerpo de la petición antes de cualquier operación en la base de datos. Si falta algún dato o no cumple el formato, responder con HTTP 400 y código `ERR_VALIDATION_DATA`.
- **Alternativas consideradas**:
  - Códigos específicos por cada campo individual (`ERR_MISSING_NAME`, `ERR_INVALID_PASSWORD`): Se descarta para mantener simplicidad y consistencia en la capa cliente, proporcionando un mensaje descriptivo en `message`.

### 2. Normalización de correo electrónico
- **Decisión**: Aplicar `.trim().toLowerCase()` al campo `email` antes de consultar y persistir.
- **Rationale**: Evita duplicados accidentales por mayúsculas o espacios accidentales introducidos en el cliente escolar.

### 3. Factor de costo de `bcrypt` y protección ante condiciones de carrera
- **Decisión**: Usar factor de costo 10 (`bcrypt.hash(password, 10)`). Capturar errores de restricción `SQLITE_CONSTRAINT` (código de error SQLite de unicidad) dentro del `catch` para asegurar que incluso ante solicitudes concurrentes idénticas se retorne HTTP 409 `ERR_EMAIL_EXISTS`.

## Risks / Trade-offs

- **[Riesgo] Concurrencia en inserción de correos iguales**:
  - *Mitigación*: La columna `email` en la tabla `usuarios` tiene la restricción `UNIQUE`. El bloque `catch` del controlador detecta si el error corresponde a una violación de unicidad de SQLite y responde con HTTP 409 `ERR_EMAIL_EXISTS`.
- **[Riesgo] Filtración de `password_hash` en la respuesta**:
  - *Mitigación*: La respuesta 201 construye explícitamente el objeto `data` únicamente con `{ id, nombre, email }`, garantizando que ninguna información sensible sea serializada.
