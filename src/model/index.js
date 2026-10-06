const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(80), allowNull: false },
  email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('administrador', 'moderador', 'usuario'), defaultValue: 'usuario' },
}, { tableName: 'usuarios' });

const TipoMedic = sequelize.define('TipoMedic', {
  CodTipoMed: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  descripcion: { type: DataTypes.STRING(80), allowNull: false },
}, { tableName: 'tipo_medic', timestamps: false });

const Medicamento = sequelize.define('Medicamento', {
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

// Relación 1:N → un tipo tiene muchos medicamentos
TipoMedic.hasMany(Medicamento, { foreignKey: { name: 'CodTipoMed', allowNull: false }, as: 'medicamentos' });
Medicamento.belongsTo(TipoMedic, { foreignKey: 'CodTipoMed', as: 'tipo' });

module.exports = { sequelize, User, TipoMedic, Medicamento };