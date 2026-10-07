const modal = new bootstrap.Modal(document.getElementById('modal'));
const form = document.getElementById('form');
const puedeEliminar = ROL === 'administrador';
let lista = [];

async function cargar() {
  const r = await api('/laboratorios');
  lista = r.data || [];
  document.getElementById('tabla').innerHTML = lista.map((l) => `
    <tr>
      <td>${l.CodLab}</td><td>${esc(l.razonSocial)}</td><td>${esc(l.direccion)}</td>
      <td>${esc(l.telefono)}</td><td>${esc(l.email)}</td><td>${esc(l.contacto)}</td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-warning" onclick="editar(${l.CodLab})"><i class="bi bi-pencil"></i></button>
        ${puedeEliminar ? `<button class="btn btn-sm btn-danger" onclick="eliminar(${l.CodLab})"><i class="bi bi-trash"></i></button>` : ''}
      </td>
    </tr>`).join('');
}

function abrir(titulo, l = {}) {
  document.getElementById('modal-titulo').textContent = titulo;
  ['CodLab', 'razonSocial', 'direccion', 'telefono', 'email', 'contacto']
    .forEach((c) => { form[c].value = l[c] || ''; });
  mostrarErrores([]);
  modal.show();
}
document.getElementById('btn-nuevo').onclick = () => abrir('Nuevo laboratorio');
window.editar = (id) => abrir('Editar laboratorio', lista.find((l) => l.CodLab === id));

window.eliminar = async (id) => {
  if (!confirm('¿Eliminar este laboratorio?')) return;
  const r = await api('/laboratorios/' + id, 'DELETE');
  if (r.ok) cargar(); else alert((r.errores || []).join('\n'));
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const d = datos(form);
  const errs = Validators.validarLaboratorio(d);
  mostrarErrores(errs);
  if (errs.length) return;
  const r = d.CodLab ? await api('/laboratorios/' + d.CodLab, 'PUT', d) : await api('/laboratorios', 'POST', d);
  if (r.ok) { modal.hide(); cargar(); } else mostrarErrores(r.errores);
});

cargar();