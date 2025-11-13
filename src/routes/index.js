const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth/authRoutes');
const usuarioRoutes = require('./auth/usuarioRoutes');
const clienteRoutes = require('./clientes/clienteRoutes');
const cuentaRoutes = require('./cuentas/cuentaRoutes');
const tipoCuentaRoutes = require('./cuentas/tipoCuentaRoutes');
const transaccionRoutes = require('./transacciones/transaccionRoutes');
const prestamoRoutes = require('./prestamos/prestamoRoutes');
const pagoPrestamoRoutes = require('./prestamos/pagoPrestamoRoutes');
const tipoPrestamoRoutes = require('./prestamos/tipoPrestamoRoutes');
const reporteRoutes = require('./reportes/reporteRoutes');
const agenciaRoutes = require('./administracion/agenciaRoutes');
const parametroRoutes = require('./administracion/parametroRoutes');
const bitacoraRoutes = require('./administracion/bitacoraRoutes');

// Rutas de autenticación
router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);

// Rutas de clientes
router.use('/clientes', clienteRoutes);

// Rutas de cuentas
router.use('/cuentas', cuentaRoutes);
router.use('/tipos-cuenta', tipoCuentaRoutes);

// Rutas de transacciones
router.use('/transacciones', transaccionRoutes);

// Rutas de préstamos
router.use('/prestamos', prestamoRoutes);
router.use('/pagos-prestamo', pagoPrestamoRoutes);
router.use('/tipos-prestamo', tipoPrestamoRoutes);

// Rutas de reportes
router.use('/reportes', reporteRoutes);

// Rutas de administración
router.use('/agencias', agenciaRoutes);
router.use('/parametros', parametroRoutes);
router.use('/bitacora', bitacoraRoutes);

// Ruta de bienvenida de la API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🏦 Banco Virtual API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      clientes: '/api/clientes',
      cuentas: '/api/cuentas',
      tiposCuenta: '/api/tipos-cuenta',
      transacciones: '/api/transacciones',
      prestamos: '/api/prestamos',
      pagosPrestamo: '/api/pagos-prestamo',
      tiposPrestamo: '/api/tipos-prestamo',
      reportes: '/api/reportes',
      agencias: '/api/agencias',
      parametros: '/api/parametros',
      bitacora: '/api/bitacora'
    }
  });
});

module.exports = router;
