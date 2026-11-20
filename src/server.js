const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const store = require('./db/datastore');

const app = express();
const PORT = process.env.PORT || 4000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes'));

// Manejador de errores básico (captura rechazos de promesas de las rutas async).
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(`<pre>Error: ${err.message}</pre>`);
});

async function start() {
  await store.seedIfEmpty();
  app.listen(PORT, () => {
    console.log(`Prototipo ESPACIO & ESTILO INMOBILIARIA corriendo en http://localhost:${PORT}`);
    console.log(`Motor de datos activo: ${store.name} (DB_DRIVER=${process.env.DB_DRIVER || 'mock'})`);
  });
}

start().catch(err => {
  console.error('No se pudo iniciar el servidor:', err);
  process.exit(1);
});
