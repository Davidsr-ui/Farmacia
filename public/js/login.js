document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const d = datos(e.target);
  const errs = Validators.validarLogin(d);   // validación en el front, antes de enviar
  mostrarErrores(errs);
  if (errs.length) return;
  const r = await api('/auth/login', 'POST', d);
  if (r.ok) location.href = '/menu';
  else mostrarErrores(r.errores);
});