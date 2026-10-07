const router = require('express').Router();

// Si no hay sesión, manda al login
const protegida = (req, res, next) => (req.user ? next() : res.redirect('/login'));

// Solo deja pasar a los roles indicados
const soloRoles = (...roles) => (req, res, next) =>
  req.user && roles.includes(req.user.role) ? next() : res.status(403).send('Acceso denegado');

router.get('/', (req, res) => res.redirect(req.user ? '/menu' : '/login'));
router.get('/login', (req, res) => (req.user ? res.redirect('/menu') : res.render('login')));
router.get('/registro', (req, res) => (req.user ? res.redirect('/menu') : res.render('registro')));
router.get('/menu', protegida, (req, res) => res.render('menu'));
router.get('/logout', (req, res) => res.clearCookie('token').redirect('/login'));

// Páginas del CRUD
router.get('/medicamentos', protegida, (req, res) => res.render('medicamentos'));
router.get('/tipos', protegida, soloRoles('moderador', 'administrador'), (req, res) => res.render('tipos'));
router.get('/especialidades', protegida, soloRoles('moderador', 'administrador'), (req, res) => res.render('especialidades'));
router.get('/usuarios', protegida, soloRoles('administrador'), (req, res) => res.render('usuarios'));

module.exports = router;