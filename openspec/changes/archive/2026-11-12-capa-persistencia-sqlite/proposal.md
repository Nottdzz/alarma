# Proposal

## Why
El proyecto requiere una capa de persistencia relacional para almacenar las entidades del dominio escolar (usuarios, horarios, alarmas, estados emocionales y notas) conforme al SDD (Sección 3) y al requerimiento RF-05. Es indispensable inicializar la conexión a SQLite (`database.db`), activar la integridad referencial con claves foráneas y aprovisionar automáticamente el esquema DDL antes de exponer los endpoints de negocio.

## What Changes
- Creación de `/src/config/database.js` para abrir y mantener la conexión a `database.db` utilizando `sqlite3`.
- Habilitación obligatoria de integridad referencial mediante `PRAGMA foreign_keys = ON;` tras la apertura de la base de datos.
- Definición de la función de inicialización DDL con sentencias `CREATE TABLE IF NOT EXISTS` para las 5 tablas del sistema:
  - `usuarios`
  - `horarios`
  - `alarmas`
  - `estados_emocionales`
  - `notas`
- Exportación de un wrapper asíncrono basado en Promesas (`run`, `get`, `all`) junto con la instancia directa para simplificar el uso de consultas preparadas en controladores.
- Integración en `/src/server.js` para ejecutar la inicialización de la base de datos antes de que el servidor empiece a escuchar en el puerto HTTP, registrando la conexión en consola y capturando errores.

**Alcance:**
- Módulo de base de datos en `/src/config/database.js`.
- Script DDL de las 5 tablas y verificación de claves foráneas.
- Vinculación en el arranque de `/src/server.js`.

**Fuera del alcance:**
- Operaciones CRUD o controladores específicos de las entidades (se implementan en sus respectivos módulos de negocio).
- Migraciones avanzadas o semillas (seeders) de datos de prueba.

## Capabilities

### New Capabilities
- `persistencia-datos`: Conexión a SQLite, garantía de integridad referencial (`PRAGMA foreign_keys = ON`), creación automática del esquema DDL y utilidades asíncronas de consulta para el backend.

### Modified Capabilities
<!-- No requirement changes to existing capabilities -->

## Impact
- **Persistencia**: Se crea y gestiona el archivo local `database.db` (ignorado en `.gitignore`).
- **Servidor**: `/src/server.js` ahora espera la inicialización exitosa de la base de datos antes de levantar el listener HTTP.
- **Módulos**: `/src/config/database.js` queda disponible para ser consumido por los controladores de todas las capacidades.
