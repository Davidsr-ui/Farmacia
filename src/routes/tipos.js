const router = require('express').Router();
const V = require('../../shared/validators');
const { TipoMedic } = require('../model');
const { apiAuth, rol } = require('../middleware/auth');

router.use(apiAuth); // todo requiere JWT

router.get('/', async (req, res) =>
  res.json({ ok: true, data: await TipoMedic.findAll({ order: ['descripcion'] }) }));

router.post('/', rol('administrador', 'moderador'), async (req, res) => {
  const errores = V.validarTipo(req.body);
  if (errores.length) return res.status(400).json({ ok: false, errores });
  res.status(201).json({ ok: true, data: await TipoMedic.create({ descripcion: req.body.descripcion.trim() }) });
});

router.put('/:id', rol('administrador', 'moderador'), async (req, res) => {
  const errores = V.validarTipo(req.body);
  if (errores.length) return res.status(400).json({ ok: false, errores });
  const t = await TipoMedic.findByPk(req.params.id);
  if (!t) return res.status(404).json({ ok: false, errores: ['No encontrado.'] });
  res.json({ ok: true, data: await t.update({ descripcion: req.body.descripcion.trim() }) });
});

router.delete('/:id', rol('administrador'), async (req, res) => {
  try {
    const n = await TipoMedic.destroy({ where: { CodTipoMed: req.params.id } });
    n ? res.json({ ok: true }) : res.status(404).json({ ok: false, errores: ['No encontrado.'] });
  } catch {
    res.status(409).json({ ok: false, errores: ['El tipo tiene medicamentos asociados.'] });
  }
});

module.exports = router;