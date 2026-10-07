(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); // Node
  else root.Validators = factory();                                              // Navegador
})(typeof self !== 'undefined' ? self : this, function () {
  const ROLES = ['administrador', 'moderador', 'usuario'];
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const vacio = (v) => v === undefined || v === null || String(v).trim() === '';

  function validarRegistro(d) {
    const e = [];
    if (vacio(d.nombre) || d.nombre.trim().length < 3) e.push('El nombre debe tener al menos 3 caracteres.');
    if (vacio(d.email) || !EMAIL_RE.test(d.email)) e.push('Ingrese un correo válido.');
    if (vacio(d.password) || d.password.length < 6) e.push('La contraseña debe tener al menos 6 caracteres.');
    if (!ROLES.includes(d.role)) e.push('Seleccione un rol válido.');
    return e;
  }

  function validarLogin(d) {
    const e = [];
    if (vacio(d.email) || !EMAIL_RE.test(d.email)) e.push('Ingrese un correo válido.');
    if (vacio(d.password)) e.push('Ingrese su contraseña.');
    return e;
  }

  function validarTipo(d) {
    return vacio(d.descripcion) || d.descripcion.trim().length < 3
      ? ['La descripción debe tener al menos 3 caracteres.'] : [];
  }

  function validarEspecialidad(d) {
    return vacio(d.descripcionEsp) || d.descripcionEsp.trim().length < 3
      ? ['La descripción debe tener al menos 3 caracteres.'] : [];
  }

  function validarMedicamento(d) {
    const e = [];
    if (vacio(d.descripcionMed)) e.push('La descripción es obligatoria.');
    if (vacio(d.marca)) e.push('La marca es obligatoria.');
    if (vacio(d.presentacion)) e.push('La presentación es obligatoria.');
    if (vacio(d.CodTipoMed)) e.push('Seleccione un tipo.');
    if (!Number.isInteger(Number(d.stock)) || Number(d.stock) < 0) e.push('Stock inválido.');
    if (isNaN(Number(d.precioVentaUni)) || Number(d.precioVentaUni) <= 0) e.push('Precio unitario inválido.');
    if (isNaN(Number(d.precioVentaPres)) || Number(d.precioVentaPres) <= 0) e.push('Precio por presentación inválido.');
    if (vacio(d.fechaFabricacion) || vacio(d.fechaVencimiento)) e.push('Ingrese ambas fechas.');
    else if (new Date(d.fechaVencimiento) <= new Date(d.fechaFabricacion)) e.push('El vencimiento debe ser posterior a la fabricación.');
    return e;
  }

  // Menú según rol: lo usan las vistas

  function validarLaboratorio(d) {
  const e = [];
  if (vacio(d.razonSocial) || d.razonSocial.trim().length < 3) e.push('La razón social debe tener al menos 3 caracteres.');
  if (!vacio(d.email) && !EMAIL_RE.test(d.email)) e.push('Correo inválido.');
  if (!vacio(d.telefono) && !/^[0-9+\-\s]{6,20}$/.test(d.telefono)) e.push('Teléfono inválido.');
  return e;
}

// Revisa las líneas: medicamento obligatorio, sin repetidos y cantidad > 0
function validarLineas(detalles, campoCantidad, conPrecio) {
  const e = [];
  if (!Array.isArray(detalles) || detalles.length === 0) return ['Agregue al menos un medicamento.'];
  const vistos = new Set();
  detalles.forEach((l, i) => {
    const n = i + 1;
    if (vacio(l.CodMedicamento)) e.push(`Línea ${n}: seleccione un medicamento.`);
    else if (vistos.has(String(l.CodMedicamento))) e.push(`Línea ${n}: medicamento repetido.`);
    else vistos.add(String(l.CodMedicamento));
    if (!Number.isInteger(Number(l[campoCantidad])) || Number(l[campoCantidad]) <= 0) e.push(`Línea ${n}: cantidad inválida.`);
    if (conPrecio && (isNaN(Number(l.precio)) || Number(l.precio) <= 0)) e.push(`Línea ${n}: precio inválido.`);
  });
  return e;
}

function validarOrdenCompra(d) {
  const e = [];
  if (vacio(d.fechaEmision)) e.push('Ingrese la fecha de emisión.');
  if (vacio(d.CodLab)) e.push('Seleccione un laboratorio.');
  return e.concat(validarLineas(d.detalles, 'cantidad', true));
}

function validarOrdenVenta(d) {
  const e = [];
  if (vacio(d.fechaEmision)) e.push('Ingrese la fecha de emisión.');
  if (vacio(d.Motivo) || d.Motivo.trim().length < 3) e.push('Ingrese el motivo (mínimo 3 caracteres).');
  return e.concat(validarLineas(d.detalles, 'cantidadRequerida', false));
}

function menuPorRol(role) {
  const m = [{ texto: 'Inicio', href: '/menu' }, { texto: 'Medicamentos', href: '/medicamentos' }];
  if (role === 'administrador' || role === 'moderador') {
    m.push({ texto: 'Tipos', href: '/tipos' });
    m.push({ texto: 'Especialidades', href: '/especialidades' });
    m.push({ texto: 'Laboratorios', href: '/laboratorios' });
    m.push({ texto: 'Compras', href: '/ordenes-compra' });
    m.push({ texto: 'Ventas', href: '/ordenes-venta' });
  }
  if (role === 'administrador') m.push({ texto: 'Usuarios', href: '/usuarios' });
  return m;
}

  return {
  ROLES, validarRegistro, validarLogin, validarTipo, validarEspecialidad, validarMedicamento,
  validarLaboratorio, validarOrdenCompra, validarOrdenVenta, menuPorRol,
};
});