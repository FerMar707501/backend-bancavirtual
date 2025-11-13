const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Prestamo = sequelize.define('prestamos', {
  id_prestamo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_prestamo: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  id_cliente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_tipo_prestamo: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_agencia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_cuenta_desembolso: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  frecuencia_pago: {
    type: DataTypes.ENUM('semanal', 'quincenal', 'mensual'),
    defaultValue: 'mensual'
  },
  monto_solicitado: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  monto_aprobado: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  plazo_meses: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tasa_interes: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  cuota_mensual: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  saldo_pendiente: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  destino: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  fecha_solicitud: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_aprobacion: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  fecha_desembolso: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('solicitado', 'aprobado', 'rechazado', 'desembolsado', 'vigente', 'en_mora', 'castigado', 'cancelado'),
    defaultValue: 'solicitado'
  },
  id_usuario_aprobador: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_analista: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_gerente_aprueba: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  motivo_rechazo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'prestamos'
});

module.exports = Prestamo;
