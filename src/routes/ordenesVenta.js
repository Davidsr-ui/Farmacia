const router = require('express').Router();
const V = require('../../shared/validators');
const { sequelize, OrdenVenta, DetalleOrdenVta, Medicamento } = require('../model');
const { conSesion, puedeEditar, soloAdmin } = require('../middleware/permisos');

const incluir = [{ model: DetalleOrdenVta, as: 'detalles', include: [{ model: Medicamento, as: 'medicamento' }] }];

router.get('/', conSesion, async (req, res) =>
  res.json({ ok: true, data: await OrdenVenta.findAll({ include: incluir, order: [['NroOrdenVta', 'DESC']] }) }));

router.post('/', puedeEditar, async (req, res) => {
  const errores = V.validarOrdenVenta(req.body);
  if (errores.length) return res.status(400).json({ ok: false, errores });
  try {
    const ids = req.body.detalles.map((l) => Number(l.CodMedicamento));
    const meds = await Medicamento.findAll({ where: { CodMedicamento: ids } });
    if (meds.length !== ids.length) return res.status(400).json({ ok: false, errores: ['Hay medicamentos que no existen.'] });
    const nombre = Object.fromEntries(meds.map((m) => [m.CodMedicamento, m.descripcionMed]));

    const orden = await sequelize.transaction(async (t) => {
      const o = await OrdenVenta.create({
        fechaEmision: req.body.fechaEmision,
        Motivo: req.body.Motivo.trim(),
        Situacion: req.body.Situacion || 'Pendiente',
      }, { transaction: t });
      await DetalleOrdenVta.bulkCreate(req.body.detalles.map((l) => ({
        NroOrdenVta: o.NroOrdenVta,
        CodMedicamento: Number(l.CodMedicamento),
        descripcionMed: nombre[l.CodMedicamento],
        cantidadRequerida: Number(l.cantidadRequerida),
      })), { transaction: t });
      return o;
    });
    res.status(201).json({ ok: true, data: orden });
  } catch (e) {
    res.status(500).json({ ok: false, errores: ['No se pudo guardar la orden.'] });
  }
});

router.delete('/:id', soloAdmin, async (req, res) => {
  const o = await OrdenVenta.findByPk(req.params.id);
  if (!o) return res.status(404).json({ ok: false, errores: ['No encontrada.'] });
  await sequelize.transaction(async (t) => {
    await DetalleOrdenVta.destroy({ where: { NroOrdenVta: o.NroOrdenVta }, transaction: t });
    await o.destroy({ transaction: t });
  });
  res.json({ ok: true });
});

module.exports = router;