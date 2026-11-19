# Proposal

## Why

Para que los estudiantes escolares puedan mantener al día su agenda académica y personal, es necesario completar las operaciones de actualización (`PUT /api/horarios/:id`) y eliminación (`DELETE /api/horarios/:id`) del módulo de horarios. Estas operaciones deben garantizar la validación rigurosa del identificador (`id`), aplicar las restricciones de negocio a los datos actualizados, proteger la privacidad multiusuario verificando la titularidad del horario antes de modificarlo o borrarlo, y preservar la integridad referencial hacia las alarmas vinculadas mediante `ON DELETE SET NULL`.

## What Changes

- Implementación y exportación de las funciones asíncronas `actualizarHorario` y `eliminarHorario` en `src/controllers/horarioController.js`.
- Validación estricta del parámetro de ruta `id`: comprobación de que sea un número entero positivo, respondiendo HTTP 400 Bad Request con código `ERR_INVALID_ID` ante valores no válidos.
- Lógica de actualización (`PUT /api/horarios/:id`):
  - Validación de los campos `dia` (1 a 7), `actividad` no vacía, `hora_inicio` y `hora_fin` (24 horas `HH:MM` y `hora_inicio < hora_fin`), respondiendo HTTP 400 con `ERR_VALIDATION_DATA`.
  - Sentencia preparada `UPDATE horarios SET dia = ?, actividad = ?, hora_inicio = ?, hora_fin = ? WHERE id = ? AND usuario_id = ?`.
  - Manejo de recurso inexistente o ajeno si `changes === 0`, respondiendo HTTP 404 Not Found con código `ERR_HORARIO_NOT_FOUND`.
  - Respuesta HTTP 200 OK entregando el horario actualizado en `data`.
- Lógica de eliminación (`DELETE /api/horarios/:id`):
  - Sentencia preparada `DELETE FROM horarios WHERE id = ? AND usuario_id = ?`.
  - Manejo de recurso inexistente o ajeno si `changes === 0`, respondiendo HTTP 404 Not Found con código `ERR_HORARIO_NOT_FOUND`.
  - Respuesta HTTP 200 OK confirmando la eliminación con `{ success: true, message: 'Horario eliminado correctamente', data: null }`.
- Registro de las rutas protegidas `PUT /:id` y `DELETE /:id` en `src/routes/horarioRoutes.js`.

## Capabilities

### Modified Capabilities
- `gestion-horarios`: Refina los requisitos `Actualizar actividad del horario` y `Eliminar actividad del horario` detallando la validación de `id` con código `ERR_INVALID_ID`, el manejo de registros no encontrados o ajenos con código `ERR_HORARIO_NOT_FOUND`, y el formato estándar de respuesta JSON.

## Impact

- **Código modificado**:
  - `src/controllers/horarioController.js` (añade `actualizarHorario` y `eliminarHorario`).
  - `src/routes/horarioRoutes.js` (añade `PUT /:id` y `DELETE /:id`).
- **Base de datos**: Respeta la integridad referencial configurada en SQLite (`alarmas.horario_id` pasa automáticamente a `NULL` al eliminar un horario).
