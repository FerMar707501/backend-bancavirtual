const express = require('express');
const router = express.Router();
const agenciaController = require('../../controllers/administracion/agenciaController');
const auth = require('../../middlewares/auth');
const permissions = require('../../middlewares/permissions');

// Todas las rutas requieren autenticación
router.use(auth);

// Listar agencias - Requiere AGENCIA_LISTAR
router.get('/', 
  permissions('AGENCIA_LISTAR'), 
  agenciaController.listar
);

// Obtener agencia por ID - Requiere AGENCIA_LISTAR
router.get('/:id', 
  permissions('AGENCIA_LISTAR'), 
  agenciaController.obtenerPorId
);

// Crear agencia - Requiere AGENCIA_CREAR
router.post('/', 
  permissions('AGENCIA_CREAR'), 
  agenciaController.crear
);

// Actualizar agencia - Requiere AGENCIA_EDITAR
router.put('/:id', 
  permissions('AGENCIA_EDITAR'), 
  agenciaController.actualizar
);

// Cambiar estado de agencia - Requiere AGENCIA_EDITAR
router.patch('/:id/estado', 
  permissions('AGENCIA_EDITAR'), 
  agenciaController.cambiarEstado
);

module.exports = router;
