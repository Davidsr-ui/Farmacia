const modal = new bootstrap.Modal(document.getElementById('modal'));
const form = document.getElementById('form');
const puedeEditar = ROL === 'moderador' || ROL === 'administrador';
const puedeEliminar = ROL === 'administrador';
let lista = [];
let tipos = [];

if (puedeEditar) document.getElementById('btn-nuevo').classList.remove('d-none');

// Las fechas llegan como "2026-01-31T00:00:00.000Z"; el input date quiere "2026-01-31"
const fecha = (f) => (f ? String(f).slice(0, 10) : '');

async function cargarTipos() {
  const r = await api('/tipos');
  tipos = r.data || [];
  document.getElementById('sel-tipo').innerHTML =
    '<option value="">-- Seleccione --</option>' +
    tipos.map((t) => `<option value="${t.CodTipoMed}">${esc(t.descripcion)}</option>`).join('');
}

function nombreTipo(m) {
  if (m.TipoMedic) return m.TipoMedic.descripcion;
  const t = tipos.find((x) => x.CodTipoMed === m.CodTipoMed);
  return t ? t.descripcion : m.CodTipoMed;
}

async function cargar() {
  const r = await api('/medicamentos');
  lista = r.data || [];
  document.getElementById('tabla').innerHTML = lista.map((m) => `
    <tr>
      <td>${m.CodMedicamento}</td>
      <td>${esc(m.descripcionMed)}</td>
      <td>${esc(m.marca)}</td>
      <td>${esc(m.presentacion)}</td>
      <td>${esc(nombreTipo(m))}</td>
      <td>S/ ${Number(m.precioVentaUni).toFixed(2)}</td>
      <td>S/ ${Number(m.precioVentaPres).toFixed(2)}</td>
      <td>${m.stock}</td>
      <td>${fecha(m.fechaFabricacion)}</td>
      <td>${fecha(m.fechaVencimiento)}</td>
      <td class="text-end text-nowrap">
        ${puedeEditar ? `<button class="btn btn-sm btn-warning" onclick="editar(${m.CodMedicamento})">
          <i class="bi bi-pencil"></i></button>` : ''}
        ${puedeEliminar ? `<button class="btn btn-sm btn-danger" onclick="eliminar(${m.CodMedicamento})">
          <i class="bi bi-trash"></i></button>` : ''}
      </td>
    </tr>`).join('');
}

function abrir(titulo, m = {}) {
  document.getElementById('modal-titulo').textContent = titulo;
  form.CodMedicamento.value = m.CodMedicamento || '';
  form.descripcionMed.value = m.descripcionMed || '';
  form.marca.value = m.marca || '';
  form.presentacion.value = m.presentacion || '';
  form.CodTipoMed.value = m.CodTipoMed || '';
  form.precioVentaUni.value = m.precioVentaUni ?? '';
  form.precioVentaPres.value = m.precioVentaPres ?? '';
  form.stock.value = m.stock ?? '';
  form.fechaFabricacion.value = fecha(m.fechaFabricacion);
  form.fechaVencimiento.value = fecha(m.fechaVencimiento);
  mostrarErrores([]);
  modal.show();
}
document.getElementById('btn-nuevo').onclick = () => abrir('Nuevo medicamento');
window.editar = (id) => abrir('Editar medicamento', lista.find((m) => m.CodMedicamento === id));

window.eliminar = async (id) => {
  if (!confirm('¿Eliminar este medicamento?')) return;
  const r = await api('/medicamentos/' + id, 'DELETE');
  if (r.ok) cargar(); else alert((r.errores || []).join('\n'));
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const d = datos(form);
  const errs = Validators.validarMedicamento(d);
  mostrarErrores(errs);
  if (errs.length) return;
  const r = d.CodMedicamento
    ? await api('/medicamentos/' + d.CodMedicamento, 'PUT', d)
    : await api('/medicamentos', 'POST', d);
  if (r.ok) { modal.hide(); cargar(); } else mostrarErrores(r.errores);
});

(async () => { await cargarTipos(); await cargar(); })();