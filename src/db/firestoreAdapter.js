// Adaptador de persistencia sobre Firebase Firestore (producción).
// Requiere credenciales de un proyecto Firebase real (ver README.md,
// sección "Configuración de Firebase"). NO intenta conectarse salvo
// que se invoque explícitamente (DB_DRIVER=firestore).

const admin = require('firebase-admin');
const { buildSeed } = require('./seedData');

let db = null;

function init() {
  if (admin.apps.length === 0) {
    // Usa GOOGLE_APPLICATION_CREDENTIALS (ruta a serviceAccountKey.json)
    // o credenciales por defecto del entorno (ADC).
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
  db = admin.firestore();
}

function col(name) {
  return db.collection(name);
}

function makeRepo(name) {
  return {
    async all() {
      const snap = await col(name).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.id < b.id ? 1 : -1));
    },
    async find(id) {
      const doc = await col(name).doc(String(id)).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },
    async create(data) {
      const ref = await col(name).add(data);
      return ref.id;
    },
    async update(id, data) {
      await col(name).doc(String(id)).set(data, { merge: true });
    },
    async remove(id) {
      await col(name).doc(String(id)).delete();
    },
  };
}

async function seedIfEmpty() {
  const snap = await col('propietarios').limit(1).get();
  if (!snap.empty) return;

  console.log('[firestoreAdapter] Insertando datos semilla en Firestore...');
  const seed = buildSeed();
  const idMap = {};
  const batch = db.batch();

  for (const p of seed.propietarios) {
    const ref = col('propietarios').doc();
    idMap[p._seedId] = ref.id;
    const { _seedId, ...data } = p;
    batch.set(ref, data);
  }
  for (const a of seed.arrendatarios) {
    const ref = col('arrendatarios').doc();
    idMap[a._seedId] = ref.id;
    const { _seedId, ...data } = a;
    batch.set(ref, data);
  }
  for (const i of seed.inmuebles) {
    const ref = col('inmuebles').doc();
    idMap[i._seedId] = ref.id;
    const { _seedId, ...data } = i;
    data.propietario_id = idMap[data.propietario_id];
    batch.set(ref, data);
  }
  for (const c of seed.contratos) {
    const ref = col('contratos').doc();
    idMap[c._seedId] = ref.id;
    const { _seedId, ...data } = c;
    data.inmueble_id = idMap[data.inmueble_id];
    data.arrendatario_id = idMap[data.arrendatario_id];
    data.propietario_id = idMap[data.propietario_id];
    batch.set(ref, data);
  }
  for (const pg of seed.pagos) {
    const ref = col('pagos').doc();
    batch.set(ref, { ...pg, contrato_id: idMap[pg.contrato_id] });
  }
  for (const inc of seed.incrementos) {
    const ref = col('incrementos').doc();
    batch.set(ref, { ...inc, contrato_id: idMap[inc.contrato_id] });
  }

  await batch.commit();
  console.log('[firestoreAdapter] Datos semilla insertados.');
}

module.exports = {
  name: 'firestore',
  init,
  seedIfEmpty,
  get repos() {
    return {
      propietarios: makeRepo('propietarios'),
      arrendatarios: makeRepo('arrendatarios'),
      inmuebles: makeRepo('inmuebles'),
      contratos: makeRepo('contratos'),
      pagos: makeRepo('pagos'),
      incrementos: makeRepo('incrementos'),
    };
  },
};
