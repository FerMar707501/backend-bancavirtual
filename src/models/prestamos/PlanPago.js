const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const PlanPago = sequelize.define('plan_pagos', {
  id_plan_pago: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_prestamo: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  numero_cuota: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_vencimiento: {
    type: DataTypes.DATEONLY,
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
  monto_cuota: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  saldo_capital: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'pagada', 'vencida', 'en_mora'),
    defaultValue: 'pendiente'
  }
}, {
  timestamps: false,
  tableName: 'plan_pagos'
});

module.exports = PlanPago;
