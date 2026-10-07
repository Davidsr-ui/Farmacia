const modal = new bootstrap.Modal(document.getElementById('modal'));
const form = document.getElementById('form');
const puedeEliminar = ROL === 'administrador';
let lista = [];

async function cargar() {
  const r = await api('/especialidades');
  lista = r.data || [];
  document.getElementById('tabla').innerHTML = lista.map((t) => `
    <tr>
      <td>${t.CodEspec}</td>
      <td>${esc(t.descripcionEsp)}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-warning" onclick="editar(${t.CodEspec})"><i class="bi bi-pencil"></i></button>
        ${puedeEliminar ? `<button class="btn btn-sm btn-danger" onclick="eliminar(${t.CodEspec})"><i class="bi bi-trash"></i></button>` : ''}
      </td>
    </tr>`).join('');
}

function abrir(titulo, t = {}) {
  document.getElementById('modal-titulo').textContent = titulo;
  form.CodEspec.value = t.CodEspec || '';
  form.descripcionEsp.value = t.descripcionEsp || '';
  mostrarErrores([]);
  modal.show();
}
document.getElementById('btn-nuevo').onclick = () => abrir('Nueva especialidad');
window.editar = (id) => abrir('Editar especialidad', lista.find((t) => t.CodEspec === id));

window.eliminar = async (id) => {
  if (!confirm('¿Eliminar esta especialidad?')) return;
  const r = await api('/especialidades/' + id, 'DELETE');
  if (r.ok) cargar(); else alert((r.errores || []).join('\n'));
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const d = datos(form);
  const errs = Validators.validarEspecialidad(d);
  mostrarErrores(errs);
  if (errs.length) return;
  const r = d.CodEspec
    ? await api('/especialidades/' + d.CodEspec, 'PUT', d)
    : await api('/especialidades', 'POST', d);
  if (r.ok) { modal.hide(); cargar(); } else mostrarErrores(r.errores);
});

cargar();