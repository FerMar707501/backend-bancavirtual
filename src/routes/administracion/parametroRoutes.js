const express = require('express');
const router = express.Router();
const parametroController = require('../../controllers/administracion/parametroController');
const auth = require('../../middlewares/auth');
const permissions = require('../../middlewares/permissions');

// Todas las rutas requieren autenticación
router.use(auth);

// Listar parámetros - Requiere PARAMETRO_LISTAR
router.get('/', 
  permissions('PARAMETRO_LISTAR'), 
  parametroController.listar
);

// Obtener parámetro por clave - Requiere PARAMETRO_LISTAR
router.get('/:clave', 
  permissions('PARAMETRO_LISTAR'), 
  parametroController.obtenerPorClave
);

// Crear parámetro - Requiere PARAMETRO_CREAR
router.post('/', 
  permissions('PARAMETRO_CREAR'), 
  parametroController.crear
);

// Actualizar parámetro - Requiere PARAMETRO_EDITAR
router.put('/:clave', 
  permissions('PARAMETRO_EDITAR'), 
  parametroController.actualizar
);

module.exports = router;
