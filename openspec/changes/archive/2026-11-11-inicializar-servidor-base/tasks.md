# Tasks

## 1. Configuración de Dependencias y Entorno

- [x] 1.1 Instalar dependencias de producción (`express`, `cors`, `dotenv`, `sqlite3`, `bcrypt`, `jsonwebtoken`) y de desarrollo (`nodemon`) en `package.json`, verificando que la instalación finalice sin errores.
- [x] 1.2 Crear el archivo `.env.example` con las variables base (`PORT=3000`, `JWT_SECRET=supersecretkey`), generar el archivo `.env` local y verificar que `.env` esté correctamente ignorado por `.gitignore`.

## 2. Estructura Modular y Servidor Base

- [x] 2.1 Verificar y asegurar la estructura de directorios en `/src` (`config/`, `controllers/`, `middlewares/`, `routes/`) incorporando archivos `.gitkeep` donde sea necesario para mantener la estructura en Git.
- [x] 2.2 Implementar el archivo `/src/server.js` utilizando sintaxis CommonJS, cargando variables de entorno con `dotenv`, configurando middlewares globales (`cors`, `express.json()`) y escuchando en el puerto configurado (`PORT || 3000`).
- [x] 2.3 Implementar el endpoint de healthcheck `GET /api/health` retornando código HTTP 200 con el payload estándar `{ "success": true, "message": "Servidor Backend en línea", "data": null }`.

## 3. Verificación Operativa

- [x] 3.1 Iniciar el servidor localmente y verificar que una petición HTTP a `GET http://localhost:3000/api/health` responda con código 200 OK y el JSON esperado.
