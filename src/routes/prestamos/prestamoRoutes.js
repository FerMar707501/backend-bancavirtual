const express = require('express');
const router = express.Router();
const prestamoController = require('../../controllers/prestamos/prestamoController');
const authMiddleware = require('../../middlewares/auth');
const permissionsMiddleware = require('../../middlewares/permissions');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Listar préstamos
router.get('/', 
  permissionsMiddleware(['PREST_LISTAR']), 
  prestamoController.listar
);

// Obtener préstamo por ID
router.get('/:id', 
  permissionsMiddleware(['PREST_LISTAR']), 
  prestamoController.obtenerPorId
);

// Solicitar préstamo
router.post('/solicitar', 
  permissionsMiddleware(['PREST_SOLICITAR']), 
  prestamoController.solicitar
);

// Aprobar préstamo
router.post('/:id/aprobar', 
  permissionsMiddleware(['PREST_APROBAR']), 
  prestamoController.aprobar
);

// Desembolsar préstamo
router.post('/:id/desembolsar', 
  permissionsMiddleware(['PREST_DESEMBOLSAR']), 
  prestamoController.desembolsar
);

// Rechazar préstamo
router.post('/:id/rechazar', 
  permissionsMiddleware(['PREST_EVALUAR']), 
  prestamoController.rechazar
);

module.exports = router;
