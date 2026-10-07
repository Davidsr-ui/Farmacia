const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('TipoMedic', {
    CodTipoMed: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    descripcion: { type: DataTypes.STRING(80), allowNull: false },
  }, { tableName: 'tipo_medic', timestamps: false });