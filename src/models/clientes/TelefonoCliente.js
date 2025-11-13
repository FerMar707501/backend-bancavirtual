const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const TelefonoCliente = sequelize.define('telefonos_cliente', {
  id_telefono: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_cliente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  numero_telefono: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('movil', 'fijo', 'trabajo'),
    defaultValue: 'movil'
  },
  principal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: false,
  tableName: 'telefonos_cliente'
});

module.exports = TelefonoCliente;
