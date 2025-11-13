const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const RolPermiso = sequelize.define('roles_permisos', {
  id_rol_permiso: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_rol: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_permiso: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false,
  tableName: 'roles_permisos'
});

module.exports = RolPermiso;
