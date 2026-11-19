# Tasks

## 1. Implementación de Controladores y Rutas de Horarios

- [x] 1.1 Crear el archivo `src/controllers/horarioController.js` e implementar la función asíncrona `obtenerHorarios(req, res, next)`
- [x] 1.2 Implementar en `obtenerHorarios` la validación del parámetro de consulta `dia` (retornando HTTP 400 con código `ERR_INVALID_DAY` si no es entero entre 1 y 7), la consulta preparada en SQLite filtrando por `usuario_id` y ordenando por `dia ASC, hora_inicio ASC`, y retorno HTTP 200 OK
- [x] 1.3 Implementar la función asíncrona `crearHorario(req, res, next)` en `src/controllers/horarioController.js`
- [x] 1.4 Implementar en `crearHorario` las validaciones de campos requeridos, rango de día (1-7), formato 24h `HH:MM` mediante regex `/^([01]\d|2[0-3]):([0-5]\d)$/`, y orden cronológico `hora_inicio < hora_fin`, respondiendo HTTP 400 con código `ERR_VALIDATION_DATA`
- [x] 1.5 Implementar en `crearHorario` la inserción parametrizada en la tabla `horarios` asignando `req.usuario.id` y retornando HTTP 201 Created con el objeto creado
- [x] 1.6 Crear el archivo `src/routes/horarioRoutes.js`, aplicar el middleware `verificarToken` a todas las rutas, vincular `GET /` y `POST /`, y montar el enrutador en `src/server.js` bajo `/api/horarios`

## 2. Pruebas y Verificación

- [x] 2.1 Crear un script de pruebas automatizado para verificar `GET /api/horarios` (sin filtro, con filtro de día válido, con día inválido, y aislamiento entre usuarios) y `POST /api/horarios` (creación exitosa, campos faltantes, formato de hora inválido, hora fin menor a inicio)
- [x] 2.2 Ejecutar las pruebas automatizadas y asegurar que los códigos HTTP (200, 201, 400, 401) y estructuras JSON cumplan los estándares del proyecto
- [x] 2.3 Validar la especificación con `npx openspec validate --changes`
