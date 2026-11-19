/**
 * Punto de entrada principal del servidor backend.
 * Sistema de Gestión de Horarios, Alarmas y Estado Emocional Escolar.
 */
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./config/database');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const horarioRoutes = require('./routes/horarioRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales de procesamiento de entrada
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servidor de archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../public')));

// Endpoint de verificación de salud (Healthcheck)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor Backend en línea',
    data: null,
  });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de horarios
app.use('/api/horarios', horarioRoutes);

// Middleware para rutas no encontradas (404)
app.use(notFoundHandler);

// Middleware global de manejo de excepciones
app.use(errorHandler);

let server = null;

/**
 * Arranca el servidor tras inicializar la base de datos.
 */
async function startServer() {
  try {
    // 1. Inicializar la persistencia y asegurar tablas
    await initDatabase();

    // 2. Levantar el listener HTTP
    server = app.listen(PORT, () => {
      console.log(`[Servidor] Sistema de Gestión Escolar ejecutándose en el puerto ${PORT}`);
      console.log(`[Healthcheck] http://localhost:${PORT}/api/health`);
    });

    return server;
  } catch (error) {
    console.error('[Servidor Error] No se pudo inicializar la base de datos antes del arranque:', error.message);
    throw error;
  }
}

// Iniciar servidor automáticamente si se ejecuta directamente
if (require.main === module) {
  startServer().catch((err) => {
    console.error('[Servidor Fatal] Deteniendo proceso debido a error en el arranque:', err.message);
    process.exit(1);
  });
}

module.exports = { app, startServer, getServer: () => server };
