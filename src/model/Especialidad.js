const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Especialidad', {
    CodEspec: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    descripcionEsp: { type: DataTypes.STRING(100), allowNull: false },
  }, { tableName: 'Especialidad', timestamps: false });