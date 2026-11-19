# Design

## Context

El sistema gestiona datos confidenciales y personales de estudiantes escolares. La arquitectura del backend en Node.js y Express (CommonJS) requiere un middleware de autorización que intercepte las peticiones a rutas privadas y verifique la validez de los JSON Web Tokens (JWT) generados durante la autenticación. La aplicación ya cuenta con `jsonwebtoken` instalado y con un esquema estándar de respuesta de errores gestionado en `src/middlewares/errorMiddleware.js`.

Para la motivación general, véase `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Implementar la función middleware `verificarToken` en `src/middlewares/authMiddleware.js`.
- Extraer de forma robusta el token del encabezado `Authorization` validando el esquema `Bearer <token>`.
- Diferenciar claramente los errores de autenticación con códigos específicos: `ERR_NO_TOKEN` y `ERR_INVALID_TOKEN`.
- Inyectar en `req.usuario` un objeto con `id` y `email` decodificados del token.
- Permitir la reutilización del middleware en cualquier ruta privada mediante `router.use(verificarToken)` o por endpoint individual.

**Non-Goals:**
- Implementar los controladores de login o registro (`authController.js`), que corresponden a cambios posteriores.
- Implementar listas negras de tokens o mecanismos complejos de revocación/refresh tokens.
- Proteger endpoints públicos como `/api/health` o futuras rutas de registro/login.

## Decisions

### 1. Extracción y validación del esquema Bearer
- **Decisión**: Validar que el encabezado `Authorization` exista y que su formato inicie estrictamente con el prefijo `"Bearer "`.
- **Alternativas consideradas**:
  - Extraer token de cookies: Se descarta porque la arquitectura SDD y SRS estipulan una API REST desacoplada que utiliza encabezados HTTP estándar `Authorization: Bearer <token>`.
  - Aceptar tokens en el cuerpo de la petición o query params: Se descarta por malas prácticas de seguridad y especificación REST.

### 2. Formato estandarizado de respuesta de error (HTTP 401)
- **Decisión**: En caso de ausencia o invalidez del token, retornar inmediatamente la respuesta HTTP 401 con la estructura:
  ```json
  {
    "success": false,
    "error": {
      "code": "ERR_NO_TOKEN" | "ERR_INVALID_TOKEN",
      "message": "Descripción amigable del error"
    }
  }
  ```
- **Alternativas consideradas**:
  - Lanzar un `AppError(401, ...)` y delegar en `next(error)`: Válido, pero responder directamente con `res.status(401).json(...)` asegura un corte inmediato y unívoco en el middleware sin depender del orden o configuración del pipeline de errores posterior.

### 3. Inyección limpia en `req.usuario`
- **Decisión**: Inyectar únicamente las propiedades necesarias (`id`, `email`) en `req.usuario`:
  ```javascript
  req.usuario = {
    id: decoded.id,
    email: decoded.email
  };
  ```
- **Alternativas consideradas**:
  - Asignar el payload decodificado completo (`req.usuario = decoded`): Puede arrastrar campos internos del JWT como `iat` y `exp` innecesarios para la lógica de dominio. La extracción selectiva previene acoplamiento.

## Risks / Trade-offs

- **[Riesgo] Ausencia de `JWT_SECRET` en variables de entorno**:
  - *Mitigación*: Verificar que `process.env.JWT_SECRET` tenga un valor; si no está definido, utilizar el secreto de desarrollo definido en `.env.example` o emitir una advertencia clara en logs.
- **[Riesgo] Manejo de tokens manipulados o expirados sin diferenciar**:
  - *Mitigación*: Capturar `jwt.TokenExpiredError` y `jwt.JsonWebTokenError` para emitir mensajes claros en español indicando que la sesión ha expirado o que el token no es válido, manteniendo el código `ERR_INVALID_TOKEN`.
