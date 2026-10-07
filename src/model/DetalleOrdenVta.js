const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('DetalleOrdenVta', {
    NroOrdenVta: { type: DataTypes.INTEGER, primaryKey: true },
    CodMedicamento: { type: DataTypes.INTEGER, primaryKey: true },
    descripcionMed: DataTypes.STRING(150),
    cantidadRequerida: { type: DataTypes.INTEGER, allowNull: false },
  }, { tableName: 'DetalleOrdenVta', timestamps: false });