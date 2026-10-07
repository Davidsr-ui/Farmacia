const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('OrdenVenta', {
    NroOrdenVta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fechaEmision: { type: DataTypes.DATEONLY, allowNull: false },
    Motivo: DataTypes.STRING(200),
    Situacion: DataTypes.STRING(30),
  }, { tableName: 'OrdenVenta', timestamps: false });