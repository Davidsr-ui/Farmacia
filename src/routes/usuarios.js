const router = require('express').Router();
const V = require('../../shared/validators');
const { User } = require('../model');

// Solo administrador
const soloAdmin = (req, res, next) =>
  req.user && req.user.role === 'administrador'
    ? next()
    : res.status(403).json({ ok: false, errores: ['Acceso denegado.'] });

// Listar usuarios (sin la contraseña)
router.get('/', soloAdmin, async (req, res) => {
  const data = await User.findAll({ attributes: { exclude: ['password'] } });
  res.json({ ok: true, data });
});

// Cambiar rol
router.put('/:id', soloAdmin, async (req, res) => {
  if (!V.ROLES.includes(req.body.role))
    return res.status(400).json({ ok: false, errores: ['Rol inválido.'] });
  const u = await User.findByPk(req.params.id);
  if (!u) return res.status(404).json({ ok: false, errores: ['Usuario no encontrado.'] });
  await u.update({ role: req.body.role });
  res.json({ ok: true });
});

// Eliminar usuario
router.delete('/:id', soloAdmin, async (req, res) => {
  const u = await User.findByPk(req.params.id);
  if (!u) return res.status(404).json({ ok: false, errores: ['Usuario no encontrado.'] });
  await u.destroy();
  res.json({ ok: true });
});

module.exports = router;