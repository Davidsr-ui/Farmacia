const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('DetalleOrdenCompra', {
    NroOrdenC: { type: DataTypes.INTEGER, primaryKey: true },
    CodMedicamento: { type: DataTypes.INTEGER, primaryKey: true },
    descripcion: DataTypes.STRING(150),
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
    precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    montouni: DataTypes.DECIMAL(10, 2),
  }, { tableName: 'DetalleOrdenCompra', timestamps: false });