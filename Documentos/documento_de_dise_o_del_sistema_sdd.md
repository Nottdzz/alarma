# Documento de Diseño del Sistema (SDD - Software Design Document)

**Proyecto:** Sistema de Gestión de Horarios, Alarmas y Estado Emocional Escolar  
**Versión:** 1.1.0  
**Stack Tecnológico:** HTML5, CSS3, JavaScript (Vanilla ES6+), Node.js (Express), SQLite3  

---

## 1. Arquitectura General del Sistema

El sistema sigue un patrón de **Arquitectura en 3 Capas (Cliente - Servidor - Base de Datos)** desacopladas a través de un contrato de API RESTful.

```
┌─────────────────────────────────────────────────────────────┐
│                      CAPA DE CLIENTE                        │
│   HTML5 / CSS3 / JavaScript Vanilla (DOM, Fetch API, Audio) │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON (REST API)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      CAPA DE SERVIDOR                       │
│      Node.js + Express Framework (Rutas, Controllers, Auth) │
└──────────────────────────────┬──────────────────────────────┘
                               │ Driver SQL (`sqlite3` / `better-sqlite3`)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE PERSISTENCIA                    │
│                 SQLite3 Database (`database.db`)            │
└─────────────────────────────────────────────────────────────┘
```

### Componentes Principales:

1. **Frontend (Cliente Web):** Renderiza la interfaz de usuario, gestiona el estado de la sesión local, ejecuta el temporizador de revisión de alarmas (`setInterval`) y maneja la cola de reproducción sonora/visual de alertas.
2. **Backend (Servidor Express):** Procesa las peticiones REST, realiza la autenticación con tokens JWT, aplica las reglas de negocio (validación de datos, conflictos de horarios) y consulta la base de datos.
3. **Base de Datos (SQLite):** Almacena los registros relacionales de usuarios, horarios, alarmas, estados emocionales y notas de forma persistente.

---

## 2. Diagrama de Flujo de Datos y Secuencia

### 2.1. Flujo de Autenticación y Peticiones Protegidas

```
  Escolar (Browser)               Node.js Express                 SQLite3 DB
        │                               │                             │
        │─── 1. POST /api/auth/login ──>│                             │
        │    {email, password}          │─── 2. SELECT * FROM users ─>│
        │                               │    WHERE email = ?          │
        │                               │<── 3. Usuario & Hash ───────│
        │                               │                             │
        │   [Compara Hash (bcrypt)]     │                             │
        │<── 4. 200 OK + JWT Token ─────│                             │
        │                               │                             │
        │─── 5. GET /api/horarios ─────>│                             │
        │    Header: Bearer <Token>     │                             │
        │                               │ [Verifica Token JWT]        │
        │                               │─── 6. SELECT horarios ─────>│
        │                               │    WHERE usuario_id = X     │
        │                               │<── 7. Lista de Horarios ────│
        │<── 8. 200 OK (JSON Data) ─────│                             │
```

---

## 3. Modelo y Esquema de Base de Datos (SQLite)

### 3.1. Diagrama Entidad-Relación (Lógico)

* **USUARIOS** (1) ───< (N) **HORARIOS**
* **USUARIOS** (1) ───< (N) **ALARMAS**
* **HORARIOS** (1) ───< (N) **ALARMAS** *(Opcional / Anulable)*
* **USUARIOS** (1) ───< (N) **ESTADOS_EMOCIONALES**
* **USUARIOS** (1) ───< (N) **NOTAS**

### 3.2. Script DDL (Data Definition Language) para SQLite

```sql
-- Habilitar claves foráneas en SQLite
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
    dia INTEGER NOT NULL CHECK(dia BETWEEN 1 AND 7), -- 1: Lunes, 7: Domingo
    actividad TEXT NOT NULL,
    hora_inicio TEXT NOT NULL, -- Formato HH:MM (24h)
    hora_fin TEXT NOT NULL,    -- Formato HH:MM (24h)
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de Alarmas
CREATE TABLE IF NOT EXISTS alarmas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    horario_id INTEGER NULL, -- Opcional, por si se vincula a una actividad
    dia INTEGER NOT NULL CHECK(dia BETWEEN 1 AND 7),
    hora TEXT NOT NULL,       -- Formato HH:MM (24h)
    mensaje TEXT NOT NULL,
    activa INTEGER NOT NULL DEFAULT 1 CHECK(activa IN (0, 1)), -- 1: True, 0: False
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (horario_id) REFERENCES horarios(id) ON DELETE SET NULL
);

-- Tabla de Estados Emocionales
CREATE TABLE IF NOT EXISTS estados_emocionales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    fecha DATE NOT NULL, -- Formato YYYY-MM-DD
    emocion TEXT NOT NULL, -- Ej: "Alegre", "Cansado", "Estresado", "Motivado"
    nota TEXT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, fecha) -- Un registro por día por usuario
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
```

---

## 4. Especificación de la API REST

Todas las rutas privadas requieren el encabezado:  
`Authorization: Bearer <JWT_TOKEN>`

### 4.1. Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Payload / Params | Respuestas HTTP |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Registrar nuevo usuario | `{ "nombre", "email", "password" }` | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `POST` | `/api/auth/login` | Iniciar sesión | `{ "email", "password" }` | `200 OK` (retorna Token), `401 Unauthorized` |

### 4.2. Horarios (`/api/horarios`)

| Método | Endpoint | Descripción | Payload / Params | Respuestas HTTP |
|---|---|---|---|---|
| `GET` | `/api/horarios` | Obtener todos los horarios del usuario | Query opcional: `?dia=1` | `200 OK`, `500 Error` |
| `POST` | `/api/horarios` | Crear un nuevo horario | `{ "dia", "actividad", "hora_inicio", "hora_fin" }` | `201 Created`, `400 Bad Request` |
| `PUT` | `/api/horarios/:id` | Modificar un horario existente | `{ "dia", "actividad", "hora_inicio", "hora_fin" }` | `200 OK`, `404 Not Found`, `400 Bad Request` |
| `DELETE` | `/api/horarios/:id` | Eliminar un horario | Parámetro URL `:id` | `200 OK`, `404 Not Found` |

### 4.3. Alarmas (`/api/alarmas`)

| Método | Endpoint | Descripción | Payload / Params | Respuestas HTTP |
|---|---|---|---|---|
| `GET` | `/api/alarmas` | Consultar alarmas activas del usuario | Ninguno | `200 OK` |
| `POST` | `/api/alarmas` | Crear una nueva alarma | `{ "dia", "hora", "mensaje", "horario_id"? }` | `201 Created`, `400 Bad Request` |
| `PATCH` | `/api/alarmas/:id/toggle` | Activar / Desactivar alarma | `{ "activa": true/false }` | `200 OK`, `404 Not Found` |
| `DELETE` | `/api/alarmas/:id` | Eliminar una alarma | Parámetro URL `:id` | `200 OK`, `404 Not Found` |

### 4.4. Estado Emocional (`/api/emociones`)

| Método | Endpoint | Descripción | Payload / Params | Respuestas HTTP |
|---|---|---|---|---|
| `GET` | `/api/emociones` | Obtener historial de emociones | Query: `?mes=10&anio=2026` | `200 OK` |
| `POST` | `/api/emociones` | Registrar estado del día | `{ "fecha", "emocion", "nota"? }` | `201 Created`, `400 Bad Request` |

### 4.5. Notas (`/api/notas`)

| Método | Endpoint | Descripción | Payload / Params | Respuestas HTTP |
|---|---|---|---|---|
| `GET` | `/api/notas` | Listar notas del usuario | Ninguno | `200 OK` |
| `POST` | `/api/notas` | Crear nota rápida | `{ "titulo", "contenido" }` | `201 Created` |
| `DELETE` | `/api/notas/:id` | Eliminar nota | Parámetro URL `:id` | `200 OK`, `404 Not Found` |

---

## 5. Algoritmo del Frontend: Manejo de Cola de Alarmas

Para cumplir con el requerimiento de disparar secuencialmente las alarmas activas a la misma hora, la lógica en JavaScript en el navegador sigue la estructura descrita a continuación:

```javascript
// Estructura de la cola en Frontend
const colaAlarmas = [];
let alarmaReproduciendose = false;

// Revisión periódica cada 1 segundo
setInterval(() => {
    const ahora = new Date();
    const diaActual = ahora.getDay() === 0 ? 7 : ahora.getDay(); // Adaptar domingo
    const horaActual = ahora.toTimeString().substring(0, 5); // HH:MM

    // Filtrar alarmas que coinciden
    const coincidentes = alarmasCargadas.filter(a => 
        a.activa && a.dia === diaActual && a.hora === horaActual && !a.procesadaHoy
    );

    coincidentes.forEach(a => {
        a.procesadaHoy = true;
        colaAlarmas.push(a);
    });

    procesarSiguienteAlarma();
}, 1000);

function procesarSiguienteAlarma() {
    if (alarmaReproduciendose || colaAlarmas.length === 0) return;

    alarmaReproduciendose = true;
    const alarmaActual = colaAlarmas.shift();

    // Reproducir audio y mostrar Modal
    reproducirSonidoAlarma();
    mostrarModalAlarma(alarmaActual.mensaje, () => {
        // Al cerrar/atender la alarma
        detenerSonidoAlarma();
        alarmaReproduciendose = false;
        procesarSiguienteAlarma(); // Dispara la siguiente inmediatamente
    });
}
```

---

## 6. Estrategia de Seguridad y Middleware

1. **Cifrado de Contraseñas:** Se utilizará la librería `bcrypt` con un factor de costo (salt rounds) de `10` antes de escribir en SQLite.
2. **Protección SQL Injection:** Todas las consultas en Node.js hacia SQLite deben utilizar **consultas preparadas (Prepared Statements / Parameterized Queries)** mediante placeholders `?`.
3. **Manejo de Errores Globales:** Un Middleware en Express interceptará excepciones no capturadas y retornará un formato JSON estandarizado:
   ```json
   {
     "error": true,
     "message": "Descripción amigable del problema",
     "code": 400
   }
   ```

---

## 7. Estructura de Archivos Recomendada para el Proyecto

```
/sistema-horarios-escolar
├── /public                      # Frontend estático
│   ├── index.html              # Pantalla principal
│   ├── login.html              # Pantalla de login / registro
│   ├── /css
│   │   └── styles.css          # Estilos CSS
│   └── /js
│       ├── api.js              # Funciones para llamadas HTTP con fetch
│       ├── alarmas.js          # Lógica del reloj y cola de alarmas
│       └── app.js              # Manejo del DOM y UI
├── /src                        # Backend Node.js
│   ├── /config
│   │   └── database.js         # Conexión e inicialización SQLite
│   ├── /controllers            # Lógica de controladores
│   │   ├── authController.js
│   │   ├── horarioController.js
│   │   └── alarmaController.js
│   ├── /middlewares            # Token Auth y Error Handler
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── /routes                 # Rutas de la API Express
│   │   ├── authRoutes.js
│   │   ├── horarioRoutes.js
│   │   └── alarmaRoutes.js
│   └── server.js               # Entry point de Node.js
├── database.db                 # Archivo SQLite3
├── package.json
└── README.md
```