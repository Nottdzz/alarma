# Autenticación Specification

## Purpose
Definir el registro, el inicio de sesión y el control de acceso de los escolares, de modo que cada usuario solo pueda consultar y modificar su propia información mediante tokens JWT y contraseñas almacenadas con hash.

## Requirements

### Requirement: Registro de usuarios
El sistema SHALL permitir registrar un usuario escolar con nombre, correo electrónico y contraseña, validando la integridad de los datos, garantizando la unicidad del correo y almacenando la contraseña mediante hash seguro.

#### Scenario: Registro exitoso
- **WHEN** el cliente envía `POST /api/auth/register` con nombre, email válido y contraseña de al menos 6 caracteres
- **THEN** el sistema persiste al usuario con la contraseña hasheada mediante `bcrypt` y factor de costo 10
- **AND** responde con código HTTP `201 Created` y un JSON con `success: true`, mensaje amigable y `data` conteniendo `id`, `nombre` y `email`
- **AND** la respuesta no incluye `password_hash` ni la contraseña en texto plano

#### Scenario: Correo electrónico duplicado
- **WHEN** el correo enviado ya existe en la tabla `usuarios`
- **THEN** el sistema responde con código HTTP `409 Conflict`
- **AND** retorna un cuerpo JSON con `success: false` y `error.code: "ERR_EMAIL_EXISTS"`
- **AND** no crea un nuevo registro en la base de datos

#### Scenario: Datos de registro inválidos
- **WHEN** falta algún campo obligatorio (`nombre`, `email`, `password`), contienen cadenas vacías tras `.trim()`, el email no tiene formato válido o la contraseña tiene menos de 6 caracteres
- **THEN** el sistema responde con código HTTP `400 Bad Request`
- **AND** retorna un cuerpo JSON con `success: false` y `error.code: "ERR_VALIDATION_DATA"`
- **AND** no crea un nuevo registro

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

### Requirement: Protección de rutas privadas
El sistema SHALL exigir el encabezado `Authorization: Bearer <JWT_TOKEN>` en todas las rutas privadas de la API y SHALL verificar la validez y vigencia del token mediante el middleware de autenticación.

#### Scenario: Token válido
- **WHEN** una petición incluye un encabezado `Authorization: Bearer <JWT_TOKEN>` con un token válido y firmado correctamente
- **THEN** el middleware de autenticación decodifica el token e inyecta la información del usuario en `req.usuario` conteniendo al menos `id` y `email`
- **AND** llama a `next()` permitiendo el paso hacia el siguiente controlador o middleware

#### Scenario: Token ausente o inválido
- **WHEN** una petición a un endpoint protegido no incluye el encabezado `Authorization`, no comienza con `"Bearer "` o el token JWT expiró o tiene firma inválida
- **THEN** el sistema responde inmediatamente con código HTTP `401 Unauthorized`
- **AND** retorna un cuerpo JSON con `success: false` y el código de error correspondiente (`ERR_NO_TOKEN` si falta el token o formato incorrecto, o `ERR_INVALID_TOKEN` si es inválido o expiró)
- **AND** no ejecuta la operación solicitada

#### Scenario: Acceso a un recurso de otro usuario
- **WHEN** un usuario autenticado intenta leer o modificar un recurso cuyo `usuario_id` es distinto al suyo
- **THEN** el sistema responde `404 Not Found`
- **AND** no revela la existencia del recurso ajeno

### Requirement: Almacenamiento seguro de credenciales
El sistema SHALL almacenar únicamente el hash de la contraseña generado con `bcrypt` y un factor de costo de 10, y SHALL escribir en SQLite mediante consultas preparadas.

#### Scenario: Contraseña nunca en texto plano
- **WHEN** se registra o actualiza una contraseña
- **THEN** la base de datos guarda únicamente el hash
- **AND** ninguna respuesta de la API devuelve la contraseña ni el hash

#### Scenario: Intento de inyección SQL en el login
- **WHEN** el cliente envía como correo o contraseña una cadena con sintaxis SQL
- **THEN** el sistema la trata como un valor literal mediante placeholders
- **AND** responde `401 Unauthorized` sin ejecutar SQL adicional

### Requirement: Sesión en el cliente
El frontend SHALL conservar el token JWT de la sesión, adjuntarlo en las peticiones protegidas y descartarlo cuando la API responda `401 Unauthorized`.

#### Scenario: Petición autenticada desde el navegador
- **WHEN** el frontend llama a un endpoint protegido
- **THEN** incluye el encabezado `Authorization: Bearer <JWT_TOKEN>`
- **AND** usa la URL base definida en `API_BASE_URL`

#### Scenario: Token expirado en el navegador
- **WHEN** una petición protegida responde `401 Unauthorized`
- **THEN** el frontend elimina el token almacenado
- **AND** redirige al usuario a la pantalla de inicio de sesión
