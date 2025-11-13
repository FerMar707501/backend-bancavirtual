const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const TipoPrestamo = sequelize.define('tipos_prestamo', {
  id_tipo_prestamo: {
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
  tasa_interes_anual: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  tasa_mora: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  plazo_minimo_meses: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  plazo_maximo_meses: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  monto_minimo: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  monto_maximo: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    defaultValue: 'activo'
  }
}, {
  timestamps: false,
  tableName: 'tipos_prestamo'
});

module.exports = TipoPrestamo;
