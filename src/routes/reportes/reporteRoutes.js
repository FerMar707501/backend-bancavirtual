const express = require('express');
const router = express.Router();
const reporteController = require('../../controllers/reportes/reporteController');
const auth = require('../../middlewares/auth');
const permissions = require('../../middlewares/permissions');

// Todas las rutas requieren autenticación
router.use(auth);

// Reporte de transacciones - Requiere permiso REPORTE_VER
router.get('/transacciones', 
  permissions('REPORTE_VER'), 
  reporteController.transacciones
);

// Reporte de clientes - Requiere permiso REPORTE_VER
router.get('/clientes', 
  permissions('REPORTE_VER'), 
  reporteController.clientes
);

// Reporte de préstamos - Requiere permiso REPORTE_VER
router.get('/prestamos', 
  permissions('REPORTE_VER'), 
  reporteController.prestamos
);

// Reporte de morosidad - Requiere permiso REPORTE_VER
router.get('/morosidad', 
  permissions('REPORTE_VER'), 
  reporteController.morosidad
);

// Estado de cuenta - Requiere permiso CUENTA_LISTAR
router.get('/estado-cuenta/:idCuenta', 
  permissions('CUENTA_LISTAR'), 
  reporteController.estadoCuenta
);

module.exports = router;
