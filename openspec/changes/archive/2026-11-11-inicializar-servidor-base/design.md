# Design

## Context
Ver motivación en `proposal.md`. El backend se diseña como una API REST desacoplada que dará servicio al frontend web. Actualmente el repositorio cuenta con la estructura de especificaciones OpenSpec y la documentación SDD, pero carece de la implementación del servidor Express ejecutable.

## Goals / Non-Goals

**Goals:**
- Configurar un servidor Express robusto y predecible en `/src/server.js`.
- Proveer el endpoint de prueba de salud `GET /api/health` con el formato JSON estándar del proyecto.
- Establecer las dependencias esenciales de producción y desarrollo en `package.json`.
- Establecer el esquema de variables de entorno mediante `.env.example`.
- Dejar organizada la estructura de carpetas en `/src` para la futura integración de controladores, rutas y middlewares.

**Non-Goals:**
- Conectar o inicializar la base de datos SQLite en esta etapa.
- Implementar middlewares de autenticación JWT o controladores de negocio (horarios, alarmas, notas).

## Decisions

### Decisión 1: Sistema de módulos CommonJS
- **Elección:** Utilizar sintaxis CommonJS (`require` / `module.exports`) de forma coherente en todo el backend.
- **Racional:** Provee máxima compatibilidad con librerías que contienen extensiones nativas en C/C++ como `sqlite3` y `bcrypt`, reduciendo fricciones de resolución de módulos en Node.js.
- **Alternativa descartada:** ES Modules (`import`/`export`), descartado para evitar complicaciones con bindings de `sqlite3` o necesidad de flags experimentales en ciertas versiones de Node.

### Decisión 2: Formato estándar de respuesta JSON
- **Elección:** Seguir estrictamente la convención del proyecto definida en `openspec/config.yaml`:
  ```json
  {
    "success": true,
    "message": "Servidor Backend en línea",
    "data": null
  }
  ```
- **Racional:** Mantiene uniformidad entre todos los endpoints del sistema tanto para el healthcheck como para futuras APIs.

### Decisión 3: Arquitectura y punto de entrada
- **Punto de entrada:** `/src/server.js`.
- **Estructura en `/src`:**
  - `config/`: Para configuraciones futuras (ej. conexión de base de datos).
  - `controllers/`: Para lógica de negocio por recurso.
  - `middlewares/`: Para autenticación y control de errores globales.
  - `routes/`: Para definición y montaje de rutas de la API.

## Risks / Trade-offs

- **[Riesgo: Puerto ocupado al iniciar el servidor]** → **Mitigación**: Manejar el evento de error `EADDRINUSE` o permitir sobreescribir el puerto fácilmente vía la variable de entorno `PORT`.
- **[Riesgo: Fuga de variables sensibles en Git]** → **Mitigación**: `.env` ya se encuentra protegido e ignorado en `.gitignore`; solo se comitea `.env.example`.
