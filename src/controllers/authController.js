/**
 * Controlador de autenticación de usuarios.
 * Sistema de Gestión de Horarios, Alarmas y Estado Emocional Escolar.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { get, run } = require('../config/database');

// Expresión regular para validación básica y robusta de formato de correo
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Registra un nuevo usuario escolar.
 * Ruta: POST /api/auth/register
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function registrarUsuario(req, res, next) {
  try {
    const { nombre, email, password } = req.body;

    // 1. Validar presencia de campos
    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ERR_VALIDATION_DATA',
          message: 'Los campos nombre, email y password son obligatorios.',
        },
      });
    }

    const nombreLimpio = typeof nombre === 'string' ? nombre.trim() : '';
    const emailLimpio = typeof email === 'string' ? email.trim() : '';
    const passwordTexto = typeof password === 'string' ? password : '';

    // Validar que no contengan únicamente espacios
    if (!nombreLimpio || !emailLimpio || !passwordTexto.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ERR_VALIDATION_DATA',
          message: 'Los campos no pueden estar vacíos ni contener solo espacios.',
        },
      });
    }

    // 2. Validar formato de email
    if (!EMAIL_REGEX.test(emailLimpio)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ERR_VALIDATION_DATA',
          message: 'El formato del correo electrónico proporcionado no es válido.',
        },
      });
    }

    // 3. Validar longitud mínima de password (mínimo 6 caracteres)
    if (passwordTexto.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ERR_VALIDATION_DATA',
          message: 'La contraseña debe contener al menos 6 caracteres.',
        },
      });
    }

    const emailNormalizado = emailLimpio.toLowerCase();

    // 4. Verificar si el correo ya existe en la base de datos
    const usuarioExistente = await get('SELECT id FROM usuarios WHERE email = ?', [emailNormalizado]);

    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'ERR_EMAIL_EXISTS',
          message: 'El correo electrónico ya se encuentra registrado.',
        },
      });
    }

    // 5. Cifrado de contraseña con bcrypt (factor de costo 10)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(passwordTexto, saltRounds);

    // 6. Inserción parametrizada en SQLite
    const resultado = await run(
      'INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)',
      [nombreLimpio, emailNormalizado, passwordHash]
    );

    // 7. Respuesta HTTP 201 Created excluyendo password_hash
    return res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      data: {
        id: resultado.lastID,
        nombre: nombreLimpio,
        email: emailNormalizado,
      },
    });
  } catch (error) {
    // Manejo de condición de carrera si SQLite dispara error de unicidad
    if (error.message && error.message.includes('UNIQUE constraint failed: usuarios.email')) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'ERR_EMAIL_EXISTS',
          message: 'El correo electrónico ya se encuentra registrado.',
        },
      });
    }

    return next(error);
  }
}

/**
 * Inicia sesión de un usuario escolar existente.
 * Ruta: POST /api/auth/login
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function iniciarSesion(req, res, next) {
  try {
    const { email, password } = req.body;

    // 1. Validar presencia de campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ERR_MISSING_CREDENTIALS',
          message: 'Los campos email y password son requeridos para iniciar sesión.',
        },
      });
    }

    const emailLimpio = typeof email === 'string' ? email.trim() : '';
    const passwordTexto = typeof password === 'string' ? password : '';

    if (!emailLimpio || !passwordTexto.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ERR_MISSING_CREDENTIALS',
          message: 'El email y la contraseña no pueden estar vacíos ni contener únicamente espacios.',
        },
      });
    }

    const emailNormalizado = emailLimpio.toLowerCase();

    // 2. Consultar usuario en SQLite mediante consulta preparada
    const usuario = await get(
      'SELECT id, nombre, email, password_hash FROM usuarios WHERE email = ?',
      [emailNormalizado]
    );

    // Mensaje unificado para evitar enumeración de usuarios
    const errorCredencialesInvalidas = {
      code: 'ERR_INVALID_CREDENTIALS',
      message: 'Correo electrónico o contraseña incorrectos.',
    };

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: errorCredencialesInvalidas,
      });
    }

    // 3. Comparar contraseña con el hash almacenado
    const passwordCoincide = await bcrypt.compare(passwordTexto, usuario.password_hash);

    if (!passwordCoincide) {
      return res.status(401).json({
        success: false,
        error: errorCredencialesInvalidas,
      });
    }

    // 4. Generar token JWT con vigencia de 24 horas
    const jwtSecret = process.env.JWT_SECRET || 'supersecretkey';
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // 5. Respuesta exitosa HTTP 200 OK excluyendo password_hash
    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  registrarUsuario,
  iniciarSesion,
};
