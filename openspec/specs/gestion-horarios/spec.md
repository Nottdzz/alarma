# Gestión de Horarios Specification

## Purpose
Permitir que cada escolar organice su semana registrando, consultando, actualizando y eliminando actividades con día, hora de inicio, hora de fin y título, sin solapamientos dentro de una misma cuenta.

## Requirements

### Requirement: Crear actividad del horario
El sistema SHALL crear una actividad de horario para el usuario autenticado a partir de `dia`, `actividad`, `hora_inicio` y `hora_fin`, asignando el `usuario_id` desde el token y validando que las horas cumplan el formato de 24 horas `HH:MM` con `hora_inicio < hora_fin`.

#### Scenario: Creación exitosa
- **WHEN** el cliente envía `POST /api/horarios` con `dia` entre 1 y 7, `actividad` no vacío y horas válidas en formato 24 horas `HH:MM`, con `hora_fin` posterior a `hora_inicio`
- **THEN** el sistema responde con código HTTP `201 Created` y el objeto del horario creado en `data`
- **AND** la actividad queda asociada exclusivamente al `usuario_id` del token JWT

#### Scenario: Datos inválidos
- **WHEN** falta algún campo requerido, `actividad` está vacía, el `dia` no es un entero entre 1 y 7, las horas no cumplen la expresión regular `/^([01]\d|2[0-3]):([0-5]\d)$/` o `hora_inicio` no es anterior a `hora_fin`
- **THEN** el sistema responde con código HTTP `400 Bad Request` y cuerpo JSON con `error.code: "ERR_VALIDATION_DATA"`
- **AND** no persiste la actividad en la base de datos

#### Scenario: Intento de suplantar al usuario
- **WHEN** el cuerpo de la petición incluye un `usuario_id` distinto al del token
- **THEN** el sistema ignora ese valor
- **AND** guarda la actividad con el usuario del token

### Requirement: Consultar horarios
El sistema SHALL devolver únicamente los horarios del usuario autenticado ordenados ascendentemente por `dia ASC, hora_inicio ASC` y SHALL permitir filtrarlos opcionalmente por día de la semana.

#### Scenario: Listado completo
- **WHEN** el cliente envía `GET /api/horarios` con token de autenticación válido
- **THEN** el sistema responde con código HTTP `200 OK` con la lista de horarios del usuario en `data`
- **AND** ordena los registros por `dia ASC, hora_inicio ASC`
- **AND** no incluye horarios de otros usuarios

#### Scenario: Filtro por día
- **WHEN** el cliente envía `GET /api/horarios?dia=N` siendo N un entero entre 1 y 7
- **THEN** el sistema responde con código HTTP `200 OK` retornando únicamente las actividades del día solicitado pertenecientes al usuario
- **AND** si el parámetro `dia` no es un entero entre 1 y 7, responde con código HTTP `400 Bad Request` y `error.code: "ERR_INVALID_DAY"`

### Requirement: Actualizar actividad del horario
El sistema SHALL actualizar una actividad existente del usuario autenticado cuando recibe `PUT /api/horarios/:id` con los campos editables.

#### Scenario: Actualización exitosa
- **WHEN** el usuario envía `PUT /api/horarios/:id` con datos válidos y el horario pertenece al usuario
- **THEN** el sistema responde `200 OK` con la actividad actualizada
- **AND** persiste los nuevos valores en SQLite

#### Scenario: Horario inexistente o ajeno
- **WHEN** el identificador no existe o pertenece a otro usuario
- **THEN** el sistema responde `404 Not Found`
- **AND** no modifica ningún registro

### Requirement: Eliminar actividad del horario
El sistema SHALL eliminar una actividad del usuario autenticado cuando recibe `DELETE /api/horarios/:id`, dejando sin vínculo las alarmas asociadas.

#### Scenario: Eliminación exitosa
- **WHEN** el usuario elimina un horario propio
- **THEN** el sistema responde `200 OK`
- **AND** las alarmas vinculadas conservan su registro con `horario_id` nulo

#### Scenario: Horario inexistente o ajeno
- **WHEN** el identificador no existe o pertenece a otro usuario
- **THEN** el sistema responde `404 Not Found`

### Requirement: Detección de conflictos de horario
El sistema SHALL rechazar una actividad que se solape en día y rango horario con otra actividad del mismo usuario antes de persistirla.

#### Scenario: Solapamiento detectado
- **WHEN** la nueva actividad comparte día y su rango `[hora_inicio, hora_fin)` interseca el de otra actividad del usuario
- **THEN** el sistema responde `400 Bad Request` con `code: "ERR_CONFLICTO_HORARIO"`
- **AND** no guarda la actividad

#### Scenario: Rangos contiguos sin solapamiento
- **WHEN** una actividad termina exactamente a la hora en que comienza la siguiente
- **THEN** el sistema acepta ambas actividades

### Requirement: Título y descripción de la actividad
El sistema SHALL permitir que cada actividad tenga un título obligatorio y una descripción opcional para ampliar el detalle de la tarea.

#### Scenario: Actividad con descripción
- **WHEN** el usuario registra una actividad con título y descripción
- **THEN** el sistema conserva ambos valores
- **AND** la interfaz muestra el título y, si existe, la descripción

### Requirement: Agenda semanal en la interfaz
El frontend SHALL presentar los horarios agrupados por día de la semana, del lunes al domingo, en bloques legibles dentro del dashboard.

#### Scenario: Visualización de la semana
- **WHEN** el usuario abre la pantalla principal con horarios cargados
- **THEN** la interfaz agrupa las actividades por día
- **AND** cada bloque muestra el título y el rango horario de la actividad
