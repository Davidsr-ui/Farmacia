document.getElementById('form-registro').addEventListener('submit', async (e) => {
  e.preventDefault();
  const d = datos(e.target);
  const errs = Validators.validarRegistro(d);
  mostrarErrores(errs);
  if (errs.length) return;
  const r = await api('/auth/register', 'POST', d);
  if (r.ok) { alert('Registro exitoso. Inicie sesión.'); location.href = '/login'; }
  else mostrarErrores(r.errores);
});