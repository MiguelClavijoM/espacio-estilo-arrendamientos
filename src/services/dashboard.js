const repo = require('./repo');

function diasEntre(fechaISO) {
  const hoy = new Date();
  const fecha = new Date(fechaISO);
  return Math.round((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

async function contratosProximosAVencer(diasMin = 0, diasMax = 90) {
  const detallados = await repo.contratosDetallados();
  return detallados
    .filter(c => c.estado === 'Vigente')
    .map(c => ({ ...c, dias_restantes: diasEntre(c.fecha_fin) }))
    .filter(c => c.dias_restantes >= diasMin && c.dias_restantes <= diasMax)
    .sort((a, b) => a.dias_restantes - b.dias_restantes);
}

async function arrendatariosEnMora() {
  const pagos = await repo.pagosDetallados();
  return pagos
    .filter(p => p.estado === 'En mora')
    .sort((a, b) => (b.dias_mora || 0) - (a.dias_mora || 0))
    .map(p => ({ ...p, pago_id: p.id }));
}

async function incrementosPendientes() {
  const incs = await repo.incrementosDetallados();
  return incs
    .filter(i => Number(i.aplicado) === 0)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
}

async function resumen() {
  const [props, arrs, inms, contratos] = await Promise.all([
    repo.propietarios.all(), repo.arrendatarios.all(), repo.inmuebles.all(), repo.contratos.all(),
  ]);
  return {
    propietarios: props.length,
    arrendatarios: arrs.length,
    inmuebles: inms.length,
    contratos_vigentes: contratos.filter(c => c.estado === 'Vigente').length,
  };
}

module.exports = { contratosProximosAVencer, arrendatariosEnMora, incrementosPendientes, resumen };
