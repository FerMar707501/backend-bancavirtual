const express = require('express');
const router = express.Router();
const prestamoController = require('../../controllers/prestamos/prestamoController');
const authMiddleware = require('../../middlewares/auth');
const permissionsMiddleware = require('../../middlewares/permissions');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Listar préstamos
router.get('/', 
  permissionsMiddleware(['ADMIN_PRESTAMOS', 'ADMIN_USUARIOS']), 
  prestamoController.listar
);

// Obtener préstamo por ID
router.get('/:id', 
  permissionsMiddleware(['ADMIN_PRESTAMOS', 'ADMIN_USUARIOS']), 
  prestamoController.obtenerPorId
);

// Solicitar préstamo
router.post('/solicitar', 
  permissionsMiddleware(['ADMIN_PRESTAMOS', 'ADMIN_USUARIOS']), 
  prestamoController.solicitar
);

// Aprobar préstamo
router.post('/:id/aprobar', 
  permissionsMiddleware(['ADMIN_PRESTAMOS', 'ADMIN_USUARIOS']), 
  prestamoController.aprobar
);

// Desembolsar préstamo
router.post('/:id/desembolsar', 
  permissionsMiddleware(['ADMIN_PRESTAMOS', 'ADMIN_USUARIOS']), 
  prestamoController.desembolsar
);

// Rechazar préstamo
router.post('/:id/rechazar', 
  permissionsMiddleware(['ADMIN_PRESTAMOS', 'ADMIN_USUARIOS']), 
  prestamoController.rechazar
);

module.exports = router;
