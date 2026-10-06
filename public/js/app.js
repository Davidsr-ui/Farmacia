// Llama a la API con la cookie de sesión
async function api(url, method = 'GET', body) {
  const r = await fetch('/api' + url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({ ok: false, errores: ['Respuesta inválida del servidor.'] }));
  if (r.status === 401 && !/login|registro/.test(location.pathname)) location.href = '/login';
  return j;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function mostrarErrores(lista) {
  const box = document.getElementById('errores');
  if (!box) return;
  box.innerHTML = lista.map((e) => `<div>${esc(e)}</div>`).join('');
  box.classList.toggle('d-none', lista.length === 0);
}

const datos = (form) => Object.fromEntries(new FormData(form).entries());