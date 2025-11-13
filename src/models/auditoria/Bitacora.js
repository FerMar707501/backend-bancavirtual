const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Bitacora = sequelize.define('bitacora', {
  id_bitacora: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  accion: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  modulo: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  datos_adicionales: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  tableName: 'bitacora'
});

module.exports = Bitacora;
