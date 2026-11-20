const store = require('../db/datastore');

const propietarios = store.repos.propietarios;
const arrendatarios = store.repos.arrendatarios;
const inmuebles = store.repos.inmuebles;
const contratos = store.repos.contratos;
const pagos = store.repos.pagos;
const incrementos = store.repos.incrementos;

// ---- Consultas "enriquecidas" (equivalentes a los JOIN de SQL) ----
// Firestore es una base de datos documental sin JOIN nativo; estas
// funciones resuelven las relaciones en memoria, sobre los documentos
// ya traídos de cada colección.

async function inmueblesConPropietario() {
  const [items, props] = await Promise.all([inmuebles.all(), propietarios.all()]);
  const byId = Object.fromEntries(props.map(p => [p.id, p]));
  return items.map(inm => ({ ...inm, propietario_nombre: byId[inm.propietario_id]?.nombre || '—' }));
}

async function contratosDetallados() {
  const [items, inms, arrs, props] = await Promise.all([
    contratos.all(), inmuebles.all(), arrendatarios.all(), propietarios.all(),
  ]);
  const inmById = Object.fromEntries(inms.map(i => [i.id, i]));
  const arrById = Object.fromEntries(arrs.map(a => [a.id, a]));
  const propById = Object.fromEntries(props.map(p => [p.id, p]));
  return items.map(c => ({
    ...c,
    inmueble: inmById[c.inmueble_id]?.direccion || '—',
    arrendatario: arrById[c.arrendatario_id]?.nombre || '—',
    propietario: propById[c.propietario_id]?.nombre || '—',
  }));
}

async function pagosDetallados() {
  const [items, cons, arrs, inms] = await Promise.all([
    pagos.all(), contratos.all(), arrendatarios.all(), inmuebles.all(),
  ]);
  const conById = Object.fromEntries(cons.map(c => [c.id, c]));
  const arrById = Object.fromEntries(arrs.map(a => [a.id, a]));
  const inmById = Object.fromEntries(inms.map(i => [i.id, i]));
  return items.map(pg => {
    const contrato = conById[pg.contrato_id];
    return {
      ...pg,
      contrato_id: pg.contrato_id,
      arrendatario: contrato ? (arrById[contrato.arrendatario_id]?.nombre || '—') : '—',
      inmueble: contrato ? (inmById[contrato.inmueble_id]?.direccion || '—') : '—',
    };
  });
}

async function incrementosDetallados() {
  const [items, cons, arrs, inms] = await Promise.all([
    incrementos.all(), contratos.all(), arrendatarios.all(), inmuebles.all(),
  ]);
  const conById = Object.fromEntries(cons.map(c => [c.id, c]));
  const arrById = Object.fromEntries(arrs.map(a => [a.id, a]));
  const inmById = Object.fromEntries(inms.map(i => [i.id, i]));
  return items.map(inc => {
    const contrato = conById[inc.contrato_id];
    return {
      ...inc,
      contrato_id: inc.contrato_id,
      arrendatario: contrato ? (arrById[contrato.arrendatario_id]?.nombre || '—') : '—',
      inmueble: contrato ? (inmById[contrato.inmueble_id]?.direccion || '—') : '—',
    };
  });
}

// ---- Reglas de negocio ----

// Al registrar un pago, calcula automáticamente los días de mora
// (si fecha_pago es posterior al día de pago pactado del contrato) y
// el estado resultante ('Pagado', 'Pendiente' o 'En mora').
async function registrarPago(data) {
  const contrato = await contratos.find(data.contrato_id);
  let dias_mora = 0;
  let estado = data.estado || 'Pendiente';

  if (contrato && data.fecha_pago) {
    const [anio, mes] = data.periodo.split('-').map(Number);
    const diaPago = contrato.dia_pago || 5;
    const fechaLimite = new Date(Date.UTC(anio, mes - 1, diaPago));
    const fechaPago = new Date(data.fecha_pago);
    const diffMs = fechaPago.getTime() - fechaLimite.getTime();
    dias_mora = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    estado = dias_mora > 0 ? 'En mora' : 'Pagado';
  } else if (!data.fecha_pago) {
    estado = 'Pendiente';
  }

  return pagos.create({ ...data, dias_mora, estado });
}

// Al aplicar un incremento, recalcula el canon vigente del contrato
// asociado y marca el incremento como aplicado.
async function aplicarIncremento(id) {
  const inc = await incrementos.find(id);
  if (!inc) return null;
  const canonNuevo = Math.round(inc.canon_anterior * (1 + inc.porcentaje / 100));
  await incrementos.update(id, { aplicado: 1, canon_nuevo: canonNuevo });
  await contratos.update(inc.contrato_id, { canon: canonNuevo });
  return canonNuevo;
}

module.exports = {
  propietarios, arrendatarios, inmuebles, contratos, pagos, incrementos,
  inmueblesConPropietario, contratosDetallados, pagosDetallados, incrementosDetallados,
  registrarPago, aplicarIncremento,
};
