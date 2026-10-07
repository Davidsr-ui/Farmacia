const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(80), allowNull: false },
    email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('administrador', 'moderador', 'usuario'), defaultValue: 'usuario' },
  }, { tableName: 'usuarios' });