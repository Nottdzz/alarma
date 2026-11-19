# Alarmas Specification

## Purpose
Permitir la programación, activación, desactivación, edición y eliminación de alarmas asociadas a horarios escolares o independientes, garantizando la reproducción secuencial mediante cola de atención en el frontend cuando varias alarmas coincidan en el mismo minuto.

## Requirements

### Requirement: Crear alarma
El sistema SHALL permitir al usuario autenticado registrar una alarma con `dia`, `hora`, `mensaje` y opcionalmente `horario_id`.

#### Scenario: Creación exitosa vinculada a un horario
- **WHEN** el cliente envía `POST /api/alarmas` con `dia` válido (1 a 7), `hora` en formato `HH:MM`, `mensaje` descriptivo y un `horario_id` perteneciente al usuario
- **THEN** el sistema responde `201 Created` con el registro de la alarma creada y su estado activo por defecto
- **AND** asocia la alarma al `usuario_id` del token

#### Scenario: Creación exitosa independiente
- **WHEN** el cliente envía `POST /api/alarmas` sin `horario_id`
- **THEN** el sistema responde `201 Created` con `horario_id` nulo
- **AND** persiste la alarma correctamente

#### Scenario: Datos de alarma inválidos
- **WHEN** la hora no respeta el formato `HH:MM`, el día está fuera del rango 1-7 o el mensaje está vacío
- **THEN** el sistema responde `400 Bad Request` con el formato estándar de error

### Requirement: Consultar alarmas del usuario
El sistema SHALL devolver la lista de alarmas pertenecientes exclusivamente al usuario autenticado.

#### Scenario: Listado de alarmas
- **WHEN** el cliente envía `GET /api/alarmas` con token válido
- **THEN** el sistema responde `200 OK` con el array de alarmas del usuario
- **AND** no incluye alarmas de otros usuarios

### Requirement: Conmutar estado de alarma (Toggle)
El sistema SHALL permitir activar o desactivar una alarma individual sin eliminar su configuración.

#### Scenario: Conmutación exitosa
- **WHEN** el cliente envía `PATCH /api/alarmas/:id/toggle` con `{ "activa": false }` para una alarma propia
- **THEN** el sistema responde `200 OK` con el nuevo estado de la alarma
- **AND** actualiza el campo `activa` en la base de datos

#### Scenario: Alarma no encontrada o ajena
- **WHEN** el `:id` no existe o pertenece a otro usuario
- **THEN** el sistema responde `404 Not Found`
- **AND** no altera ningún registro

### Requirement: Eliminar alarma
El sistema SHALL eliminar permanentemente una alarma cuando el usuario autenticado lo solicite.

#### Scenario: Eliminación exitosa
- **WHEN** el cliente envía `DELETE /api/alarmas/:id` para una alarma propia
- **THEN** el sistema responde `200 OK`
- **AND** elimina el registro en SQLite

#### Scenario: Intento de eliminar alarma ajena
- **WHEN** el identificador pertenece a otro usuario
- **THEN** el sistema responde `404 Not Found`

### Requirement: Cola de ejecución secuencial en frontend
El frontend SHALL mantener un temporizador que evalúe cada segundo las alarmas activas del día y hora actual, encolándolas y reproduciéndolas de forma secuencial una tras otra conforme sean atendidas por el escolar.

#### Scenario: Coincidencia de múltiples alarmas en el mismo minuto
- **WHEN** dos o más alarmas activas coinciden en el mismo día y hora (`HH:MM`)
- **THEN** el frontend añade todas las alarmas coincidentes a una cola (`colaAlarmas`) marcándolas como procesadas en el día
- **AND** reproduce el sonido y muestra la alerta de la primera alarma en la cola

#### Scenario: Despacho secuencial tras confirmación
- **WHEN** el escolar atiende y cierra el modal de la alarma en reproducción
- **THEN** el frontend detiene el audio actual
- **AND** despacha inmediatamente la siguiente alarma de la cola si no está vacía
