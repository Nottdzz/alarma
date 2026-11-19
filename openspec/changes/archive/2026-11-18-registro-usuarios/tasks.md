# Tasks

## 1. Implementación del Controlador y Enrutamiento de Autenticación

- [x] 1.1 Crear el archivo `src/controllers/authController.js` e implementar la función asíncrona `registrarUsuario(req, res, next)`
- [x] 1.2 Implementar validaciones de campos requeridos (`nombre`, `email`, `password`), formato de correo mediante regex y contraseña mínima de 6 caracteres, retornando HTTP 400 con código `ERR_VALIDATION_DATA` si falla
- [x] 1.3 Implementar la verificación de unicidad de correo consultando la tabla `usuarios` en SQLite con consulta preparada (`get`), respondiendo HTTP 409 con código `ERR_EMAIL_EXISTS` si el correo ya está registrado
- [x] 1.4 Implementar el cifrado seguro de contraseña con `bcrypt.hash(password, 10)`, la inserción parametrizada en la base de datos con `run`, y el retorno HTTP 201 Created con el payload estándar excluyendo `password_hash`
- [x] 1.5 Crear `src/routes/authRoutes.js` con la ruta `POST /register` asociada a `registrarUsuario` e integrar el enrutador en `src/server.js` bajo `/api/auth`

## 2. Pruebas y Verificación

- [x] 2.1 Crear un script de pruebas automatizado para validar peticiones contra `POST /api/auth/register` (registro exitoso, campos faltantes, formato de correo incorrecto, contraseña menor a 6 caracteres y correo duplicado)
- [x] 2.2 Ejecutar las pruebas y verificar que las respuestas HTTP y estructuras JSON cumplan los estándares del proyecto
- [x] 2.3 Validar los cambios de OpenSpec con `npx openspec validate --changes`
