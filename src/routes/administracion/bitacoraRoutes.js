const express = require('express');
const router = express.Router();
const bitacoraController = require('../../controllers/administracion/bitacoraController');
const auth = require('../../middlewares/auth');
const permissions = require('../../middlewares/permissions');

// Todas las rutas requieren autenticación
router.use(auth);

// Listar registros de bitácora - Requiere BITACORA_VER
router.get('/', 
  permissions('BITACORA_VER'), 
  bitacoraController.listar
);

// Obtener registro por ID - Requiere BITACORA_VER
router.get('/:id', 
  permissions('BITACORA_VER'), 
  bitacoraController.obtenerPorId
);

// Estadísticas de auditoría - Requiere BITACORA_VER
router.get('/estadisticas/resumen', 
  permissions('BITACORA_VER'), 
  bitacoraController.estadisticas
);

module.exports = router;
