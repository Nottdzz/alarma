# Estándares y Convenciones de Desarrollo

**Proyecto:** Sistema de Gestión de Horarios, Alarmas y Estado Emocional Escolar  
**Versión:** 1.0.0  
**Stack Tecnológico:** HTML5, CSS3, JavaScript (Vanilla ES6+), Node.js (Express), SQLite3  

---

## 1. Naming Conventions (Convenciones de Nomenclatura)

Para mantener la consistencia en el código entre el Frontend y el Backend, se aplicarán estrictamente las siguientes reglas:

### 1.1. JavaScript (Frontend & Node.js)
* **Variables y Funciones:** Usar `camelCase`.
  ```javascript
  const usuarioId = 12;
  function obtenerHorariosPorDia(dia) { ... }
  ```
* **Clases y Componentes:** Usar `PascalCase`.
  ```javascript
  class GestorAlarmas { ... }
  ```
* **Constantes Globales:** Usar `UPPER_SNAKE_CASE`.
  ```javascript
  const API_BASE_URL = 'http://localhost:3000/api';
  const MAX_REINTENTOS = 3;
  ```

### 1.2. Base de Datos (SQLite)
* **Tablas y Columnas:** Usar `snake_case` en plural para tablas y en singular para columnas.
  * Tabla: `usuarios`, `horarios`, `alarmas`
  * Columnas: `hora_inicio`, `usuario_id`, `password_hash`
* **Claves Primarias:** Siempre nombradas como `id` (INTEGER PRIMARY KEY AUTOINCREMENT).
* **Claves Foráneas:** Nombradas como `<nombre_tabla_singular>_id` (ej. `usuario_id`).

### 1.3. Archivos y Directorios
* **Archivos Backend/Frontend JS y CSS:** Usar `kebab-case` o `camelCase` consistente.
  * `auth-controller.js` o `authController.js` (mantener el estilo en todo el proyecto).
  * `styles.css`
* **Rutas HTTP REST API:** Usar `kebab-case` en plural para los recursos.
  * `/api/horarios`
  * `/api/estados-emocionales`

---

## 2. Estructura de Código y Buenas Prácticas

### 2.1. Backend (Node.js & Express)
* **Manejo de Asincronía:** Usar `async/await` en lugar de Promesas encadenadas (`.then()`) o Callbacks.
* **Manejo de Errores:** Toda función asíncrona dentro de controladores debe estar envuelta en un bloque `try/catch` o utilizar un wrapper de errores.
  ```javascript
  // Ejemplo de controlador estándar
  const obtenerHorarios = async (req, res, next) => {
    try {
      const usuarioId = req.usuario.id; // Obtenido del Middleware JWT
      const horarios = await horarioModel.obtenerPorUsuario(usuarioId);
      res.status(200).json({ status: 'success', data: horarios });
    } catch (error) {
      next(error); // Delega al middleware global de errores
    }
  };
  ```

### 2.2. Seguridad en Consultas SQL (SQLite)
* **Prohibido:** Concatenar variables directamente en strings SQL (vulnerable a **SQL Injection**).
  ```javascript
  // INCORRECTO (Vulnerable)
  db.all(`SELECT * FROM horarios WHERE usuario_id = ${id}`);
  ```
* **Obligatorio:** Usar **Consultas Preparadas** con placeholders (`?`).
  ```javascript
  // CORRECTO
  db.all('SELECT * FROM horarios WHERE usuario_id = ?', [id], (err, rows) => { ... });
  ```

### 2.3. Frontend (HTML / CSS / JavaScript)
* **Modularidad:** Separar responsabilidades en archivos JS distintos (`api.js` para peticiones Fetch, `alarmas.js` para lógica de reproducción, `app.js` para manipulación del DOM).
* **Manipulación del DOM:** Utilizar delegación de eventos y métodos estándar de ES6+ (`document.querySelector`, `addEventListener`).
* **Variables CSS:** Usar variables CSS centralizadas para colores y medidas (según la Guía de Estilo Frontend).

---

## 3. Formato y Calidad de Código

### 3.1. Reglas de Estilo (ESLint & Prettier)
* **Indentación:** 2 espacios (sin tabuladores).
* **Punto y coma:** Obligatorio al final de cada sentencia.
* **Comillas:** Comillas simples `'` para JavaScript y dobles `"` para HTML/JSON.
* **Comentarios:** Comentar la intención de la función (JSDoc simple) en funciones complejas.
  ```javascript
  /**
   * Encola y reproduce secuencialmente las alarmas activas.
   * @param {Array} listaAlarmas - Array de objetos de alarma.
   */
  function procesarColaAlarmas(listaAlarmas) { ... }
  ```

---

## 4. Control de Versiones (Flujo de Git)

### 4.1. Estrategia de Ramas (Git Flow Simplificado)
* `main`: Código estable y probado para producción.
* `develop`: Rama principal de integración para desarrollo.
* `feature/<nombre-tarea>`: Ramas secundarias para nuevas funcionalidades (ej. `feature/modulo-alarmas`, `feature/login-jwt`).

### 4.2. Formato de Mensajes de Commit (Conventional Commits)
Los mensajes de commit deben tener el siguiente formato: `<tipo>: <descripción en presente/imperativo>`

* `feat:` Nueva funcionalidad para el usuario. (ej. `feat: agregar cola de reproducción de alarmas`)
* `fix:` Corrección de un error/bug. (ej. `fix: corregir validación de horas en horario`)
* `docs:` Cambios en la documentación. (ej. `docs: actualizar contrato de la API REST`)
* `style:` Cambios visuales o de formato que no afectan la lógica. (ej. `style: aplicar variables css en tarjetas`)
* `refactor:` Reestructuración de código sin cambiar comportamiento. (ej. `refactor: optimizar consulta sqlite de usuarios`)

---

## 5. Respuestas Estándar de la API REST

Todas las respuestas de la API deben seguir un esquema JSON uniforme:

### Respuestas Exitosas (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "Horario registrado correctamente",
  "data": {
    "id": 1,
    "dia": 2,
    "actividad": "Estudiar Matemáticas",
    "hora_inicio": "16:00",
    "hora_fin": "17:00"
  }
}
```

### Respuestas de Error (`400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `500 Server Error`)
```json
{
  "success": false,
  "error": {
    "code": "ERR_CONFLICTO_HORARIO",
    "message": "Ya existe una actividad programada en ese rango de tiempo"
  }
}
```