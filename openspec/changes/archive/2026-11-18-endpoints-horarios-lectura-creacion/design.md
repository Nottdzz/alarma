# Design

## Context

El módulo de horarios escolares permite a los estudiantes estructurar sus actividades semanales. Este cambio introduce los dos primeros endpoints REST del recurso: `GET /api/horarios` (para leer la agenda de la semana o de un día específico) y `POST /api/horarios` (para añadir nuevas actividades). Toda la interacción está protegida mediante el middleware `verificarToken`, garantizando que `req.usuario.id` determine el alcance de lectura e inserción en SQLite.

Para la motivación general, véase `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Implementar las funciones asíncronas `obtenerHorarios` y `crearHorario` en `src/controllers/horarioController.js`.
- Configurar el enrutador `src/routes/horarioRoutes.js` protegiéndolo con `verificarToken`.
- Integrar las rutas en `src/server.js` bajo `/api/horarios`.
- En `obtenerHorarios`:
  - Extraer `dia` de `req.query` si está presente y validar que sea un entero entre 1 y 7 (HTTP 400 `ERR_INVALID_DAY` si es inválido).
  - Consultar en SQLite con placeholders: siempre `usuario_id = ?` (y opcionalmente `AND dia = ?`), ordenando por `dia ASC, hora_inicio ASC`.
  - Devolver HTTP 200 OK con la lista de horarios en `data`.
- En `crearHorario`:
  - Extraer `dia`, `actividad`, `hora_inicio`, `hora_fin` de `req.body`.
  - Validar campos requeridos y no vacíos (HTTP 400 `ERR_VALIDATION_DATA`).
  - Validar que `dia` sea un número entero entre 1 y 7 (HTTP 400 `ERR_VALIDATION_DATA`).
  - Validar que `hora_inicio` y `hora_fin` cumplan la expresión regular `/^([01]\d|2[0-3]):([0-5]\d)$/` (HTTP 400 `ERR_VALIDATION_DATA`).
  - Validar que `hora_inicio < hora_fin` (HTTP 400 `ERR_VALIDATION_DATA`).
  - Insertar en SQLite asociando `usuario_id` del token (ignorando cualquier `usuario_id` en `req.body`).
  - Devolver HTTP 201 Created con los datos del nuevo horario en `data`.

**Non-Goals:**
- Endpoints de edición o borrado (`PUT /:id`, `DELETE /:id`).
- Creación automática o vinculación de alarmas al horario.

## Decisions

### 1. Validación de horas de 24 horas y comparación cronológica
- **Decisión**: Usar la expresión regular `/^([01]\d|2[0-3]):([0-5]\d)$/`. Al estar garantizado el formato de 2 caracteres por bloque con ceros a la izquierda (ej. `07:30`, `14:00`), la comparación lexicográfica de cadenas `hora_inicio < hora_fin` es matemáticamente exacta y eficiente sin requerir instanciar objetos Date.
- **Alternativas consideradas**:
  - Convertir a minutos desde medianoche: Válido, pero la comparación lexicográfica de strings `HH:MM` validada produce exactamente el mismo resultado con menor sobrecarga.

### 2. Validación de parámetro de consulta `dia`
- **Decisión**: Validar que `req.query.dia` corresponda a un número entero entre 1 y 7. Si se proporciona un valor no entero o fuera de rango (ej. `0`, `8`, `abc`), responder con HTTP 400 y código `ERR_INVALID_DAY`.
- **Rationale**: Proporciona retroalimentación inequívoca a los componentes del cliente frontend cuando solicitan vistas por día específico.

### 3. Aislamiento estricto por usuario
- **Decisión**: La consulta `SELECT` y la inserción `INSERT` utilizan estrictamente `req.usuario.id`. Cualquier campo `usuario_id` enviado en el cuerpo de la petición es ignorado para evitar vulnerabilidades de asignación masiva o suplantación.

## Risks / Trade-offs

- **[Riesgo] Valores numéricos enviados como strings (ej. `dia: "2"`)**:
  - *Mitigación*: Realizar conversión segura con `const diaNum = Number(dia)` y validar que `Number.isInteger(diaNum) && diaNum >= 1 && diaNum <= 7`.
- **[Riesgo] Actividades con espacios en blanco en el nombre**:
  - *Mitigación*: Aplicar `.trim()` al campo `actividad` y rechazar strings vacíos.
