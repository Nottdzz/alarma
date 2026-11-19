# Spec Delta

## MODIFIED Requirements

### Requirement: Registro de usuarios
El sistema SHALL permitir registrar un usuario escolar con nombre, correo electrónico y contraseña, validando la integridad de los datos, garantizando la unicidad del correo y almacenando la contraseña mediante hash seguro.

#### Scenario: Registro exitoso
- **WHEN** el cliente envía `POST /api/auth/register` con nombre, email válido y contraseña de al menos 6 caracteres
- **THEN** el sistema persiste al usuario con la contraseña hasheada mediante `bcrypt` y factor de costo 10
- **AND** responde con código HTTP `201 Created` y un JSON con `success: true`, mensaje amigable y `data` conteniendo `id`, `nombre` y `email`
- **AND** la respuesta no incluye `password_hash` ni la contraseña en texto plano

#### Scenario: Correo electrónico duplicado
- **WHEN** el correo enviado ya existe en la tabla `usuarios`
- **THEN** el sistema responde con código HTTP `409 Conflict`
- **AND** retorna un cuerpo JSON con `success: false` y `error.code: "ERR_EMAIL_EXISTS"`
- **AND** no crea un nuevo registro en la base de datos

#### Scenario: Datos de registro inválidos
- **WHEN** falta algún campo obligatorio (`nombre`, `email`, `password`), contienen cadenas vacías tras `.trim()`, el email no tiene formato válido o la contraseña tiene menos de 6 caracteres
- **THEN** el sistema responde con código HTTP `400 Bad Request`
- **AND** retorna un cuerpo JSON con `success: false` y `error.code: "ERR_VALIDATION_DATA"`
- **AND** no crea un nuevo registro
