const jwt = require('jsonwebtoken');

const firmar = (u) =>
  jwt.sign({ id: u.id, nombre: u.nombre, email: u.email, role: u.role }, process.env.JWT_SECRET, { expiresIn: '2h' });

// Lee el token del header "Authorization: Bearer ..." o de la cookie
function cargarUsuario(req, res, next) {
  const h = req.headers.authorization;
  const token = h && h.startsWith('Bearer ') ? h.slice(7) : req.cookies.token;
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch { req.user = null; }
  res.locals.user = req.user;
  next();
}

const apiAuth = (req, res, next) =>
  req.user ? next() : res.status(401).json({ ok: false, errores: ['Sesión no válida o expirada.'] });

const rol = (...roles) => (req, res, next) =>
  req.user && roles.includes(req.user.role)
    ? next()
    : res.status(403).json({ ok: false, errores: ['No tiene permisos para esta acción.'] });

module.exports = { firmar, cargarUsuario, apiAuth, rol };