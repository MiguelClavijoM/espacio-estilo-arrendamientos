const express = require('express');
const router = express.Router();
const repo = require('../services/repo');
const dash = require('../services/dashboard');

// Envuelve un handler async para capturar errores y pasarlos a Express.
const h = fn => (req, res, next) => fn(req, res, next).catch(next);

// ---------- Tablero / Dashboard ----------
router.get('/', h(async (req, res) => {
  const [totales, vencimientos, moras, incrementosPendientes] = await Promise.all([
    dash.resumen(), dash.contratosProximosAVencer(60, 90), dash.arrendatariosEnMora(), dash.incrementosPendientes(),
  ]);
  res.render('dashboard', { totales, vencimientos, moras, incrementosPendientes });
}));

// ---------- Propietarios ----------
router.get('/propietarios', h(async (req, res) => {
  res.render('propietarios/list', { items: await repo.propietarios.all() });
}));
router.get('/propietarios/nuevo', (req, res) => {
  res.render('propietarios/form', { item: {}, action: '/propietarios' });
});
router.post('/propietarios', h(async (req, res) => {
  await repo.propietarios.create(req.body);
  res.redirect('/propietarios');
}));
router.get('/propietarios/:id/editar', h(async (req, res) => {
  res.render('propietarios/form', { item: await repo.propietarios.find(req.params.id), action: `/propietarios/${req.params.id}?_method=PUT` });
}));
router.put('/propietarios/:id', h(async (req, res) => {
  await repo.propietarios.update(req.params.id, req.body);
  res.redirect('/propietarios');
}));
router.delete('/propietarios/:id', h(async (req, res) => {
  await repo.propietarios.remove(req.params.id);
  res.redirect('/propietarios');
}));

// ---------- Arrendatarios ----------
router.get('/arrendatarios', h(async (req, res) => {
  res.render('arrendatarios/list', { items: await repo.arrendatarios.all() });
}));
router.get('/arrendatarios/nuevo', (req, res) => {
  res.render('arrendatarios/form', { item: {}, action: '/arrendatarios' });
});
router.post('/arrendatarios', h(async (req, res) => {
  await repo.arrendatarios.create(req.body);
  res.redirect('/arrendatarios');
}));
router.get('/arrendatarios/:id/editar', h(async (req, res) => {
  res.render('arrendatarios/form', { item: await repo.arrendatarios.find(req.params.id), action: `/arrendatarios/${req.params.id}?_method=PUT` });
}));
router.put('/arrendatarios/:id', h(async (req, res) => {
  await repo.arrendatarios.update(req.params.id, req.body);
  res.redirect('/arrendatarios');
}));
router.delete('/arrendatarios/:id', h(async (req, res) => {
  await repo.arrendatarios.remove(req.params.id);
  res.redirect('/arrendatarios');
}));

// ---------- Inmuebles ----------
router.get('/inmuebles', h(async (req, res) => {
  res.render('inmuebles/list', { items: await repo.inmueblesConPropietario() });
}));
router.get('/inmuebles/nuevo', h(async (req, res) => {
  res.render('inmuebles/form', { item: {}, propietarios: await repo.propietarios.all(), action: '/inmuebles' });
}));
router.post('/inmuebles', h(async (req, res) => {
  await repo.inmuebles.create(req.body);
  res.redirect('/inmuebles');
}));
router.get('/inmuebles/:id/editar', h(async (req, res) => {
  res.render('inmuebles/form', {
    item: await repo.inmuebles.find(req.params.id),
    propietarios: await repo.propietarios.all(),
    action: `/inmuebles/${req.params.id}?_method=PUT`,
  });
}));
router.put('/inmuebles/:id', h(async (req, res) => {
  await repo.inmuebles.update(req.params.id, req.body);
  res.redirect('/inmuebles');
}));
router.delete('/inmuebles/:id', h(async (req, res) => {
  await repo.inmuebles.remove(req.params.id);
  res.redirect('/inmuebles');
}));

// ---------- Contratos ----------
router.get('/contratos', h(async (req, res) => {
  res.render('contratos/list', { items: await repo.contratosDetallados() });
}));
router.get('/contratos/nuevo', h(async (req, res) => {
  const [inmuebles, arrendatarios, propietarios] = await Promise.all([
    repo.inmuebles.all(), repo.arrendatarios.all(), repo.propietarios.all(),
  ]);
  res.render('contratos/form', { item: {}, action: '/contratos', inmuebles, arrendatarios, propietarios });
}));
router.post('/contratos', h(async (req, res) => {
  await repo.contratos.create(req.body);
  res.redirect('/contratos');
}));
router.get('/contratos/:id/editar', h(async (req, res) => {
  const [item, inmuebles, arrendatarios, propietarios] = await Promise.all([
    repo.contratos.find(req.params.id), repo.inmuebles.all(), repo.arrendatarios.all(), repo.propietarios.all(),
  ]);
  res.render('contratos/form', { item, action: `/contratos/${req.params.id}?_method=PUT`, inmuebles, arrendatarios, propietarios });
}));
router.put('/contratos/:id', h(async (req, res) => {
  await repo.contratos.update(req.params.id, req.body);
  res.redirect('/contratos');
}));
router.delete('/contratos/:id', h(async (req, res) => {
  await repo.contratos.remove(req.params.id);
  res.redirect('/contratos');
}));

// ---------- Pagos (cánones y mora) ----------
router.get('/pagos', h(async (req, res) => {
  res.render('pagos/list', { items: await repo.pagosDetallados() });
}));
router.get('/pagos/nuevo', h(async (req, res) => {
  res.render('pagos/form', { item: {}, action: '/pagos', contratos: await repo.contratosDetallados() });
}));
router.post('/pagos', h(async (req, res) => {
  // Registrar un pago aplica automáticamente la regla de negocio de mora (repo.registrarPago).
  await repo.registrarPago(req.body);
  res.redirect('/pagos');
}));
router.get('/pagos/:id/editar', h(async (req, res) => {
  res.render('pagos/form', { item: await repo.pagos.find(req.params.id), action: `/pagos/${req.params.id}?_method=PUT`, contratos: await repo.contratosDetallados() });
}));
router.put('/pagos/:id', h(async (req, res) => {
  await repo.pagos.update(req.params.id, req.body);
  res.redirect('/pagos');
}));
router.delete('/pagos/:id', h(async (req, res) => {
  await repo.pagos.remove(req.params.id);
  res.redirect('/pagos');
}));

// ---------- Incrementos ----------
router.get('/incrementos', h(async (req, res) => {
  res.render('incrementos/list', { items: await repo.incrementosDetallados() });
}));
router.get('/incrementos/nuevo', h(async (req, res) => {
  res.render('incrementos/form', { item: {}, action: '/incrementos', contratos: await repo.contratosDetallados() });
}));
router.post('/incrementos', h(async (req, res) => {
  await repo.incrementos.create(req.body);
  res.redirect('/incrementos');
}));
router.get('/incrementos/:id/editar', h(async (req, res) => {
  res.render('incrementos/form', { item: await repo.incrementos.find(req.params.id), action: `/incrementos/${req.params.id}?_method=PUT`, contratos: await repo.contratosDetallados() });
}));
router.put('/incrementos/:id', h(async (req, res) => {
  await repo.incrementos.update(req.params.id, req.body);
  res.redirect('/incrementos');
}));
// Aplica el incremento: recalcula el canon del contrato (regla de negocio, repo.aplicarIncremento).
router.post('/incrementos/:id/aplicar', h(async (req, res) => {
  await repo.aplicarIncremento(req.params.id);
  res.redirect('/incrementos');
}));
router.delete('/incrementos/:id', h(async (req, res) => {
  await repo.incrementos.remove(req.params.id);
  res.redirect('/incrementos');
}));

module.exports = router;
