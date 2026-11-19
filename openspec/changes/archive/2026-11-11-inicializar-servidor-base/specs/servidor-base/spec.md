# Spec Delta

## Purpose
Proporcionar el punto de entrada del servidor HTTP con Express, configuración de entorno y el endpoint de comprobación de salud para validar la disponibilidad operativa del backend.

## ADDED Requirements

### Requirement: Inicialización y ejecución del servidor
El sistema SHALL inicializar una aplicación Express, habilitar el soporte de CORS y el análisis de cuerpos JSON (`express.json()`), y SHALL escuchar peticiones en el puerto especificado en la variable de entorno `PORT` (usando 3000 como valor por defecto).

#### Scenario: Inicio exitoso en puerto configurado
- **WHEN** el proceso del servidor arranca con la variable `PORT` definida
- **THEN** el servidor Express comienza a escuchar en dicho puerto
- **AND** emite un mensaje en consola confirmando la inicialización del servicio

#### Scenario: Inicio con puerto por defecto
- **WHEN** el proceso arranca sin la variable `PORT` en el entorno
- **THEN** el servidor Express utiliza el puerto 3000 por defecto

### Requirement: Endpoint de comprobación de salud (Healthcheck)
El sistema SHALL exponer una ruta pública `GET /api/health` accesible sin autenticación que certifique que el servidor backend está en línea y operando.

#### Scenario: Consulta de salud exitosa
- **WHEN** un cliente envía una petición `GET /api/health`
- **THEN** el sistema responde con código HTTP 200 OK
- **AND** el cuerpo de la respuesta contiene el formato estándar: `{"success": true, "message": "Servidor Backend en línea", "data": null}`

### Requirement: Configuración de variables de entorno
El sistema SHALL cargar las variables de entorno desde un archivo `.env` al iniciar la aplicación utilizando `dotenv`, y SHALL proveer una plantilla `.env.example` versionada en el repositorio.

#### Scenario: Carga de variables locales
- **WHEN** existe un archivo `.env` en la raíz del proyecto
- **THEN** las variables definidas en él están disponibles en `process.env` durante la ejecución
