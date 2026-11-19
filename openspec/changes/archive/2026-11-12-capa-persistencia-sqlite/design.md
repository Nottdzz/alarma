# Design

## Context
Ver motivación en `proposal.md`. El backend requiere interactuar con SQLite mediante consultas preparadas con el driver `sqlite3`. Dado que `sqlite3` expone un API basado en callbacks, se diseñará un módulo centralizado `/src/config/database.js` que gestione la conexión única, active las claves foráneas, cree las tablas e introduzca un wrapper con Promesas para una programación moderna con `async/await`.

## Goals / Non-Goals

**Goals:**
- Centralizar la conexión a SQLite en `/src/config/database.js`.
- Habilitar `PRAGMA foreign_keys = ON;` al conectar para asegurar integridad referencial.
- Proveer un método de inicialización DDL idempotente para las 5 tablas base del sistema.
- Exportar funciones asíncronas con Promesas (`query`, `get`, `all`, `run`) para desacoplar a los futuros controladores del manejo de callbacks.
- Coordinar el inicio en `/src/server.js` asegurando que la base de datos esté lista antes de abrir el puerto HTTP.

**Non-Goals:**
- Implementar repositorios de datos o lógica de negocio específica de cada tabla.
- Gestionar migraciones de versión de esquema (se usa DDL declarativo con `IF NOT EXISTS`).

## Decisions

### Decisión 1: Encapsulamiento con Promesas para `sqlite3`
- **Elección:** Envolver los métodos `run`, `get` y `all` de la instancia `sqlite3.Database` en métodos que devuelven `Promise`.
- **Racional:** Permite el uso fluido de `async/await` y bloques `try/catch` en los controladores de Express sin añadir dependencias externas adicionales como ORMs pesados.

### Decisión 2: Inicialización DDL mediante script consolidado
- **Elección:** Ejecutar las 5 sentencias `CREATE TABLE IF NOT EXISTS` encadenadas o mediante `db.exec()` durante la función `initDatabase()`.
- **Racional:** Garantiza que la primera vez que se inicie la aplicación (o en entornos nuevos de despliegue) el archivo `database.db` se cree automáticamente con las tablas correctas.

### Decisión 3: Activación inmediata de claves foráneas
- **Elección:** Ejecutar `PRAGMA foreign_keys = ON;` en el callback de conexión.
- **Racional:** En SQLite el soporte de claves foráneas está desactivado por defecto en cada conexión abierta. Su activación explícita e inmediata es imprescindible para la integridad referencial y el funcionamiento de `ON DELETE CASCADE` y `ON DELETE SET NULL`.

## Risks / Trade-offs

- **[Riesgo: Bloqueo o lentitud en escrituras concurrentes de SQLite]** → **Mitigación**: Para la escala de una aplicación web escolar local, una sola conexión persistente con consultas preparadas es suficiente y óptima.
- **[Riesgo: Fallo al crear la base de datos por permisos de escritura]** → **Mitigación**: Capturar el error en la promesa de inicialización e informar claramente en la consola, impidiendo el arranque inconsistente del servidor.
