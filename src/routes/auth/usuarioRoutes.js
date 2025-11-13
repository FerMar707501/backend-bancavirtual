const express = require('express');
const router = express.Router();
const usuarioController = require('../../controllers/auth/usuarioController');
const authMiddleware = require('../../middlewares/auth');
const permissionsMiddleware = require('../../middlewares/permissions');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Listar usuarios (requiere permiso ADMIN_USUARIOS)
router.get('/', 
  permissionsMiddleware(['ADMIN_USUARIOS']), 
  usuarioController.listar
);

// Obtener usuario por ID
router.get('/:id', 
  permissionsMiddleware(['ADMIN_USUARIOS']), 
  usuarioController.obtenerPorId
);

// Crear usuario
router.post('/', 
  permissionsMiddleware(['ADMIN_USUARIOS']), 
  usuarioController.crear
);

// Actualizar usuario
router.put('/:id', 
  permissionsMiddleware(['ADMIN_USUARIOS']), 
  usuarioController.actualizar
);

// Cambiar estado de usuario
router.patch('/:id/estado', 
  permissionsMiddleware(['ADMIN_USUARIOS']), 
  usuarioController.cambiarEstado
);

// Resetear contraseña
router.post('/:id/reset-password', 
  permissionsMiddleware(['ADMIN_USUARIOS']), 
  usuarioController.resetearPassword
);

module.exports = router;
