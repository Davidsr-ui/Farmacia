const router = require('express').Router();
const bcrypt = require('bcryptjs');
const V = require('../../shared/validators');
const { User } = require('../model');
const { firmar } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  const errores = V.validarRegistro(req.body);
  if (errores.length) return res.status(400).json({ ok: false, errores });
  try {
    const u = await User.create({
      nombre: req.body.nombre.trim(),
      email: req.body.email.trim().toLowerCase(),
      password: await bcrypt.hash(req.body.password, 10),
      role: req.body.role, // ya validado contra V.ROLES
    });
    res.status(201).json({ ok: true, id: u.id });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError')
      return res.status(409).json({ ok: false, errores: ['Ese correo ya está registrado.'] });
    res.status(500).json({ ok: false, errores: ['Error interno.'] });
  }
});

router.post('/login', async (req, res) => {
  const errores = V.validarLogin(req.body);
  if (errores.length) return res.status(400).json({ ok: false, errores });
  const u = await User.findOne({ where: { email: req.body.email.trim().toLowerCase() } });
  if (!u || !(await bcrypt.compare(req.body.password, u.password)))
    return res.status(401).json({ ok: false, errores: ['Credenciales incorrectas.'] });
  const token = firmar(u);
  res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 2 * 60 * 60 * 1000 })
     .json({ ok: true, token, user: { nombre: u.nombre, role: u.role } });
});

router.post('/logout', (req, res) => res.clearCookie('token').json({ ok: true }));

module.exports = router;