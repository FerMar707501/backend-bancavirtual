const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Cuenta = sequelize.define('cuentas', {
  id_cuenta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_cuenta: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  id_cliente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_tipo_cuenta: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_agencia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  saldo: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  fecha_apertura: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('activa', 'bloqueada', 'cerrada'),
    defaultValue: 'activa'
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'cuentas'
});

module.exports = Cuenta;
