const err = (res, code, msg) => res.status(code).json({ ok: false, errores: [msg] });

exports.conSesion = (req, res, next) => (req.user ? next() : err(res, 401, 'Sesión requerida.'));
exports.puedeEditar = (req, res, next) =>
  req.user && ['moderador', 'administrador'].includes(req.user.role) ? next() : err(res, 403, 'Acceso denegado.');
exports.soloAdmin = (req, res, next) =>
  req.user && req.user.role === 'administrador' ? next() : err(res, 403, 'Acceso denegado.');