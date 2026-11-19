# Spec Delta

## MODIFIED Requirements

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
