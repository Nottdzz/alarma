/**
 * Enrutador para operaciones del horario escolar.
 * Sistema de Gestión de Horarios, Alarmas y Estado Emocional Escolar.
 */

const express = require('express');
const { obtenerHorarios, crearHorario } = require('../controllers/horarioController');
const { verificarToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Todas las rutas de horarios requieren autenticación previa
router.use(verificarToken);

// GET /api/horarios (con soporte para ?dia=1..7)
router.get('/', obtenerHorarios);

// POST /api/horarios
router.post('/', crearHorario);

module.exports = router;
