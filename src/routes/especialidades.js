const router = require('express').Router();
const V = require('../../shared/validators');
const { Especialidad } = require('../model');

const conSesion = (req, res, next) =>
  req.user ? next() : res.status(401).json({ ok: false, errores: ['Sesión requerida.'] });
const puedeEditar = (req, res, next) =>
  req.user && ['moderador', 'administrador'].includes(req.user.role)
    ? next() : res.status(403).json({ ok: false, errores: ['Acceso denegado.'] });
const soloAdmin = (req, res, next) =>
  req.user && req.user.role === 'administrador'
    ? next() : res.status(403).json({ ok: false, errores: ['Acceso denegado.'] });

router.get('/', conSesion, async (req, res) => {
  res.json({ ok: true, data: await Especialidad.findAll({ order: [['CodEspec', 'ASC']] }) });
});

router.post('/', puedeEditar, async (req, res) => {
  const errores = V.validarEspecialidad(req.body);
  if (errores.length) return res.status(400).json({ ok: false, errores });
  const e = await Especialidad.create({ descripcionEsp: req.body.descripcionEsp.trim() });
  res.status(201).json({ ok: true, data: e });
});

router.put('/:id', puedeEditar, async (req, res) => {
  const errores = V.validarEspecialidad(req.body);
  if (errores.length) return res.status(400).json({ ok: false, errores });
  const e = await Especialidad.findByPk(req.params.id);
  if (!e) return res.status(404).json({ ok: false, errores: ['No encontrada.'] });
  await e.update({ descripcionEsp: req.body.descripcionEsp.trim() });
  res.json({ ok: true, data: e });
});

router.delete('/:id', soloAdmin, async (req, res) => {
  const e = await Especialidad.findByPk(req.params.id);
  if (!e) return res.status(404).json({ ok: false, errores: ['No encontrada.'] });
  try {
    await e.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(409).json({ ok: false, errores: ['No se puede eliminar: tiene medicamentos asociados.'] });
  }
});

module.exports = router;