const router = require('express').Router();
const V = require('../../shared/validators');
const { sequelize, OrdenCompra, DetalleOrdenCompra, Laboratorio, Medicamento } = require('../model');
const { conSesion, puedeEditar, soloAdmin } = require('../middleware/permisos');

const incluir = [
  { model: Laboratorio, as: 'laboratorio' },
  { model: DetalleOrdenCompra, as: 'detalles', include: [{ model: Medicamento, as: 'medicamento' }] },
];

router.get('/', conSesion, async (req, res) =>
  res.json({ ok: true, data: await OrdenCompra.findAll({ include: incluir, order: [['NroOrdenC', 'DESC']] }) }));

router.post('/', puedeEditar, async (req, res) => {
  const errores = V.validarOrdenCompra(req.body);
  if (errores.length) return res.status(400).json({ ok: false, errores });
  try {
    const ids = req.body.detalles.map((l) => Number(l.CodMedicamento));
    const meds = await Medicamento.findAll({ where: { CodMedicamento: ids } });
    if (meds.length !== ids.length) return res.status(400).json({ ok: false, errores: ['Hay medicamentos que no existen.'] });
    const nombre = Object.fromEntries(meds.map((m) => [m.CodMedicamento, m.descripcionMed]));

    const lineas = req.body.detalles.map((l) => {
      const cantidad = Number(l.cantidad), precio = Number(l.precio);
      return { CodMedicamento: Number(l.CodMedicamento), descripcion: nombre[l.CodMedicamento], cantidad, precio,
               montouni: Number((cantidad * precio).toFixed(2)) };
    });
    const total = lineas.reduce((s, l) => s + l.montouni, 0).toFixed(2);

    const orden = await sequelize.transaction(async (t) => {
      const o = await OrdenCompra.create({
        fechaEmision: req.body.fechaEmision,
        Situacion: req.body.Situacion || 'Pendiente',
        Total: total,
        NrofacturaProv: (req.body.NrofacturaProv || '').trim() || null,
        CodLab: Number(req.body.CodLab),
      }, { transaction: t });
      await DetalleOrdenCompra.bulkCreate(lineas.map((l) => ({ ...l, NroOrdenC: o.NroOrdenC })), { transaction: t });
      return o;
    });
    res.status(201).json({ ok: true, data: orden });
  } catch (e) {
    res.status(500).json({ ok: false, errores: ['No se pudo guardar la orden.'] });
  }
});

router.delete('/:id', soloAdmin, async (req, res) => {
  const o = await OrdenCompra.findByPk(req.params.id);
  if (!o) return res.status(404).json({ ok: false, errores: ['No encontrada.'] });
  await sequelize.transaction(async (t) => {
    await DetalleOrdenCompra.destroy({ where: { NroOrdenC: o.NroOrdenC }, transaction: t });
    await o.destroy({ transaction: t });
  });
  res.json({ ok: true });
});

module.exports = router;