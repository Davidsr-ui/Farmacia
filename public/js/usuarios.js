const ROLES = ['usuario', 'moderador', 'administrador'];

async function cargar() {
  const r = await api('/usuarios');
  document.getElementById('tabla').innerHTML = (r.data || []).map((u) => `
    <tr>
      <td>${u.id}</td><td>${esc(u.nombre)}</td><td>${esc(u.email)}</td>
      <td>
        <select class="form-select form-select-sm" onchange="cambiarRol(${u.id}, this.value)">
          ${ROLES.map((x) => `<option ${x === u.role ? 'selected' : ''}>${x}</option>`).join('')}
        </select>
      </td>
      <td class="text-end">
        <button class="btn btn-sm btn-danger" onclick="eliminar(${u.id})"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`).join('');
}

window.cambiarRol = async (id, role) => {
  const r = await api('/usuarios/' + id, 'PUT', { role });
  if (!r.ok) alert((r.errores || []).join('\n'));
};
window.eliminar = async (id) => {
  if (!confirm('¿Eliminar este usuario?')) return;
  const r = await api('/usuarios/' + id, 'DELETE');
  if (r.ok) cargar(); else alert((r.errores || []).join('\n'));
};
cargar();