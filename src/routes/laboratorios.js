const router = require('express').Router();
const V = require('../../shared/validators');
const { Laboratorio } = require('../model');
const { conSesion, puedeEditar, soloAdmin } = require('../middleware/permisos');

const campos = (b) => ({
  razonSocial: b.razonSocial.trim(),
  direccion: (b.direccion || '').trim() || null,
  telefono: (b.telefono || '').trim() || null,
  email: (b.email || '').trim() || null,
  contacto: (b.contacto || '').trim() || null,
});

router.get('/', conSesion, async (req, res) =>
  res.json({ ok: true, data: await Laboratorio.findAll({ order: [['CodLab', 'ASC']] }) }));

router.post('/', puedeEditar, async (req, res) => {
  const errores = V.validarLaboratorio(req.body);
  if (errores.length) return res.status(400).json({ ok: false, errores });
  res.status(201).json({ ok: true, data: await Laboratorio.create(campos(req.body)) });
});

router.put('/:id', puedeEditar, async (req, res) => {
  const errores = V.validarLaboratorio(req.body);
  if (errores.length) return res.status(400).json({ ok: false, errores });
  const l = await Laboratorio.findByPk(req.params.id);
  if (!l) return res.status(404).json({ ok: false, errores: ['No encontrado.'] });
  await l.update(campos(req.body));
  res.json({ ok: true, data: l });
});

router.delete('/:id', soloAdmin, async (req, res) => {
  const l = await Laboratorio.findByPk(req.params.id);
  if (!l) return res.status(404).json({ ok: false, errores: ['No encontrado.'] });
  try { await l.destroy(); res.json({ ok: true }); }
  catch (e) { res.status(409).json({ ok: false, errores: ['No se puede eliminar: tiene órdenes de compra asociadas.'] }); }
});

module.exports = router;