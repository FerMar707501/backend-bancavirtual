const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/authController');
const authMiddleware = require('../../middlewares/auth');

// Rutas públicas
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

// Rutas protegidas (requieren autenticación)
router.post('/logout', authMiddleware, authController.logout);
router.get('/profile', authMiddleware, authController.getProfile);
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
