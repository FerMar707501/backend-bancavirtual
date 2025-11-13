const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Cliente = sequelize.define('clientes', {
  id_cliente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dpi: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  nit: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  primer_nombre: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  segundo_nombre: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  primer_apellido: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  segundo_apellido: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  correo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  estado_kyc: {
    type: DataTypes.ENUM('pendiente', 'verificado', 'rechazado'),
    defaultValue: 'pendiente'
  },
  estado_cliente: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    defaultValue: 'activo'
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'clientes'
});

module.exports = Cliente;
