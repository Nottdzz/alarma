# Proposal

## Why

Para garantizar la seguridad y privacidad de la información escolar (horarios, alarmas, estado emocional y notas), el sistema requiere que las solicitudes a endpoints privados estén autenticadas mediante un JSON Web Token (JWT). Es necesario implementar un middleware reutilizable que intercepte las peticiones, extraiga y valide el token en el encabezado `Authorization`, inyecte la identidad del usuario en `req.usuario` y devuelva errores consistentes y amigables bajo el formato estándar de la API cuando el token esté ausente, corrupto o expirado.

## What Changes

- Creación del middleware de autenticación `verificarToken` en `src/middlewares/authMiddleware.js`.
- Extracción y validación estricta del encabezado `Authorization` con formato `Bearer <JWT_TOKEN>`.
- Manejo de casos de token ausente o con formato incorrecto respondiendo HTTP 401 con código de error `ERR_NO_TOKEN`.
- Verificación criptográfica del JWT utilizando `jsonwebtoken` y la variable de entorno `JWT_SECRET`.
- Manejo de tokens inválidos, expirados o manipulados respondiendo HTTP 401 con código de error `ERR_INVALID_TOKEN`.
- Inyección del payload decodificado (`id`, `email`) en el objeto de solicitud Express (`req.usuario`).
- Exportación del middleware para su integración inmediata en los enrutadores protegidos de la API.

## Capabilities

### Modified Capabilities
- `autenticacion`: Refina el requisito de `Protección de rutas privadas` especificando los códigos de error estandarizados (`ERR_NO_TOKEN` y `ERR_INVALID_TOKEN`) y los datos inyectados en `req.usuario`.

## Impact

- **Código nuevo**: `src/middlewares/authMiddleware.js`.
- **Rutas y controladores**: Las rutas protegidas importarán `verificarToken` para asegurar el acceso exclusivo a los datos de cada estudiante.
- **Dependencias**: Empleo del paquete `jsonwebtoken` (ya listado en `package.json`) y la variable de entorno `JWT_SECRET` definida en `.env`.
