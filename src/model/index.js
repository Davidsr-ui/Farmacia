const { sequelize } = require('../config/db');

const User = require('./User')(sequelize);
const TipoMedic = require('./TipoMedic')(sequelize);
const Medicamento = require('./Medicamento')(sequelize);
const Especialidad = require('./Especialidad')(sequelize);
const Laboratorio = require('./Laboratorio')(sequelize);
const OrdenVenta = require('./OrdenVenta')(sequelize);
const DetalleOrdenVta = require('./DetalleOrdenVta')(sequelize);
const OrdenCompra = require('./OrdenCompra')(sequelize);
const DetalleOrdenCompra = require('./DetalleOrdenCompra')(sequelize);

// ---- Relaciones ----
// Tu relación original (con alias)
TipoMedic.hasMany(Medicamento, { foreignKey: { name: 'CodTipoMed', allowNull: false }, as: 'medicamentos' });
Medicamento.belongsTo(TipoMedic, { foreignKey: 'CodTipoMed', as: 'tipo' });

// Especialidad 1:N Medicamento
Especialidad.hasMany(Medicamento, { foreignKey: { name: 'CodEspec', allowNull: true }, as: 'medicamentos' });
Medicamento.belongsTo(Especialidad, { foreignKey: 'CodEspec', as: 'especialidad' });

// Laboratorio 1:N OrdenCompra
Laboratorio.hasMany(OrdenCompra, { foreignKey: { name: 'CodLab', allowNull: false }, as: 'ordenes' });
OrdenCompra.belongsTo(Laboratorio, { foreignKey: 'CodLab', as: 'laboratorio' });

// OrdenVenta / Medicamento con DetalleOrdenVta
OrdenVenta.hasMany(DetalleOrdenVta, { foreignKey: 'NroOrdenVta', as: 'detalles' });
DetalleOrdenVta.belongsTo(OrdenVenta, { foreignKey: 'NroOrdenVta' });
Medicamento.hasMany(DetalleOrdenVta, { foreignKey: 'CodMedicamento', as: 'detallesVenta' });
DetalleOrdenVta.belongsTo(Medicamento, { foreignKey: 'CodMedicamento', as: 'medicamento' });

// OrdenCompra / Medicamento con DetalleOrdenCompra
OrdenCompra.hasMany(DetalleOrdenCompra, { foreignKey: 'NroOrdenC', as: 'detalles' });
DetalleOrdenCompra.belongsTo(OrdenCompra, { foreignKey: 'NroOrdenC' });
Medicamento.hasMany(DetalleOrdenCompra, { foreignKey: 'CodMedicamento', as: 'detallesCompra' });
DetalleOrdenCompra.belongsTo(Medicamento, { foreignKey: 'CodMedicamento', as: 'medicamento' });

module.exports = {
  sequelize,
  User, TipoMedic, Medicamento,
  Especialidad, Laboratorio,
  OrdenVenta, DetalleOrdenVta,
  OrdenCompra, DetalleOrdenCompra,
};