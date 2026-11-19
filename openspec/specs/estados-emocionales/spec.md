# Estados Emocionales Specification

## Purpose
Permitir a los escolares registrar y consultar su estado emocional diario durante la semana (por ejemplo: Alegre, Motivado, Cansado, Estresado) con notas reflexivas opcionales, asegurando un registro único por día por usuario.

## Requirements

### Requirement: Registrar o actualizar estado emocional diario
El sistema SHALL permitir al usuario registrar su estado de ánimo para una fecha determinada, garantizando unicidad de registro por día.

#### Scenario: Registro exitoso
- **WHEN** el cliente envía `POST /api/emociones` con `fecha` (YYYY-MM-DD), `emocion` válida y opcionalmente `nota`
- **THEN** el sistema responde `201 Created` con el registro guardado
- **AND** lo asocia al usuario autenticado

#### Scenario: Registro existente para la misma fecha
- **WHEN** el usuario ya tiene un registro para esa fecha
- **THEN** el sistema actualiza la emoción y nota del día existente
- **AND** responde `200 OK` con los datos actualizados

#### Scenario: Parámetros inválidos
- **WHEN** falta la fecha o la emoción, o el formato de fecha no es válido
- **THEN** el sistema responde `400 Bad Request` con el formato estándar de error

### Requirement: Consultar historial de estados emocionales
El sistema SHALL devolver el historial de emociones del usuario autenticado, permitiendo filtrar por mes y año.

#### Scenario: Consulta mensual
- **WHEN** el cliente envía `GET /api/emociones?mes=10&anio=2026`
- **THEN** el sistema responde `200 OK` con la lista de registros emocionales de ese periodo
- **AND** no revela registros de otros usuarios
