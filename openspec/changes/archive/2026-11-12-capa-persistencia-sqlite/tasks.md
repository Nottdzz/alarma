# Tasks

## 1. Conexión SQLite y Wrapper de Promesas

- [x] 1.1 Implementar el archivo `/src/config/database.js` estableciendo la conexión persistente con `database.db`, ejecutando de forma inmediata `PRAGMA foreign_keys = ON;` y manejando errores de apertura con mensajes claros en consola.
- [x] 1.2 Implementar y exportar los métodos auxiliares con Promesas (`run`, `get`, `all`) y la instancia nativa `db` para permitir consultas asíncronas preparadas desde los futuros controladores.

## 2. Definición del Esquema DDL

- [x] 2.1 Implementar la función `initDatabase()` en `/src/config/database.js` que ejecute las sentencias `CREATE TABLE IF NOT EXISTS` para las 5 tablas base (`usuarios`, `horarios`, `alarmas`, `estados_emocionales`, `notas`) respetando tipos, claves foráneas, restricciones CHECK y unicidad.

## 3. Integración en el Servidor y Verificación Operativa

- [x] 3.1 Modificar `/src/server.js` para esperar la resolución de `initDatabase()` antes de iniciar la escucha en el puerto HTTP, registrando la confirmación en consola.
- [x] 3.2 Ejecutar una prueba automatizada que valide el arranque del servidor, la creación del archivo `database.db`, la existencia de las 5 tablas y la activación de `foreign_keys`.
