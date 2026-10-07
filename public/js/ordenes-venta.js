const modal = new bootstrap.Modal(document.getElementById('modal'));
const modalVer = new bootstrap.Modal(document.getElementById('modal-ver'));
const form = document.getElementById('form');
const lineas = document.getElementById('lineas');
const puedeEditar = ROL === 'moderador' || ROL === 'administrador';
const puedeEliminar = ROL === 'administrador';
let lista = [], meds = [];

const fecha = (f) => (f ? String(f).slice(0, 10) : '');

async function cargar() {
  const r = await api('/ordenes-venta');
  lista = r.data || [];
  document.getElementById('tabla').innerHTML = lista.map((o) => `
    <tr>
      <td>${o.NroOrdenVta}</td><td>${fecha(o.fechaEmision)}</td><td>${esc(o.Motivo)}</td>
      <td>${esc(o.Situacion)}</td><td>${(o.detalles || []).length}</td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-info" onclick="ver(${o.NroOrdenVta})"><i class="bi bi-eye"></i></button>
        ${puedeEliminar ? `<button class="btn btn-sm btn-danger" onclick="eliminar(${o.NroOrdenVta})"><i class="bi bi-trash"></i></button>` : ''}
      </td>
    </tr>`).join('');
}

function agregarLinea() {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><select class="form-select form-select-sm med"><option value="">-- Seleccione --</option>
      ${meds.map((m) => `<option value="${m.CodMedicamento}">${esc(m.descripcionMed)}</option>`).join('')}</select></td>
    <td><input type="number" min="1" class="form-control form-control-sm cant"></td>
    <td><button type="button" class="btn btn-sm btn-outline-danger quitar"><i class="bi bi-x"></i></button></td>`;
  lineas.appendChild(tr);
}

lineas.addEventListener('click', (e) => { if (e.target.closest('.quitar')) e.target.closest('tr').remove(); });
document.getElementById('btn-linea').onclick = agregarLinea;

if (!puedeEditar) document.getElementById('btn-nuevo').classList.add('d-none');
document.getElementById('btn-nuevo').onclick = () => {
  form.reset();
  form.fechaEmision.value = new Date().toISOString().slice(0, 10);
  lineas.innerHTML = '';
  agregarLinea();
  mostrarErrores([]);
  modal.show();
};

window.ver = (id) => {
  const o = lista.find((x) => x.NroOrdenVta === id);
  document.getElementById('ver-titulo').textContent = `Orden de venta N° ${o.NroOrdenVta}`;
  document.getElementById('ver-cuerpo').innerHTML = `
    <p><b>Fecha:</b> ${fecha(o.fechaEmision)} &nbsp; <b>Situación:</b> ${esc(o.Situacion)}<br><b>Motivo:</b> ${esc(o.Motivo)}</p>
    <table class="table table-sm">
      <thead><tr><th>Medicamento</th><th>Cantidad</th></tr></thead>
      <tbody>${(o.detalles || []).map((d) => `<tr><td>${esc(d.descripcionMed)}</td><td>${d.cantidadRequerida}</td></tr>`).join('')}</tbody>
    </table>`;
  modalVer.show();
};

window.eliminar = async (id) => {
  if (!confirm('¿Eliminar esta orden y su detalle?')) return;
  const r = await api('/ordenes-venta/' + id, 'DELETE');
  if (r.ok) cargar(); else alert((r.errores || []).join('\n'));
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const d = datos(form);
  d.detalles = [...lineas.querySelectorAll('tr')].map((tr) => ({
    CodMedicamento: tr.querySelector('.med').value,
    cantidadRequerida: tr.querySelector('.cant').value,
  }));
  const errs = Validators.validarOrdenVenta(d);
  mostrarErrores(errs);
  if (errs.length) return;
  const r = await api('/ordenes-venta', 'POST', d);
  if (r.ok) { modal.hide(); cargar(); } else mostrarErrores(r.errores);
});

(async () => {
  meds = (await api('/medicamentos')).data || [];
  await cargar();
})();