# persistencia-datos Specification

## Purpose
Establecer la capa de persistencia relacional con SQLite3, asegurando la integridad referencial mediante claves foráneas activas, el aprovisionamiento automático del esquema DDL de las 5 tablas base y un mecanismo asíncrono seguro basado en Promesas y consultas preparadas.

## Requirements

### Requirement: Conexión SQLite y habilitación de claves foráneas
El sistema SHALL abrir la conexión con el archivo de base de datos SQLite (`database.db`) y SHALL ejecutar inmediatamente la directiva `PRAGMA foreign_keys = ON;` para garantizar el cumplimiento de restricciones relacionales.

#### Scenario: Conexión e integridad activadas
- **WHEN** la aplicación inicializa el módulo de base de datos
- **THEN** la base de datos se abre en modo lectura/escritura
- **AND** la directiva `PRAGMA foreign_keys` queda establecida en `1` (activada)

#### Scenario: Error al abrir la base de datos
- **WHEN** ocurre un fallo de acceso al archivo o permisos en el sistema de archivos
- **THEN** el sistema captura el error e imprime un mensaje detallado en consola sin abortar el proceso silenciosamente

### Requirement: Inicialización automática del esquema DDL
El sistema SHALL verificar y crear de forma automática mediante `CREATE TABLE IF NOT EXISTS` las tablas `usuarios`, `horarios`, `alarmas`, `estados_emocionales` y `notas` respetando los tipos de datos y restricciones definidos en el SDD.

#### Scenario: Creación de tablas en base de datos nueva
- **WHEN** el método de inicialización DDL se ejecuta en una base de datos vacía
- **THEN** se crean las 5 tablas con sus claves primarias, foráneas, restricciones CHECK y unicidad
- **AND** la ejecución culmina satisfactoriamente

#### Scenario: Idempotencia en base de datos existente
- **WHEN** el método DDL se ejecuta en una base de datos que ya contiene las tablas creadas
- **THEN** no altera la estructura ni elimina los datos persistidos previamente

### Requirement: Wrapper asíncrono con consultas preparadas
El sistema SHALL exportar utilidades basadas en Promesas (`run`, `get`, `all`) que permitan ejecutar sentencias SQL de forma asíncrona y SHALL requerir el uso de placeholders (`?`) para todos los parámetros dinámicos.

#### Scenario: Ejecución de consulta de inserción con Promesa
- **WHEN** se invoca `db.run(sql, params)` con parámetros válidos
- **THEN** la promesa resuelve con el `lastID` y `changes` correspondientes

#### Scenario: Consulta de lectura múltiple con Promesa
- **WHEN** se invoca `db.all(sql, params)`
- **THEN** la promesa resuelve con un array que contiene las filas coincidentes

### Requirement: Sincronización con el arranque del servidor
El sistema SHALL inicializar la conexión y las tablas de la base de datos antes de que el servidor Express comience a aceptar peticiones HTTP en el puerto configurado.

#### Scenario: Secuencia de arranque del servidor
- **WHEN** se inicia el servidor mediante `server.js`
- **THEN** primero se inicializa la base de datos y se confirman las tablas
- **AND** posteriormente se inicia el listener HTTP imprimiendo la confirmación en consola
