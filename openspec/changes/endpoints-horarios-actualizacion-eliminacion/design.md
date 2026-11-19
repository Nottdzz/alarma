# Design

## Context

Este cambio completa el conjunto de operaciones CRUD sobre el recurso de horarios escolares (`/api/horarios`). Con las operaciones de lectura y creación previamente implementadas, se incorporan las acciones de modificación (`PUT /api/horarios/:id`) y supresión (`DELETE /api/horarios/:id`). El sistema debe mantener la coherencia de los datos en SQLite3 y la seguridad multiusuario asegurando que ningún escolar pueda editar o borrar actividades ajenas.

Para la motivación general, véase `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Implementar las funciones asíncronas `actualizarHorario(req, res, next)` y `eliminarHorario(req, res, next)` en `src/controllers/horarioController.js`.
- Configurar las rutas protegidas `PUT /:id` y `DELETE /:id` en `src/routes/horarioRoutes.js`.
- Validar el parámetro `req.params.id`: comprobar que sea un entero positivo mayor a 0; de lo contrario, responder HTTP 400 con código `ERR_INVALID_ID`.
- En `actualizarHorario`:
  - Validar campos requeridos y formatos idénticos a la creación (`dia` 1..7, `actividad` no vacía, `hora_inicio` y `hora_fin` 24h `HH:MM`, `hora_inicio < hora_fin`), respondiendo HTTP 400 con `ERR_VALIDATION_DATA`.
  - Ejecutar `UPDATE horarios SET dia = ?, actividad = ?, hora_inicio = ?, hora_fin = ? WHERE id = ? AND usuario_id = ?`.
  - Verificar `resultado.changes`: si es `0`, responder HTTP 404 Not Found con código `ERR_HORARIO_NOT_FOUND`.
  - Responder HTTP 200 OK con el objeto horario actualizado en `data`.
- En `eliminarHorario`:
  - Ejecutar `DELETE FROM horarios WHERE id = ? AND usuario_id = ?`.
  - Verificar `resultado.changes`: si es `0`, responder HTTP 404 Not Found con código `ERR_HORARIO_NOT_FOUND`.
  - Responder HTTP 200 OK con `{ success: true, message: 'Horario eliminado correctamente', data: null }`.

**Non-Goals:**
- Modificación en lote (batch update o batch delete) de horarios.
- Manejo manual de eliminación en cascada de alarmas vinculadas (la base de datos SQLite gestiona esto automáticamente mediante `ON DELETE SET NULL`).

## Decisions

### 1. Validación reutilizable de identificador de ruta
- **Decisión**: Validar `id` verificando `const idNum = Number(req.params.id); if (!Number.isInteger(idNum) || idNum <= 0)`.
- **Rationale**: Evita inyecciones de valores inválidos (ej. texto, flotantes o números negativos) y responde de forma homogénea con `ERR_INVALID_ID`.

### 2. Aislamiento atómico mediante `WHERE id = ? AND usuario_id = ?`
- **Decisión**: Realizar el `UPDATE` o `DELETE` directamente filtrando simultáneamente por `id` y `usuario_id`.
- **Rationale**: Evita dos consultas separadas (un `SELECT` de comprobación previo seguido del `UPDATE` o `DELETE`), lo cual elimina problemas de concurrencia (TOCTOU). Si `changes === 0`, se devuelve de forma segura HTTP 404 `ERR_HORARIO_NOT_FOUND` sin revelar a un usuario la existencia de recursos pertenecientes a otros.

### 3. Preservación de alarmas
- **Decisión**: Confiar en la integridad referencial `FOREIGN KEY (horario_id) REFERENCES horarios(id) ON DELETE SET NULL` declarada en `src/config/database.js` y activada con `PRAGMA foreign_keys = ON;`.
- **Rationale**: Garantiza que al eliminar un horario escolar, cualquier alarma asociada no se pierda ni se corrompa, sino que quede desvinculada manteniendo su mensaje y hora.

## Risks / Trade-offs

- **[Riesgo] Detección de horarios ajenos como no encontrados**:
  - *Mitigación*: Es el comportamiento de seguridad intencional (HTTP 404 Not Found en lugar de HTTP 403 Forbidden) para prevenir la enumeración de identificadores de horarios ajenos.
