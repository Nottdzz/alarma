# Spec Delta

## MODIFIED Requirements

### Requirement: Actualizar actividad del horario
El sistema SHALL actualizar una actividad existente del usuario autenticado cuando recibe `PUT /api/horarios/:id` con identificador y campos editables válidos.

#### Scenario: Actualización exitosa
- **WHEN** el usuario envía `PUT /api/horarios/:id` con `id` entero positivo, datos válidos (`dia` 1..7, `actividad` no vacía, `hora_inicio < hora_fin` en formato 24 horas `HH:MM`) y el horario pertenece al usuario autenticado
- **THEN** el sistema responde con código HTTP `200 OK` y el objeto actualizado dentro de `data`
- **AND** persiste los nuevos valores en la base de datos SQLite

#### Scenario: Horario inexistente o ajeno
- **WHEN** el identificador no existe en la base de datos o pertenece a otro usuario
- **THEN** el sistema responde con código HTTP `404 Not Found` y cuerpo JSON con `error.code: "ERR_HORARIO_NOT_FOUND"`
- **AND** no modifica ningún registro

#### Scenario: Identificador o datos inválidos en actualización
- **WHEN** el parámetro `id` no es un número entero positivo o los datos del cuerpo contienen campos faltantes, vacíos o mal formateados
- **THEN** el sistema responde con código HTTP `400 Bad Request` y `error.code` respectivo (`ERR_INVALID_ID` o `ERR_VALIDATION_DATA`)
- **AND** no modifica ningún registro

### Requirement: Eliminar actividad del horario
El sistema SHALL eliminar una actividad del usuario autenticado cuando recibe `DELETE /api/horarios/:id`, dejando sin vínculo las alarmas asociadas.

#### Scenario: Eliminación exitosa
- **WHEN** el usuario envía `DELETE /api/horarios/:id` con `id` entero positivo y el horario pertenece al usuario autenticado
- **THEN** el sistema responde con código HTTP `200 OK` con mensaje de confirmación y `data: null`
- **AND** elimina el horario de la base de datos
- **AND** las alarmas vinculadas conservan su registro con `horario_id` nulo mediante la regla de integridad referencial

#### Scenario: Horario inexistente o ajeno
- **WHEN** el identificador no existe o pertenece a otro usuario
- **THEN** el sistema responde con código HTTP `404 Not Found` y cuerpo JSON con `error.code: "ERR_HORARIO_NOT_FOUND"`
- **AND** no elimina ningún registro

#### Scenario: Identificador inválido en eliminación
- **WHEN** el parámetro `id` recibido en la ruta no es un número entero positivo
- **THEN** el sistema responde con código HTTP `400 Bad Request` y cuerpo JSON con `error.code: "ERR_INVALID_ID"`
