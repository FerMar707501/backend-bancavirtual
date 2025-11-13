const express = require('express');
const router = express.Router();
const clienteController = require('../../controllers/clientes/clienteController');
const authMiddleware = require('../../middlewares/auth');
const permissionsMiddleware = require('../../middlewares/permissions');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Listar clientes
router.get('/', 
  permissionsMiddleware(['CUENTA_LISTAR', 'CUENTA_CREAR']), 
  clienteController.listar
);

// Obtener cliente por ID
router.get('/:id', 
  permissionsMiddleware(['CUENTA_LISTAR', 'CUENTA_CREAR']), 
  clienteController.obtenerPorId
);

// Crear cliente
router.post('/', 
  permissionsMiddleware(['CUENTA_CREAR']), 
  clienteController.crear
);

// Actualizar cliente
router.put('/:id', 
  permissionsMiddleware(['CUENTA_EDITAR']), 
  clienteController.actualizar
);

// Cambiar estado de cliente
router.patch('/:id/estado', 
  permissionsMiddleware(['CUENTA_EDITAR']), 
  clienteController.cambiarEstado
);

// Actualizar KYC
router.patch('/:id/kyc', 
  permissionsMiddleware(['CUENTA_EDITAR']), 
  clienteController.actualizarKYC
);

// Gestión de teléfonos
router.post('/:id/telefonos', 
  permissionsMiddleware(['CUENTA_EDITAR']), 
  clienteController.agregarTelefono
);

router.delete('/:id/telefonos/:idTelefono', 
  permissionsMiddleware(['CUENTA_EDITAR']), 
  clienteController.eliminarTelefono
);

module.exports = router;
