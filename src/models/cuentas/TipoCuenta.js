const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const TipoCuenta = sequelize.define('tipos_cuenta', {
  id_tipo_cuenta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tasa_interes: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    defaultValue: 'activo'
  }
}, {
  timestamps: false,
  tableName: 'tipos_cuenta'
});

module.exports = TipoCuenta;
