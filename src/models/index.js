const { sequelize } = require('../config/database');

// Importar todos los modelos
// Auth
const Usuario = require('./auth/Usuario');
const Rol = require('./auth/Rol');
const Permiso = require('./auth/Permiso');

// Catalogos
const Agencia = require('./catalogos/Agencia');
const RolPermiso = require('./catalogos/RolPermiso');
const ParametroSistema = require('./catalogos/ParametroSistema');

// Clientes
const Cliente = require('./clientes/Cliente');
const TelefonoCliente = require('./clientes/TelefonoCliente');

// Cuentas
const Cuenta = require('./cuentas/Cuenta');
const TipoCuenta = require('./cuentas/TipoCuenta');

// Transacciones
const Transaccion = require('./transacciones/Transaccion');
const TipoTransaccion = require('./transacciones/TipoTransaccion');
const Reverso = require('./transacciones/Reverso');
const PagoRecurrente = require('./transacciones/PagoRecurrente');

// Prestamos
const Prestamo = require('./prestamos/Prestamo');
const TipoPrestamo = require('./prestamos/TipoPrestamo');
const PlanPago = require('./prestamos/PlanPago');
const PagoPrestamo = require('./prestamos/PagoPrestamo');

// Auditoria
const Bitacora = require('./auditoria/Bitacora');

// ============================================================================
// DEFINIR ASOCIACIONES
// ============================================================================

// ----------------------------------------------------------------------------
// RELACIONES DE USUARIOS Y ROLES
// ----------------------------------------------------------------------------

// Usuario pertenece a un Rol
Usuario.belongsTo(Rol, {
  foreignKey: 'id_rol',
  as: 'rol'
});

// Rol tiene muchos Usuarios
Rol.hasMany(Usuario, {
  foreignKey: 'id_rol',
  as: 'usuarios'
});

// Usuario pertenece a una Agencia
Usuario.belongsTo(Agencia, {
  foreignKey: 'id_agencia',
  as: 'agencia'
});

// Agencia tiene muchos Usuarios
Agencia.hasMany(Usuario, {
  foreignKey: 'id_agencia',
  as: 'usuarios'
});

// ----------------------------------------------------------------------------
// RELACIONES MANY-TO-MANY: ROLES Y PERMISOS
// ----------------------------------------------------------------------------

Rol.belongsToMany(Permiso, {
  through: RolPermiso,
  foreignKey: 'id_rol',
  otherKey: 'id_permiso',
  as: 'permisos'
});

Permiso.belongsToMany(Rol, {
  through: RolPermiso,
  foreignKey: 'id_permiso',
  otherKey: 'id_rol',
  as: 'roles'
});

// ----------------------------------------------------------------------------
// RELACIONES DE CLIENTES
// ----------------------------------------------------------------------------

// Cliente tiene muchos Telefonos
Cliente.hasMany(TelefonoCliente, {
  foreignKey: 'id_cliente',
  as: 'telefonos',
  onDelete: 'CASCADE'
});

// Telefono pertenece a un Cliente
TelefonoCliente.belongsTo(Cliente, {
  foreignKey: 'id_cliente',
  as: 'cliente'
});

// Cliente tiene muchas Cuentas
Cliente.hasMany(Cuenta, {
  foreignKey: 'id_cliente',
  as: 'cuentas'
});

// Cliente tiene muchos Prestamos
Cliente.hasMany(Prestamo, {
  foreignKey: 'id_cliente',
  as: 'prestamos'
});

// ----------------------------------------------------------------------------
// RELACIONES DE CUENTAS
// ----------------------------------------------------------------------------

// Cuenta pertenece a un Cliente
Cuenta.belongsTo(Cliente, {
  foreignKey: 'id_cliente',
  as: 'cliente'
});

// Cuenta pertenece a un TipoCuenta
Cuenta.belongsTo(TipoCuenta, {
  foreignKey: 'id_tipo_cuenta',
  as: 'tipoCuenta'
});

// TipoCuenta tiene muchas Cuentas
TipoCuenta.hasMany(Cuenta, {
  foreignKey: 'id_tipo_cuenta',
  as: 'cuentas'
});

// Cuenta pertenece a una Agencia
Cuenta.belongsTo(Agencia, {
  foreignKey: 'id_agencia',
  as: 'agencia'
});

// Agencia tiene muchas Cuentas
Agencia.hasMany(Cuenta, {
  foreignKey: 'id_agencia',
  as: 'cuentas'
});

// Cuenta tiene muchos Pagos Recurrentes
Cuenta.hasMany(PagoRecurrente, {
  foreignKey: 'id_cuenta',
  as: 'pagosRecurrentes'
});

// PagoRecurrente pertenece a una Cuenta
PagoRecurrente.belongsTo(Cuenta, {
  foreignKey: 'id_cuenta',
  as: 'cuenta'
});

// ----------------------------------------------------------------------------
// RELACIONES DE TRANSACCIONES
// ----------------------------------------------------------------------------

// Transaccion pertenece a un TipoTransaccion
Transaccion.belongsTo(TipoTransaccion, {
  foreignKey: 'id_tipo_transaccion',
  as: 'tipoTransaccion'
});

// TipoTransaccion tiene muchas Transacciones
TipoTransaccion.hasMany(Transaccion, {
  foreignKey: 'id_tipo_transaccion',
  as: 'transacciones'
});

// Transaccion pertenece a Cuenta Origen
Transaccion.belongsTo(Cuenta, {
  foreignKey: 'id_cuenta_origen',
  as: 'cuentaOrigen'
});

// Transaccion pertenece a Cuenta Destino
Transaccion.belongsTo(Cuenta, {
  foreignKey: 'id_cuenta_destino',
  as: 'cuentaDestino'
});

// Transaccion pertenece a Usuario
Transaccion.belongsTo(Usuario, {
  foreignKey: 'id_usuario',
  as: 'usuario'
});

// Transaccion pertenece a Agencia
Transaccion.belongsTo(Agencia, {
  foreignKey: 'id_agencia',
  as: 'agencia'
});

// ----------------------------------------------------------------------------
// RELACIONES DE REVERSOS
// ----------------------------------------------------------------------------

// Reverso pertenece a Transaccion Original
Reverso.belongsTo(Transaccion, {
  foreignKey: 'id_transaccion_original',
  as: 'transaccionOriginal'
});

// Reverso pertenece a Transaccion de Reverso
Reverso.belongsTo(Transaccion, {
  foreignKey: 'id_transaccion_reverso',
  as: 'transaccionReverso'
});

// Reverso pertenece a Usuario que autoriza
Reverso.belongsTo(Usuario, {
  foreignKey: 'id_usuario_autoriza',
  as: 'usuarioAutoriza'
});

// ----------------------------------------------------------------------------
// RELACIONES DE PRESTAMOS
// ----------------------------------------------------------------------------

// Prestamo pertenece a un Cliente
Prestamo.belongsTo(Cliente, {
  foreignKey: 'id_cliente',
  as: 'cliente'
});

// Prestamo pertenece a un TipoPrestamo
Prestamo.belongsTo(TipoPrestamo, {
  foreignKey: 'id_tipo_prestamo',
  as: 'tipoPrestamo'
});

// TipoPrestamo tiene muchos Prestamos
TipoPrestamo.hasMany(Prestamo, {
  foreignKey: 'id_tipo_prestamo',
  as: 'prestamos'
});

// Prestamo pertenece a una Agencia
Prestamo.belongsTo(Agencia, {
  foreignKey: 'id_agencia',
  as: 'agencia'
});

// Agencia tiene muchos Prestamos
Agencia.hasMany(Prestamo, {
  foreignKey: 'id_agencia',
  as: 'prestamos'
});

// Prestamo pertenece a Usuario Analista
Prestamo.belongsTo(Usuario, {
  foreignKey: 'id_analista',
  as: 'analista'
});

// Prestamo pertenece a Usuario Aprobador
Prestamo.belongsTo(Usuario, {
  foreignKey: 'id_usuario_aprobador',
  as: 'usuarioAprobador'
});

// Prestamo pertenece a Usuario Gerente
Prestamo.belongsTo(Usuario, {
  foreignKey: 'id_gerente_aprueba',
  as: 'gerenteAprueba'
});

// Prestamo tiene muchos PlanPagos
Prestamo.hasMany(PlanPago, {
  foreignKey: 'id_prestamo',
  as: 'planPagos',
  onDelete: 'CASCADE'
});

// PlanPago pertenece a un Prestamo
PlanPago.belongsTo(Prestamo, {
  foreignKey: 'id_prestamo',
  as: 'prestamo'
});

// Prestamo tiene muchos PagosPrestamo
Prestamo.hasMany(PagoPrestamo, {
  foreignKey: 'id_prestamo',
  as: 'pagos'
});

// PagoPrestamo pertenece a un Prestamo
PagoPrestamo.belongsTo(Prestamo, {
  foreignKey: 'id_prestamo',
  as: 'prestamo'
});

// PagoPrestamo pertenece a un PlanPago
PagoPrestamo.belongsTo(PlanPago, {
  foreignKey: 'id_plan_pago',
  as: 'planPago'
});

// PlanPago tiene muchos PagosPrestamo
PlanPago.hasMany(PagoPrestamo, {
  foreignKey: 'id_plan_pago',
  as: 'pagos'
});

// PagoPrestamo pertenece a una Transaccion
PagoPrestamo.belongsTo(Transaccion, {
  foreignKey: 'id_transaccion',
  as: 'transaccion'
});

// PagoPrestamo pertenece a un Usuario
PagoPrestamo.belongsTo(Usuario, {
  foreignKey: 'id_usuario',
  as: 'usuario'
});

// ----------------------------------------------------------------------------
// RELACIONES DE BITACORA
// ----------------------------------------------------------------------------

// Bitacora pertenece a un Usuario
Bitacora.belongsTo(Usuario, {
  foreignKey: 'id_usuario',
  as: 'usuario'
});

// Usuario tiene muchas Bitacoras
Usuario.hasMany(Bitacora, {
  foreignKey: 'id_usuario',
  as: 'bitacoras'
});

// ============================================================================
// EXPORTAR MODELOS Y SEQUELIZE
// ============================================================================

const db = {
  sequelize,
  
  // Auth
  Usuario,
  Rol,
  Permiso,
  
  // Catalogos
  Agencia,
  RolPermiso,
  ParametroSistema,
  
  // Clientes
  Cliente,
  TelefonoCliente,
  
  // Cuentas
  Cuenta,
  TipoCuenta,
  
  // Transacciones
  Transaccion,
  TipoTransaccion,
  Reverso,
  PagoRecurrente,
  
  // Prestamos
  Prestamo,
  TipoPrestamo,
  PlanPago,
  PagoPrestamo,
  
  // Auditoria
  Bitacora
};

module.exports = db;
