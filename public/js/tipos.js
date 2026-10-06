const modal = new bootstrap.Modal(document.getElementById('modal'));
const form = document.getElementById('form');
const puedeEliminar = ROL === 'administrador';
let lista = [];

async function cargar() {
  const r = await api('/tipos');
  lista = r.data || [];
  document.getElementById('tabla').innerHTML = lista.map((t) => `
    <tr>
      <td>${t.CodTipoMed}</td>
      <td>${esc(t.descripcion)}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-warning" onclick="editar(${t.CodTipoMed})">
          <i class="bi bi-pencil"></i></button>
        ${puedeEliminar ? `<button class="btn btn-sm btn-danger" onclick="eliminar(${t.CodTipoMed})">
          <i class="bi bi-trash"></i></button>` : ''}
      </td>
    </tr>`).join('');
}

function abrir(titulo, t = {}) {
  document.getElementById('modal-titulo').textContent = titulo;
  form.CodTipoMed.value = t.CodTipoMed || '';
  form.descripcion.value = t.descripcion || '';
  mostrarErrores([]);
  modal.show();
}
document.getElementById('btn-nuevo').onclick = () => abrir('Nuevo tipo');
window.editar = (id) => abrir('Editar tipo', lista.find((t) => t.CodTipoMed === id));

window.eliminar = async (id) => {
  if (!confirm('¿Eliminar este tipo?')) return;
  const r = await api('/tipos/' + id, 'DELETE');
  if (r.ok) cargar(); else alert((r.errores || []).join('\n'));
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const d = datos(form);
  const errs = Validators.validarTipo(d);
  mostrarErrores(errs);
  if (errs.length) return;
  const r = d.CodTipoMed
    ? await api('/tipos/' + d.CodTipoMed, 'PUT', d)
    : await api('/tipos', 'POST', d);
  if (r.ok) { modal.hide(); cargar(); } else mostrarErrores(r.errores);
});

cargar();