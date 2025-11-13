const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ParametroSistema = sequelize.define('parametros_sistema', {
  id_parametro: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clave: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  valor: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tipo_dato: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
    defaultValue: 'string'
  }
}, {
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
  tableName: 'parametros_sistema'
});

module.exports = ParametroSistema;
