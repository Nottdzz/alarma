# Proposal

## Why

Para que los estudiantes escolares puedan gestionar su rutina semanal en la plataforma, es necesario implementar los endpoints protegidos de consulta (`GET /api/horarios`) y creación (`POST /api/horarios`). Estos servicios deben asegurar el aislamiento multiusuario asignando y filtrando las actividades exclusivamente por el `usuario_id` decodificado del JWT, validando estrictamente los días de la semana (1 a 7), el formato de hora de 24 horas (`HH:MM`) y el orden temporal (`hora_inicio < hora_fin`).

## What Changes

- Creación del archivo de controladores `src/controllers/horarioController.js` con:
  - `obtenerHorarios(req, res, next)`: Consulta de actividades del usuario autenticado (`req.usuario.id`), con soporte para filtro opcional por `dia` (validando rango 1 a 7 con código `ERR_INVALID_DAY`), y ordenadas ascendentemente por `dia ASC, hora_inicio ASC`.
  - `crearHorario(req, res, next)`: Validación de entrada (`dia`, `actividad`, `hora_inicio`, `hora_fin`), asegurando formato 24 horas `HH:MM` mediante expresión regular, validación de que `hora_inicio < hora_fin`, prevención de datos vacíos (código `ERR_VALIDATION_DATA`), e inserción parametrizada en SQLite retornando HTTP 201 Created.
- Creación del enrutador `src/routes/horarioRoutes.js` con las rutas `GET /` y `POST /`, protegido globalmente mediante `verificarToken`.
- Integración del enrutador de horarios en `src/server.js` bajo el prefijo `/api/horarios`.

## Capabilities

### Modified Capabilities
- `gestion-horarios`: Refina los requisitos `Crear actividad del horario` y `Consultar horarios` detallando la validación del filtro `dia` con código `ERR_INVALID_DAY`, el regex estricto para formato de 24 horas `HH:MM`, y el ordenamiento por `dia ASC, hora_inicio ASC`.

## Impact

- **Código nuevo**:
  - `src/controllers/horarioController.js`
  - `src/routes/horarioRoutes.js`
- **Código modificado**:
  - `src/server.js` (montaje de `/api/horarios`)
- **Dependencias**: Utiliza `src/config/database.js` (`get`, `all`, `run`) y `src/middlewares/authMiddleware.js` (`verificarToken`).
