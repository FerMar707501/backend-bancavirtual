const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Transaccion = sequelize.define('transacciones', {
  id_transaccion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_comprobante: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  id_cuenta_origen: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_cuenta_destino: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_tipo_transaccion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  monto: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_agencia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_transaccion: {
    type: DataTypes.DATE,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('completada', 'pendiente', 'reversada'),
    defaultValue: 'completada'
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  tableName: 'transacciones'
});

module.exports = Transaccion;
