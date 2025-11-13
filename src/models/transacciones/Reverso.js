const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Reverso = sequelize.define('reversos', {
  id_reverso: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_transaccion_original: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_transaccion_reverso: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  motivo: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  id_usuario_autoriza: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_reverso: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  tableName: 'reversos'
});

module.exports = Reverso;
