# Proposal

## Why
El proyecto requiere establecer los cimientos del backend en Node.js y Express conforme a la arquitectura desacoplada en 3 capas definida en el Documento de Diseño del Sistema (SDD). Hasta ahora no se cuenta con el servidor en ejecución, las dependencias esenciales ni un mecanismo de comprobación de estado (healthcheck), lo que impide el desarrollo y despliegue de las APIs de negocio.

## What Changes
- Inicialización y configuración de dependencias de producción en `package.json`: `express`, `cors`, `dotenv`, `sqlite3`, `bcrypt`, `jsonwebtoken`, y `nodemon` como dependencia de desarrollo.
- Creación de la plantilla de variables de entorno `.env.example` y su configuración para ejecución local.
- Creación del archivo de entrada `/src/server.js` con configuración de Express, middlewares globales (`cors`, `express.json()`) y manejo de cierre graceful.
- Implementación de un endpoint de comprobación de salud (`GET /api/health`) que responda con el formato estándar de respuesta del proyecto.
- Establecimiento de la estructura modular dentro de `/src/`: `config/`, `controllers/`, `middlewares/`, `routes/`.

**Alcance del cambio:**
- Configuración del servidor base, variables de entorno y healthcheck.
- Estructura de carpetas requerida en `/src`.

**Fuera del alcance:**
- Implementación de rutas de negocio específicas (autenticación, horarios, alarmas, notas, emociones).
- Conexión e inicialización de las tablas de la base de datos SQLite (se abordará en su respectiva especificación/cambio).

## Capabilities

### New Capabilities
- `servidor-base`: Provee la inicialización del servidor HTTP Express, configuración del entorno y el endpoint de verificación de salud del sistema (`GET /api/health`).

### Modified Capabilities
<!-- No requirement changes to existing capabilities -->

## Impact
- **Dependencias**: Se incorporan `express`, `cors`, `dotenv`, `sqlite3`, `bcrypt`, `jsonwebtoken` y `nodemon`.
- **APIs**: Se publica el endpoint público `GET /api/health`.
- **Estructura del proyecto**: Se formaliza el punto de entrada en `/src/server.js` y las subcarpetas de arquitectura modular.
