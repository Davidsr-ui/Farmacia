const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('OrdenCompra', {
    NroOrdenC: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fechaEmision: { type: DataTypes.DATEONLY, allowNull: false },
    Situacion: DataTypes.STRING(30),
    Total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    NrofacturaProv: DataTypes.STRING(30),
  }, { tableName: 'OrdenCompra', timestamps: false });