const modal = new bootstrap.Modal(document.getElementById('modal'));
const modalVer = new bootstrap.Modal(document.getElementById('modal-ver'));
const form = document.getElementById('form');
const lineas = document.getElementById('lineas');
const puedeEditar = ROL === 'moderador' || ROL === 'administrador';
const puedeEliminar = ROL === 'administrador';
let lista = [], meds = [];

const fecha = (f) => (f ? String(f).slice(0, 10) : '');
const money = (n) => Number(n || 0).toFixed(2);

async function cargarCombos() {
  const labs = (await api('/laboratorios')).data || [];
  meds = (await api('/medicamentos')).data || [];
  document.getElementById('sel-lab').innerHTML = '<option value="">-- Seleccione --</option>' +
    labs.map((l) => `<option value="${l.CodLab}">${esc(l.razonSocial)}</option>`).join('');
}

async function cargar() {
  const r = await api('/ordenes-compra');
  lista = r.data || [];
  document.getElementById('tabla').innerHTML = lista.map((o) => `
    <tr>
      <td>${o.NroOrdenC}</td><td>${fecha(o.fechaEmision)}</td>
      <td>${esc(o.laboratorio ? o.laboratorio.razonSocial : o.CodLab)}</td>
      <td>${esc(o.NrofacturaProv)}</td><td>${esc(o.Situacion)}</td><td>S/ ${money(o.Total)}</td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-info" onclick="ver(${o.NroOrdenC})"><i class="bi bi-eye"></i></button>
        ${puedeEliminar ? `<button class="btn btn-sm btn-danger" onclick="eliminar(${o.NroOrdenC})"><i class="bi bi-trash"></i></button>` : ''}
      </td>
    </tr>`).join('');
}

function agregarLinea() {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><select class="form-select form-select-sm med"><option value="">-- Seleccione --</option>
      ${meds.map((m) => `<option value="${m.CodMedicamento}">${esc(m.descripcionMed)}</option>`).join('')}</select></td>
    <td><input type="number" min="1" class="form-control form-control-sm cant"></td>
    <td><input type="number" min="0" step="0.01" class="form-control form-control-sm precio"></td>
    <td class="text-end sub">0.00</td>
    <td><button type="button" class="btn btn-sm btn-outline-danger quitar"><i class="bi bi-x"></i></button></td>`;
  lineas.appendChild(tr);
}

function recalcular() {
  let total = 0;
  lineas.querySelectorAll('tr').forEach((tr) => {
    const sub = Number(tr.querySelector('.cant').value) * Number(tr.querySelector('.precio').value) || 0;
    tr.querySelector('.sub').textContent = money(sub);
    total += sub;
  });
  document.getElementById('total').textContent = money(total);
}

lineas.addEventListener('input', recalcular);
lineas.addEventListener('click', (e) => {
  if (e.target.closest('.quitar')) { e.target.closest('tr').remove(); recalcular(); }
});
document.getElementById('btn-linea').onclick = agregarLinea;

if (!puedeEditar) document.getElementById('btn-nuevo').classList.add('d-none');
document.getElementById('btn-nuevo').onclick = () => {
  form.reset();
  form.fechaEmision.value = new Date().toISOString().slice(0, 10);
  lineas.innerHTML = '';
  agregarLinea();
  recalcular();
  mostrarErrores([]);
  modal.show();
};

window.ver = (id) => {
  const o = lista.find((x) => x.NroOrdenC === id);
  document.getElementById('ver-titulo').textContent = `Orden de compra N° ${o.NroOrdenC}`;
  document.getElementById('ver-cuerpo').innerHTML = `
    <p><b>Fecha:</b> ${fecha(o.fechaEmision)} &nbsp; <b>Laboratorio:</b> ${esc(o.laboratorio && o.laboratorio.razonSocial)}
       &nbsp; <b>Situación:</b> ${esc(o.Situacion)}</p>
    <table class="table table-sm">
      <thead><tr><th>Medicamento</th><th>Cantidad</th><th>Precio</th><th class="text-end">Subtotal</th></tr></thead>
      <tbody>${(o.detalles || []).map((d) => `<tr><td>${esc(d.descripcion)}</td><td>${d.cantidad}</td>
        <td>${money(d.precio)}</td><td class="text-end">${money(d.montouni)}</td></tr>`).join('')}</tbody>
      <tfoot><tr><th colspan="3" class="text-end">Total</th><th class="text-end">S/ ${money(o.Total)}</th></tr></tfoot>
    </table>`;
  modalVer.show();
};

window.eliminar = async (id) => {
  if (!confirm('¿Eliminar esta orden y su detalle?')) return;
  const r = await api('/ordenes-compra/' + id, 'DELETE');
  if (r.ok) cargar(); else alert((r.errores || []).join('\n'));
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const d = datos(form);
  d.detalles = [...lineas.querySelectorAll('tr')].map((tr) => ({
    CodMedicamento: tr.querySelector('.med').value,
    cantidad: tr.querySelector('.cant').value,
    precio: tr.querySelector('.precio').value,
  }));
  const errs = Validators.validarOrdenCompra(d);
  mostrarErrores(errs);
  if (errs.length) return;
  const r = await api('/ordenes-compra', 'POST', d);
  if (r.ok) { modal.hide(); cargar(); } else mostrarErrores(r.errores);
});

(async () => { await cargarCombos(); await cargar(); })();