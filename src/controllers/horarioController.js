/**
 * Controlador para la gestión del horario escolar.
 * Sistema de Gestión de Horarios, Alarmas y Estado Emocional Escolar.
 */

const { all, run } = require('../config/database');

// Expresión regular para validar formato 24 horas (00:00 - 23:59)
const HORA_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Obtiene las actividades del horario para el usuario autenticado.
 * Ruta: GET /api/horarios
 * Soporta filtro opcional por query: ?dia=1..7
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function obtenerHorarios(req, res, next) {
  try {
    const usuarioId = req.usuario.id;
    const { dia } = req.query;

    let sql = 'SELECT id, usuario_id, dia, actividad, hora_inicio, hora_fin, creado_en FROM horarios WHERE usuario_id = ?';
    const params = [usuarioId];

    // Validación y aplicación del filtro opcional por día
    if (dia !== undefined) {
      const diaNum = Number(dia);
      if (!Number.isInteger(diaNum) || diaNum < 1 || diaNum > 7) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ERR_INVALID_DAY',
            message: 'El parámetro día debe ser un número entero entre 1 y 7.',
          },
        });
      }

      sql += ' AND dia = ?';
      params.push(diaNum);
    }

    // Ordenar ascendentemente por día y hora de inicio
    sql += ' ORDER BY dia ASC, hora_inicio ASC';

    const horarios = await all(sql, params);

    return res.status(200).json({
      success: true,
      message: 'Horarios obtenidos exitosamente',
      data: horarios,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Crea una nueva actividad en el horario del usuario autenticado.
 * Ruta: POST /api/horarios
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function crearHorario(req, res, next) {
  try {
    const usuarioId = req.usuario.id;
    const { dia, actividad, hora_inicio, hora_fin } = req.body;

    // 1. Validar presencia de todos los campos
    if (dia === undefined || !actividad || !hora_inicio || !hora_fin) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ERR_VALIDATION_DATA',
          message: 'Todos los campos son obligatorios: dia, actividad, hora_inicio, hora_fin.',
        },
      });
    }

    const actividadLimpia = typeof actividad === 'string' ? actividad.trim() : '';

    if (!actividadLimpia) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ERR_VALIDATION_DATA',
          message: 'La actividad no puede estar vacía.',
        },
      });
    }

    // 2. Validar que dia sea un entero entre 1 y 7
    const diaNum = Number(dia);
    if (!Number.isInteger(diaNum) || diaNum < 1 || diaNum > 7) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ERR_VALIDATION_DATA',
          message: 'El día debe ser un número entero entre 1 (Lunes) y 7 (Domingo).',
        },
      });
    }

    // 3. Validar formato 24 horas HH:MM
    if (typeof hora_inicio !== 'string' || !HORA_REGEX.test(hora_inicio)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ERR_VALIDATION_DATA',
          message: 'La hora de inicio debe tener el formato de 24 horas HH:MM (ej. 08:30).',
        },
      });
    }

    if (typeof hora_fin !== 'string' || !HORA_REGEX.test(hora_fin)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ERR_VALIDATION_DATA',
          message: 'La hora de fin debe tener el formato de 24 horas HH:MM (ej. 09:30).',
        },
      });
    }

    // 4. Validar que hora_inicio sea cronológicamente anterior a hora_fin
    if (hora_inicio >= hora_fin) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ERR_VALIDATION_DATA',
          message: 'La hora de inicio debe ser anterior a la hora de fin.',
        },
      });
    }

    // 5. Inserción parametrizada en SQLite
    const resultado = await run(
      'INSERT INTO horarios (usuario_id, dia, actividad, hora_inicio, hora_fin) VALUES (?, ?, ?, ?, ?)',
      [usuarioId, diaNum, actividadLimpia, hora_inicio, hora_fin]
    );

    return res.status(201).json({
      success: true,
      message: 'Horario creado exitosamente',
      data: {
        id: resultado.lastID,
        usuario_id: usuarioId,
        dia: diaNum,
        actividad: actividadLimpia,
        hora_inicio,
        hora_fin,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  obtenerHorarios,
  crearHorario,
};
