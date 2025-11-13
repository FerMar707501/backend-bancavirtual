const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const PagoPrestamo = sequelize.define('pagos_prestamo', {
  id_pago: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_prestamo: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_plan_pago: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_transaccion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_pago: {
    type: DataTypes.DATE,
    allowNull: false
  },
  monto_total: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  monto_capital: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  monto_interes: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  monto_mora: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  tableName: 'pagos_prestamo'
});

module.exports = PagoPrestamo;
