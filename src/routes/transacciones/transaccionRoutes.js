const express = require('express');
const router = express.Router();
const transaccionController = require('../../controllers/transacciones/transaccionController');
const authMiddleware = require('../../middlewares/auth');
const permissionsMiddleware = require('../../middlewares/permissions');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Listar transacciones
router.get('/', 
  permissionsMiddleware(['TRANS_LISTAR']), 
  transaccionController.listar
);

// Obtener transacción por ID
router.get('/:id', 
  permissionsMiddleware(['TRANS_LISTAR']), 
  transaccionController.obtenerPorId
);

// Historial de una cuenta
router.get('/cuenta/:id_cuenta/historial', 
  permissionsMiddleware(['TRANS_LISTAR', 'CUENTA_LISTAR']), 
  transaccionController.historialCuenta
);

// Realizar depósito
router.post('/deposito', 
  permissionsMiddleware(['TRANS_DEPOSITO']), 
  transaccionController.deposito
);

// Realizar retiro
router.post('/retiro', 
  permissionsMiddleware(['TRANS_RETIRO']), 
  transaccionController.retiro
);

// Realizar transferencia
router.post('/transferencia', 
  permissionsMiddleware(['TRANS_TRANSFERENCIA']), 
  transaccionController.transferencia
);

module.exports = router;
