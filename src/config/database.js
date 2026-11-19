/**
 * Configuración y gestión de persistencia con SQLite3.
 * Sistema de Gestión de Horarios, Alarmas y Estado Emocional Escolar.
 */
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, '../../database.db');

// Creación de la instancia de conexión SQLite
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(`[SQLite Error] No se pudo abrir la base de datos en ${dbPath}:`, err.message);
  } else {
    console.log(`[SQLite] Conectado exitosamente a ${dbPath}`);
    // Asegurar inmediatamente la activación de claves foráneas
    db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
      if (pragmaErr) {
        console.error('[SQLite Error] Falló al habilitar PRAGMA foreign_keys:', pragmaErr.message);
      } else {
        console.log('[SQLite] Claves foráneas (foreign_keys) activadas.');
      }
    });
  }
});

/**
 * Wrapper basado en Promesas para ejecutar sentencias de escritura (INSERT, UPDATE, DELETE).
 * @param {string} sql - Sentencia SQL parametrizada.
 * @param {Array} params - Parámetros de la consulta.
 * @returns {Promise<{ lastID: number, changes: number }>}
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        return reject(err);
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Wrapper basado en Promesas para consultar una única fila (SELECT ... LIMIT 1).
 * @param {string} sql - Sentencia SQL parametrizada.
 * @param {Array} params - Parámetros de la consulta.
 * @returns {Promise<Object|undefined>}
 */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
}

/**
 * Wrapper basado en Promesas para consultar múltiples filas (SELECT ...).
 * @param {string} sql - Sentencia SQL parametrizada.
 * @param {Array} params - Parámetros de la consulta.
 * @returns {Promise<Array<Object>>}
 */
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

/**
 * Wrapper basado en Promesas para ejecutar múltiples sentencias DDL (exec).
 * @param {string} sql - Sentencias SQL agrupadas.
 * @returns {Promise<void>}
 */
function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

/**
 * Sentencias DDL para las 5 tablas relacionales del sistema.
 */
const DDL_SCRIPT = `
-- Habilitar claves foráneas
PRAGMA foreign_keys = ON;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Horarios
CREATE TABLE IF NOT EXISTS horarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  dia INTEGER NOT NULL CHECK(dia BETWEEN 1 AND 7),
  actividad TEXT NOT NULL,
  hora_inicio TEXT NOT NULL,
  hora_fin TEXT NOT NULL,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de Alarmas
CREATE TABLE IF NOT EXISTS alarmas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  horario_id INTEGER NULL,
  dia INTEGER NOT NULL CHECK(dia BETWEEN 1 AND 7),
  hora TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  activa INTEGER NOT NULL DEFAULT 1 CHECK(activa IN (0, 1)),
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (horario_id) REFERENCES horarios(id) ON DELETE SET NULL
);

-- Tabla de Estados Emocionales
CREATE TABLE IF NOT EXISTS estados_emocionales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  fecha DATE NOT NULL,
  emocion TEXT NOT NULL,
  nota TEXT NULL,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE(usuario_id, fecha)
);

-- Tabla de Notas Rápidas
CREATE TABLE IF NOT EXISTS notas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
`;

/**
 * Inicializa la base de datos asegurando que las tablas relacionales existan.
 * @returns {Promise<void>}
 */
async function initDatabase() {
  try {
    await exec(DDL_SCRIPT);
    console.log('[SQLite] Esquema DDL inicializado: 5 tablas verificadas/creadas correctamente.');
  } catch (error) {
    console.error('[SQLite Error] Error al ejecutar el script DDL de inicialización:', error.message);
    throw error;
  }
}

module.exports = {
  db,
  run,
  get,
  all,
  exec,
  initDatabase,
};
