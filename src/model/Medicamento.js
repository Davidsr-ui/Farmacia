const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Medicamento', {
    CodMedicamento: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    descripcionMed: { type: DataTypes.STRING(150), allowNull: false },
    fechaFabricacion: { type: DataTypes.DATEONLY, allowNull: false },
    fechaVencimiento: { type: DataTypes.DATEONLY, allowNull: false },
    presentacion: { type: DataTypes.STRING(60), allowNull: false },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    precioVentaUni: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    precioVentaPres: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    marca: { type: DataTypes.STRING(60), allowNull: false },
  }, { tableName: 'medicamento', timestamps: false });