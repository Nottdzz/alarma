/**
 * Middlewares para control de rutas no encontradas y excepciones globales.
 * Sistema de Gestión de Horarios, Alarmas y Estado Emocional Escolar.
 */

/**
 * Clase para representar errores operacionales controlados en la aplicación.
 */
class AppError extends Error {
  /**
   * @param {number} statusCode - Código de estado HTTP (ej. 400, 401, 404).
   * @param {string} code - Identificador legible del error (ej. 'ERR_NOT_FOUND').
   * @param {string} message - Descripción clara del motivo del fallo.
   */
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware para capturar cualquier ruta no registrada (404 Not Found).
 */
function notFoundHandler(req, res, next) {
  const error = new AppError(
    404,
    'ERR_NOT_FOUND',
    `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  );
  next(error);
}

/**
 * Middleware global de manejo de excepciones de Express.
 * Debe conservar siempre los 4 parámetros (err, req, res, next).
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'ERR_INTERNAL_SERVER_ERROR';
  const message = err.message || 'Error interno del servidor';

  // Registrar en consola errores inesperados del servidor (500)
  if (statusCode >= 500) {
    console.error('[Error No Controlado]', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler,
};
