# Tasks

## 1. Implementación de Actualización y Eliminación de Horarios

- [ ] 1.1 Implementar la función asíncrona `actualizarHorario(req, res, next)` en `src/controllers/horarioController.js` y exportarla
- [ ] 1.2 Implementar en `actualizarHorario` la validación del parámetro `id` (retornando HTTP 400 con código `ERR_INVALID_ID`), validación de campos del cuerpo (`ERR_VALIDATION_DATA`), la consulta parametrizada `UPDATE horarios SET dia = ?, actividad = ?, hora_inicio = ?, hora_fin = ? WHERE id = ? AND usuario_id = ?`, el retorno HTTP 404 `ERR_HORARIO_NOT_FOUND` si `changes === 0`, y la respuesta HTTP 200 OK
- [ ] 1.3 Implementar la función asíncrona `eliminarHorario(req, res, next)` en `src/controllers/horarioController.js` y exportarla
- [ ] 1.4 Implementar en `eliminarHorario` la validación del parámetro `id` (`ERR_INVALID_ID`), la consulta parametrizada `DELETE FROM horarios WHERE id = ? AND usuario_id = ?`, el retorno HTTP 404 `ERR_HORARIO_NOT_FOUND` si `changes === 0`, y la respuesta HTTP 200 OK con `{ success: true, message: 'Horario eliminado correctamente', data: null }`
- [ ] 1.5 Configurar en `src/routes/horarioRoutes.js` las rutas protegidas `PUT /:id` y `DELETE /:id` vinculadas a `actualizarHorario` y `eliminarHorario`

## 2. Pruebas y Verificación

- [ ] 2.1 Crear un script de pruebas automatizado para validar `PUT /api/horarios/:id` (ID inválido, datos inválidos, horario inexistente/ajeno -> 404, y actualización exitosa) y `DELETE /api/horarios/:id` (ID inválido, horario inexistente/ajeno -> 404, y eliminación exitosa con preservación de alarmas vinculadas)
- [ ] 2.2 Ejecutar las pruebas automatizadas y asegurar que los códigos HTTP (200, 400, 404), esquemas JSON y persistencia cumplan los estándares del proyecto
- [ ] 2.3 Validar los cambios de OpenSpec con `npx openspec validate --changes`
