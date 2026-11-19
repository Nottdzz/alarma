/**
 * Enrutador para operaciones de autenticación.
 * Sistema de Gestión de Horarios, Alarmas y Estado Emocional Escolar.
 */

const express = require('express');
const { registrarUsuario, iniciarSesion } = require('../controllers/authController');

const router = express.Router();

// Ruta pública para registro de nuevo usuario
router.post('/register', registrarUsuario);

// Ruta pública para inicio de sesión
router.post('/login', iniciarSesion);

module.exports = router;
