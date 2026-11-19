# Spec Delta

## MODIFIED Requirements

### Requirement: Inicio de sesión
El sistema SHALL autenticar al usuario comparando la contraseña recibida contra el hash almacenado en SQLite mediante `bcrypt` y SHALL emitir un token JWT que identifique al usuario en las peticiones posteriores.

#### Scenario: Credenciales válidas
- **WHEN** el cliente envía `POST /api/auth/login` con un correo y una contraseña que coinciden con el hash almacenado
- **THEN** el sistema responde con código HTTP `200 OK` y un cuerpo JSON con `success: true`
- **AND** la respuesta incluye un token JWT firmado válido por 24 horas y los datos básicos del usuario (`id`, `nombre`, `email`)
- **AND** la respuesta excluye estrictamente el campo `password_hash`

#### Scenario: Credenciales inválidas
- **WHEN** el correo no existe en la base de datos o la contraseña no coincide con el hash almacenado
- **THEN** el sistema responde con código HTTP `401 Unauthorized`
- **AND** retorna un cuerpo JSON con `success: false` y `error.code: "ERR_INVALID_CREDENTIALS"`
- **AND** no revela si el correo existe o no

#### Scenario: Campos de credenciales faltantes
- **WHEN** el cliente envía `POST /api/auth/login` sin el campo `email` o `password`, o con valores vacíos tras `.trim()`
- **THEN** el sistema responde con código HTTP `400 Bad Request`
- **AND** retorna un cuerpo JSON con `success: false` y `error.code: "ERR_MISSING_CREDENTIALS"`
