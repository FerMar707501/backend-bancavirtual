const express = require('express');
const router = express.Router();
const tipoPrestamoController = require('../../controllers/prestamos/tipoPrestamoController');
const authMiddleware = require('../../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Listar tipos de préstamo
router.get('/', tipoPrestamoController.listar);

// Obtener tipo de préstamo por ID
router.get('/:id', tipoPrestamoController.obtenerPorId);

module.exports = router;
