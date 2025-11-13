const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const PagoRecurrente = sequelize.define('pagos_recurrentes', {
  id_pago_recurrente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_cuenta: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  concepto: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  monto: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  frecuencia: {
    type: DataTypes.ENUM('semanal', 'quincenal', 'mensual'),
    allowNull: false
  },
  dia_ejecucion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('activo', 'pausado', 'cancelado'),
    defaultValue: 'activo'
  },
  cuenta_destino: {
    type: DataTypes.STRING(30),
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'pagos_recurrentes'
});

module.exports = PagoRecurrente;
