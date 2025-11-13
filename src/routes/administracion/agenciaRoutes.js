const express = require('express');
const router = express.Router();
const agenciaController = require('../../controllers/administracion/agenciaController');
const auth = require('../../middlewares/auth');
const permissions = require('../../middlewares/permissions');

// Todas las rutas requieren autenticación
router.use(auth);

// Listar agencias - Requiere ADMIN_AGENCIAS
router.get('/', 
  permissions(['ADMIN_AGENCIAS', 'ADMIN_USUARIOS']), 
  agenciaController.listar
);

// Obtener agencia por ID - Requiere ADMIN_AGENCIAS
router.get('/:id', 
  permissions(['ADMIN_AGENCIAS', 'ADMIN_USUARIOS']), 
  agenciaController.obtenerPorId
);

// Crear agencia - Requiere ADMIN_AGENCIAS
router.post('/', 
  permissions(['ADMIN_AGENCIAS']), 
  agenciaController.crear
);

// Actualizar agencia - Requiere ADMIN_AGENCIAS
router.put('/:id', 
  permissions(['ADMIN_AGENCIAS']), 
  agenciaController.actualizar
);

// Cambiar estado de agencia - Requiere ADMIN_AGENCIAS
router.patch('/:id/estado', 
  permissions(['ADMIN_AGENCIAS']), 
  agenciaController.cambiarEstado
);

module.exports = router;
