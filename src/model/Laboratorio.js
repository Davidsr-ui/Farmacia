const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Laboratorio', {
    CodLab: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    razonSocial: { type: DataTypes.STRING(150), allowNull: false },
    direccion: DataTypes.STRING(200),
    telefono: DataTypes.STRING(20),
    email: DataTypes.STRING(100),
    contacto: DataTypes.STRING(100),
  }, { tableName: 'Laboratorio', timestamps: false });