const express = require('express');
const router = express.Router();
const pagoPrestamoController = require('../../controllers/prestamos/pagoPrestamoController');
const authMiddleware = require('../../middlewares/auth');
const permissionsMiddleware = require('../../middlewares/permissions');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Realizar pago
router.post('/', 
  permissionsMiddleware(['PREST_PAGAR']), 
  pagoPrestamoController.realizarPago
);

// Listar pagos de un préstamo
router.get('/prestamo/:id_prestamo', 
  permissionsMiddleware(['PREST_LISTAR']), 
  pagoPrestamoController.listarPagos
);

module.exports = router;
