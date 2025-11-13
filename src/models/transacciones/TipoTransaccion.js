const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const TipoTransaccion = sequelize.define('tipos_transaccion', {
  id_tipo_transaccion: {
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
  afecta_saldo: {
    type: DataTypes.ENUM('suma', 'resta', 'neutro'),
    allowNull: false
  }
}, {
  timestamps: false,
  tableName: 'tipos_transaccion'
});

module.exports = TipoTransaccion;
