const router = require('express').Router();
const V = require('../../shared/validators');
const { Medicamento, TipoMedic, Especialidad } = require('../model');
const { apiAuth, rol } = require('../middleware/auth');

router.use(apiAuth);

// Solo los campos permitidos; CodEspec vacío se guarda como null
const campos = (b) => ({
  descripcionMed: b.descripcionMed.trim(),
  marca: b.marca.trim(),
  presentacion: b.presentacion.trim(),
  stock: Number(b.stock),
  precioVentaUni: Number(b.precioVentaUni),
  precioVentaPres: Number(b.precioVentaPres),
  fechaFabricacion: b.fechaFabricacion,
  fechaVencimiento: b.fechaVencimiento,
  CodTipoMed: Number(b.CodTipoMed),
  CodEspec: b.CodEspec ? Number(b.CodEspec) : null,
});

router.get('/', async (req, res) =>
  res.json({
    ok: true,
    data: await Medicamento.findAll({
      include: [
        { model: TipoMedic, as: 'tipo' },
        { model: Especialidad, as: 'especialidad' },
      ],
      order: ['CodMedicamento'],
    }),
  }));

router.post('/', rol('administrador', 'moderador'), async (req, res) => {
  const errores = V.validarMedicamento(req.body);
  if (errores.length) return res.status(400).json({ ok: false, errores });
  res.status(201).json({ ok: true, data: await Medicamento.create(campos(req.body)) });
});

router.put('/:id', rol('administrador', 'moderador'), async (req, res) => {
  const errores = V.validarMedicamento(req.body);
  if (errores.length) return res.status(400).json({ ok: false, errores });
  const m = await Medicamento.findByPk(req.params.id);
  if (!m) return res.status(404).json({ ok: false, errores: ['No encontrado.'] });
  res.json({ ok: true, data: await m.update(campos(req.body)) });
});

router.delete('/:id', rol('administrador'), async (req, res) => {
  try {
    const n = await Medicamento.destroy({ where: { CodMedicamento: req.params.id } });
    n ? res.json({ ok: true }) : res.status(404).json({ ok: false, errores: ['No encontrado.'] });
  } catch (e) {
    res.status(409).json({ ok: false, errores: ['No se puede eliminar: está en órdenes de compra o venta.'] });
  }
});

module.exports = router;