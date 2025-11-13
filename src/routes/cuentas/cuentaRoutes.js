const express = require('express');
const router = express.Router();
const cuentaController = require('../../controllers/cuentas/cuentaController');
const authMiddleware = require('../../middlewares/auth');
const permissionsMiddleware = require('../../middlewares/permissions');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Listar cuentas
router.get('/', 
  permissionsMiddleware(['CUENTA_LISTAR']), 
  cuentaController.listar
);

// Obtener cuenta por ID
router.get('/:id', 
  permissionsMiddleware(['CUENTA_LISTAR']), 
  cuentaController.obtenerPorId
);

// Obtener cuenta por número
router.get('/numero/:numero_cuenta', 
  permissionsMiddleware(['CUENTA_LISTAR']), 
  cuentaController.obtenerPorNumero
);

// Consultar saldo
router.get('/:id/saldo', 
  permissionsMiddleware(['CUENTA_LISTAR', 'TRANS_DEPOSITO']), 
  cuentaController.consultarSaldo
);

// Crear cuenta
router.post('/', 
  permissionsMiddleware(['CUENTA_CREAR']), 
  cuentaController.crear
);

// Bloquear/Desbloquear cuenta
router.patch('/:id/bloquear', 
  permissionsMiddleware(['CUENTA_BLOQUEAR']), 
  cuentaController.bloquear
);

// Cerrar cuenta
router.patch('/:id/cerrar', 
  permissionsMiddleware(['CUENTA_BLOQUEAR']), 
  cuentaController.cerrar
);

module.exports = router;
