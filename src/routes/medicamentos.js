const router = require('express').Router();
const V = require('../../shared/validators');
const { Medicamento, TipoMedic } = require('../model');
const { apiAuth, rol } = require('../middleware/auth');

router.use(apiAuth);

router.get('/', async (req, res) =>
  res.json({ ok: true, data: await Medicamento.findAll({ include: [{ model: TipoMedic, as: 'tipo' }], order: ['CodMedicamento'] }) }));

router.post('/', rol('administrador', 'moderador'), async (req, res) => {
  const errores = V.validarMedicamento(req.body);
  if (errores.length) return res.status(400).json({ ok: false, errores });
  res.status(201).json({ ok: true, data: await Medicamento.create(req.body) });
});

router.put('/:id', rol('administrador', 'moderador'), async (req, res) => {
  const errores = V.validarMedicamento(req.body);
  if (errores.length) return res.status(400).json({ ok: false, errores });
  const m = await Medicamento.findByPk(req.params.id);
  if (!m) return res.status(404).json({ ok: false, errores: ['No encontrado.'] });
  res.json({ ok: true, data: await m.update(req.body) });
});

router.delete('/:id', rol('administrador'), async (req, res) => {
  const n = await Medicamento.destroy({ where: { CodMedicamento: req.params.id } });
  n ? res.json({ ok: true }) : res.status(404).json({ ok: false, errores: ['No encontrado.'] });
});

module.exports = router;