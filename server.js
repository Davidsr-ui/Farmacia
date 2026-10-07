require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const { sequelize, User, TipoMedic, Medicamento, Especialidad, Laboratorio } = require('./src/model');
const { cargarUsuario } = require('./src/middleware/auth');
const V = require('./shared/validators');

const app = express();
app.set('trust proxy', 1); // Render usa proxy HTTPS
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use('/shared', express.static('shared')); // el navegador usa el mismo validators.js
app.use(cargarUsuario);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Disponible en todas las vistas: el menú depende del rol del usuario
app.use((req, res, next) => {
  res.locals.menu = V.menuPorRol(req.user && req.user.role);
  next();
});

app.use('/', require('./src/routes/pages'));
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/usuarios', require('./src/routes/usuarios'));
app.use('/api/tipos', require('./src/routes/tipos'));
app.use('/api/especialidades', require('./src/routes/especialidades'));
app.use('/api/medicamentos', require('./src/routes/medicamentos'));

async function insertarDatos() {
  const clave = await bcrypt.hash('Clave123', 10);
  await User.findOrCreate({ where: { email: 'admin@farmacia.com' }, defaults: { nombre: 'Administrador', password: clave, role: 'administrador' } });
  await User.findOrCreate({ where: { email: 'moderador@farmacia.com' }, defaults: { nombre: 'Moderador', password: clave, role: 'moderador' } });
  if (await TipoMedic.count() === 0) {
    const [a, b] = await TipoMedic.bulkCreate([{ descripcion: 'Analgésico' }, { descripcion: 'Antibiótico' }]);
    await Medicamento.bulkCreate([
      { descripcionMed: 'Paracetamol 500 mg', marca: 'Genfar', presentacion: 'Caja x 100', stock: 250, precioVentaUni: 0.5, precioVentaPres: 45, fechaFabricacion: '2026-01-10', fechaVencimiento: '2028-01-10', CodTipoMed: a.CodTipoMed },
      { descripcionMed: 'Amoxicilina 500 mg', marca: 'Portugal', presentacion: 'Caja x 50', stock: 120, precioVentaUni: 0.9, precioVentaPres: 40, fechaFabricacion: '2026-02-01', fechaVencimiento: '2027-12-01', CodTipoMed: b.CodTipoMed },
    ]);
  }
  if (await Especialidad.count() === 0)
    await Especialidad.bulkCreate([{ descripcionEsp: 'Medicina general' }, { descripcionEsp: 'Pediatría' }]);
  if (await Laboratorio.count() === 0)
    await Laboratorio.create({ razonSocial: 'Laboratorios Genfar S.A.', direccion: 'Av. Principal 123', telefono: '999888777', email: 'ventas@genfar.com', contacto: 'Juan Pérez' });
}

const PORT = process.env.PORT || 4000;
(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });   // TEMPORAL: añade CodEspec y las tablas nuevas. Luego vuelve a sync()
  await insertarDatos();
  app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
})().catch((e) => console.error('No se pudo iniciar:', e.message));