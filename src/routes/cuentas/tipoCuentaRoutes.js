const express = require('express');
const router = express.Router();
const tipoCuentaController = require('../../controllers/cuentas/tipoCuentaController');
const authMiddleware = require('../../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Listar tipos de cuenta
router.get('/', tipoCuentaController.listar);

// Obtener tipo de cuenta por ID
router.get('/:id', tipoCuentaController.obtenerPorId);

module.exports = router;
