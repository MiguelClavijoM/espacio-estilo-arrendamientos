// Adaptador en memoria que implementa la MISMA interfaz que el adaptador
// Firestore (ver firestoreAdapter.js), pensado SOLO para desarrollo y
// pruebas locales dentro de este entorno, sin credenciales de Firebase.
// No usar en producción: los datos se pierden al reiniciar el proceso.

const { buildSeed } = require('./seedData');

let nextId = 1;
function genId() {
  return String(nextId++);
}

const collections = {
  propietarios: new Map(),
  arrendatarios: new Map(),
  inmuebles: new Map(),
  contratos: new Map(),
  pagos: new Map(),
  incrementos: new Map(),
};

function seedIfEmpty() {
  if (collections.propietarios.size > 0) return;

  const seed = buildSeed();
  const idMap = {}; // _seedId -> id real generado

  for (const p of seed.propietarios) {
    const id = genId();
    idMap[p._seedId] = id;
    const { _seedId, ...data } = p;
    collections.propietarios.set(id, { id, ...data });
  }
  for (const a of seed.arrendatarios) {
    const id = genId();
    idMap[a._seedId] = id;
    const { _seedId, ...data } = a;
    collections.arrendatarios.set(id, { id, ...data });
  }
  for (const i of seed.inmuebles) {
    const id = genId();
    idMap[i._seedId] = id;
    const { _seedId, ...data } = i;
    data.propietario_id = idMap[data.propietario_id];
    collections.inmuebles.set(id, { id, ...data });
  }
  for (const c of seed.contratos) {
    const id = genId();
    idMap[c._seedId] = id;
    const { _seedId, ...data } = c;
    data.inmueble_id = idMap[data.inmueble_id];
    data.arrendatario_id = idMap[data.arrendatario_id];
    data.propietario_id = idMap[data.propietario_id];
    collections.contratos.set(id, { id, ...data });
  }
  for (const pg of seed.pagos) {
    const id = genId();
    const data = { ...pg, contrato_id: idMap[pg.contrato_id] };
    collections.pagos.set(id, { id, ...data });
  }
  for (const inc of seed.incrementos) {
    const id = genId();
    const data = { ...inc, contrato_id: idMap[inc.contrato_id] };
    collections.incrementos.set(id, { id, ...data });
  }
  console.log('[mockAdapter] Datos semilla insertados en memoria.');
}

function makeRepo(name) {
  const store = collections[name];
  return {
    async all() {
      return Array.from(store.values()).sort((x, y) => Number(y.id) - Number(x.id));
    },
    async find(id) {
      return store.get(String(id)) || null;
    },
    async create(data) {
      const id = genId();
      store.set(id, { id, ...data });
      return id;
    },
    async update(id, data) {
      const current = store.get(String(id)) || {};
      store.set(String(id), { ...current, ...data, id: String(id) });
    },
    async remove(id) {
      store.delete(String(id));
    },
  };
}

module.exports = {
  name: 'mock (memoria local, sin Firebase)',
  seedIfEmpty,
  repos: {
    propietarios: makeRepo('propietarios'),
    arrendatarios: makeRepo('arrendatarios'),
    inmuebles: makeRepo('inmuebles'),
    contratos: makeRepo('contratos'),
    pagos: makeRepo('pagos'),
    incrementos: makeRepo('incrementos'),
  },
};
