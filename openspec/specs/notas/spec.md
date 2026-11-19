# Notas Specification

## Purpose
Proporcionar a los escolares un módulo de notas y recordatorios rápidos para apuntar tareas breves o pendientes adicionales que no constituyen bloques de horario completo.

## Requirements

### Requirement: Crear nota rápida
El sistema SHALL permitir al usuario autenticado crear notas rápidas con un título y contenido.

#### Scenario: Creación exitosa
- **WHEN** el cliente envía `POST /api/notas` con `titulo` no vacío y `contenido`
- **THEN** el sistema responde `201 Created` con la nota registrada
- **AND** la vincula al `usuario_id` del token

#### Scenario: Título ausente
- **WHEN** el cliente envía la petición sin título
- **THEN** el sistema responde `400 Bad Request` con mensaje de error explicativo

### Requirement: Listar notas del usuario
El sistema SHALL devolver únicamente las notas creadas por el usuario autenticado.

#### Scenario: Consulta de notas
- **WHEN** el cliente envía `GET /api/notas`
- **THEN** el sistema responde `200 OK` con la lista de notas ordenadas por fecha de creación descendente
- **AND** excluye notas pertenecientes a otros usuarios

### Requirement: Editar nota rápida
El sistema SHALL permitir al usuario editar el título y contenido de una nota existente propia.

#### Scenario: Edición exitosa
- **WHEN** el cliente envía `PUT /api/notas/:id` con nuevos valores válidos
- **THEN** el sistema responde `200 OK` con la nota actualizada
- **AND** persiste los cambios en la base de datos

#### Scenario: Nota inexistente o ajena
- **WHEN** el identificador no existe o corresponde a otro usuario
- **THEN** el sistema responde `404 Not Found`

### Requirement: Eliminar nota
El sistema SHALL permitir al usuario eliminar permanentemente una de sus notas.

#### Scenario: Eliminación exitosa
- **WHEN** el cliente envía `DELETE /api/notas/:id` sobre una nota propia
- **THEN** el sistema responde `200 OK`
- **AND** remueve el registro de SQLite

#### Scenario: Nota ajena
- **WHEN** el `:id` pertenece a otro usuario
- **THEN** el sistema responde `404 Not Found`
