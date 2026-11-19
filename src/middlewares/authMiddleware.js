/**
 * Middleware de autenticación mediante JSON Web Tokens (JWT).
 * Sistema de Gestión de Horarios, Alarmas y Estado Emocional Escolar.
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware para validar el token JWT en el encabezado Authorization.
 * Si es válido, inyecta req.usuario = { id, email } y permite continuar.
 * Si no es válido o está ausente, retorna HTTP 401 con el esquema estándar de error.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function verificarToken(req, res, next) {
  const encabezadoAutorizacion = req.headers['authorization'];

  // Validar presencia y formato del encabezado Authorization
  if (!encabezadoAutorizacion || !encabezadoAutorizacion.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'ERR_NO_TOKEN',
        message: 'Acceso no autorizado. Se requiere un token de autenticación en formato Bearer.',
      },
    });
  }

  const tokenExtraido = encabezadoAutorizacion.slice(7).trim();

  if (!tokenExtraido) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'ERR_NO_TOKEN',
        message: 'Acceso no autorizado. Token no proporcionado.',
      },
    });
  }

  const claveSecreta = process.env.JWT_SECRET || 'supersecretkey';

  try {
    const usuarioDecodificado = jwt.verify(tokenExtraido, claveSecreta);

    req.usuario = {
      id: usuarioDecodificado.id,
      email: usuarioDecodificado.email,
    };

    return next();
  } catch (error) {
    let mensaje = 'Acceso denegado. Token no válido.';

    if (error.name === 'TokenExpiredError') {
      mensaje = 'La sesión ha expirado. Por favor, inicia sesión nuevamente.';
    } else if (error.name === 'JsonWebTokenError') {
      mensaje = 'El token de autenticación es inválido o ha sido alterado.';
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'ERR_INVALID_TOKEN',
        message: mensaje,
      },
    });
  }
}

module.exports = {
  verificarToken,
  authMiddleware: verificarToken,
};
