# Spec Delta

## MODIFIED Requirements

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
