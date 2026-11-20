// Selector de adaptador de persistencia.
// DB_DRIVER=firestore -> usa Firebase Firestore (requiere credenciales reales).
// Cualquier otro valor (o ninguno) -> usa el adaptador mock en memoria,
// pensado para desarrollo y pruebas locales sin configurar Firebase.

const driver = (process.env.DB_DRIVER || 'mock').toLowerCase();

let adapter;
if (driver === 'firestore') {
  adapter = require('./firestoreAdapter');
  adapter.init();
} else {
  adapter = require('./mockAdapter');
}

module.exports = adapter;
