const express = require('express');
const router = express.Router();
const cuentaController = require('../../controllers/cuentas/cuentaController');
const authMiddleware = require('../../middlewares/auth');
const permissionsMiddleware = require('../../middlewares/permissions');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener mis cuentas (para clientes)
router.get('/mis-cuentas', 
  permissionsMiddleware(['CUENTA_LISTAR']), 
  cuentaController.misCuentas
);

// Listar cuentas
router.get('/', 
  permissionsMiddleware(['ADMIN_CUENTAS', 'ADMIN_USUARIOS']), 
  cuentaController.listar
);

// Obtener cuenta por ID
router.get('/:id', 
  permissionsMiddleware(['ADMIN_CUENTAS', 'ADMIN_USUARIOS']), 
  cuentaController.obtenerPorId
);

// Obtener cuenta por número
router.get('/numero/:numero_cuenta', 
  permissionsMiddleware(['ADMIN_CUENTAS', 'ADMIN_USUARIOS']), 
  cuentaController.obtenerPorNumero
);

// Consultar saldo
router.get('/:id/saldo', 
  permissionsMiddleware(['ADMIN_CUENTAS', 'ADMIN_USUARIOS']), 
  cuentaController.consultarSaldo
);

// Crear cuenta
router.post('/', 
  permissionsMiddleware(['ADMIN_CUENTAS', 'ADMIN_USUARIOS']), 
  cuentaController.crear
);

// Bloquear/Desbloquear cuenta
router.patch('/:id/bloquear', 
  permissionsMiddleware(['ADMIN_CUENTAS', 'ADMIN_USUARIOS']), 
  cuentaController.bloquear
);

// Cerrar cuenta
router.patch('/:id/cerrar', 
  permissionsMiddleware(['ADMIN_CUENTAS', 'ADMIN_USUARIOS']), 
  cuentaController.cerrar
);

module.exports = router;
