# Spec Delta

## MODIFIED Requirements

### Requirement: Inicialización y ejecución del servidor
El sistema SHALL inicializar una aplicación Express, habilitar el soporte de CORS, el análisis de cuerpos JSON (`express.json()`), el servicio de archivos estáticos desde la carpeta `public/` (`express.static`), y SHALL escuchar peticiones en el puerto especificado en la variable de entorno `PORT` (usando 3000 como valor por defecto).

#### Scenario: Inicio exitoso en puerto configurado
- **WHEN** el proceso del servidor arranca con la variable `PORT` definida
- **THEN** el servidor Express comienza a escuchar en dicho puerto
- **AND** emite un mensaje en consola confirmando la inicialización del servicio

#### Scenario: Inicio con puerto por defecto
- **WHEN** el proceso arranca sin la variable `PORT` en el entorno
- **THEN** el servidor Express utiliza el puerto 3000 por defecto

#### Scenario: Servicio de archivos estáticos del frontend
- **WHEN** un cliente solicita un recurso estático disponible en `public/` (ej. `GET /index.html`)
- **THEN** el servidor Express entrega el archivo correspondiente con el tipo de contenido adecuado
