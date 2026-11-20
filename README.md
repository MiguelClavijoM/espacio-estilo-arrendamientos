# Prototipo — Sistema de información para la gestión integral de arrendamientos
### ESPACIO & ESTILO INMOBILIARIA (Armenia, Quindío)

Proyecto de Grado — UNAD, Ingeniería de Sistemas. Estudiantes: Luis Miguel Clavijo Muñoz y Jazmín Jaramillo Salcedo. Tutor: Orlando Gómez Barboza.

Prototipo funcional (Fase 4) desarrollado en **Node.js + Express + EJS**, con **Firebase Firestore** como base de datos en producción. Arquitectura monolítica de tres capas (rutas/presentación, servicios/lógica de negocio, adaptador de datos).

## Módulos implementados

- Propietarios, arrendatarios e inmuebles (CRUD completo).
- Contratos (CRUD, vinculando inmueble + arrendatario + propietario).
- Pagos: registro con cálculo automático de días de mora y estado (Pagado / Pendiente / En mora) según la fecha de pago frente al día pactado del contrato.
- Incrementos contractuales: registro y aplicación, con recálculo automático del canon vigente del contrato al aplicar.
- Tablero de alertas: contratos próximos a vencer (60-90 días), arrendatarios en mora e incrementos pendientes de aplicar.

## Dos modos de ejecución

El driver de base de datos se selecciona con la variable de entorno `DB_DRIVER`:

| Modo | Variable | Uso |
|---|---|---|
| **Mock (memoria local)** | `DB_DRIVER=mock` (o sin definir) | Desarrollo y pruebas rápidas, sin necesidad de credenciales. Los datos se pierden al reiniciar el proceso. |
| **Firestore (producción)** | `DB_DRIVER=firestore` | Datos persistentes en un proyecto real de Firebase. Requiere la configuración de la sección siguiente. |

Ambos modos usan exactamente la misma lógica de negocio y las mismas vistas; solo cambia el adaptador de persistencia (`src/db/mockAdapter.js` vs `src/db/firestoreAdapter.js`), que implementan la misma interfaz (`all`, `find`, `create`, `update`, `remove`).

## Instalación

```bash
npm install
```

## Ejecutar en modo mock (sin Firebase, recomendado para pruebas rápidas)

```bash
npm run start:mock
```

El servidor queda disponible en `http://localhost:4000`, con datos semilla precargados (propietarios, arrendatarios, inmuebles, contratos, pagos e incrementos de ejemplo).

## Configuración de Firebase (modo producción)

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com).
2. En el menú **Build → Firestore Database**, crea una base de datos (modo producción o de prueba).
3. En **Configuración del proyecto → Cuentas de servicio**, genera una nueva clave privada (botón "Generar nueva clave privada"). Se descarga un archivo `.json`.
4. Guarda ese archivo en la raíz del proyecto como `serviceAccountKey.json` (ya está excluido en `.gitignore`, nunca se sube al repositorio).
5. Define la variable de entorno `GOOGLE_APPLICATION_CREDENTIALS` apuntando a ese archivo:

   - Windows (PowerShell): `$env:GOOGLE_APPLICATION_CREDENTIALS="serviceAccountKey.json"`
   - Linux/macOS: `export GOOGLE_APPLICATION_CREDENTIALS=serviceAccountKey.json`

6. Ejecuta:

   ```bash
   npm run start:firestore
   ```

   En el primer arranque, el sistema detecta que las colecciones están vacías y carga automáticamente los mismos datos semilla del modo mock, directamente en Firestore.

> **Nota:** la verificación funcional de este prototipo (casos de prueba de caja negra, numeral "Desarrollo del prototipo" del Documento Maestro) se ejecutó en modo mock, porque el entorno de desarrollo usado para construirlo no tenía salida de red hacia los servidores de Firebase. La lógica de negocio y las vistas son idénticas en ambos modos; antes de la entrega final se recomienda ejecutar `npm run start:firestore` desde un computador con Firebase configurado, para confirmar la conexión real con Firestore.

## Estructura del proyecto

```
app/
├── src/
│   ├── server.js              # Punto de entrada (Express)
│   ├── db/
│   │   ├── datastore.js       # Selector de adaptador (mock | firestore)
│   │   ├── mockAdapter.js      # Adaptador en memoria (desarrollo/pruebas)
│   │   ├── firestoreAdapter.js # Adaptador Firestore (producción)
│   │   └── seedData.js        # Datos semilla compartidos por ambos adaptadores
│   ├── services/
│   │   ├── repo.js            # Acceso a datos + reglas de negocio (mora, incrementos)
│   │   └── dashboard.js       # Consultas del tablero de alertas
│   ├── routes/index.js        # Rutas HTTP (CRUD de cada módulo)
│   ├── views/                 # Plantillas EJS
│   └── public/css/style.css
├── package.json
└── .gitignore
```

## Pruebas funcionales realizadas (modo mock)

- CRUD completo verificado en propietarios, arrendatarios, inmuebles y contratos.
- Registro de pago con fecha posterior al día de pago pactado → el sistema calculó automáticamente los días de mora y marcó el pago como "En mora".
- Aplicación de un incremento del 5.2% sobre un contrato con canon de $950.000 → el sistema actualizó el canon del contrato a $999.400 y marcó el incremento como aplicado.
- Tablero de alertas: verificado que refleja correctamente vencimientos próximos, mora activa e incrementos pendientes tras cada operación.

El detalle completo de la matriz de pruebas de caja negra se encuentra en el Documento Maestro de la Fase 4, numeral "Desarrollo del prototipo".
