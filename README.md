# Prototipo — Sistema de información para la gestión integral de arrendamientos

**ESPACIO & ESTILO INMOBILIARIA — Armenia, Quindío**

Proyecto de Grado (Proyecto Aplicado), UNAD — Ingeniería de Sistemas · Fase 4
**Estudiantes:** Luis Miguel Clavijo Muñoz y Jazmín Jaramillo Salcedo
**Tutor:** Orlando Gómez Barboza

---

## 1. ¿Qué es este repositorio?

Es el **prototipo funcional (TRL 5)** del sistema descrito en el Documento Maestro del proyecto. Centraliza la información de arrendamientos de la inmobiliaria, que antes estaba dispersa en Excel, WhatsApp y papel, y genera alertas automáticas de vencimientos, mora e incrementos.

**Tecnología:** Node.js + Express, vistas EJS renderizadas en el servidor y Firebase Firestore como base de datos. Arquitectura monolítica de tres capas (rutas, servicios con lógica de negocio y adaptador de datos).

## 2. ¿Qué hace el sistema?

| Módulo | Funcionalidad |
|---|---|
| Propietarios, arrendatarios e inmuebles | Crear, consultar, editar y eliminar (CRUD). |
| Contratos | CRUD vinculando un inmueble, un arrendatario y un propietario. |
| Pagos | Registro con cálculo automático de días de mora y estado (Pagado / Pendiente / En mora). |
| Incrementos | Registro y aplicación; al aplicar se recalcula el canon vigente del contrato. |
| Tablero de alertas | Contratos por vencer (60-90 días), arrendatarios en mora e incrementos pendientes. |

## 3. Cómo verlo funcionando (para el tutor)

**Requisito:** tener [Node.js](https://nodejs.org) 18 o superior instalado. No se necesita cuenta de GitHub, de Firebase ni credenciales.

1. Descargar el código: en esta página, botón verde **Code → Download ZIP**, y descomprimirlo. (O con Git: `git clone https://github.com/MiguelClavijoM/espacio-estilo-arrendamientos.git`).
2. Abrir una terminal dentro de la carpeta del proyecto (la que contiene `package.json`) e instalar dependencias:

   ```bash
   npm install
   ```

3. Iniciar el prototipo en **modo demostración** (datos de ejemplo en memoria):

   ```bash
   npm run start:mock
   ```

4. Abrir en el navegador: **http://localhost:4000**

Se verá el tablero con datos de ejemplo ya cargados. En el menú se puede entrar a cada módulo. En modo demostración los datos viven en memoria y se reinician al cerrar el servidor.

**Recorrido sugerido (5 minutos):**
1. Ver el **tablero** con sus tres alertas.
2. Entrar a **Pagos → Nuevo** y registrar un pago con fecha posterior al día pactado: el sistema calcula los días de mora y lo marca "En mora".
3. Entrar a **Incrementos**, aplicar uno pendiente y revisar en **Contratos** que el canon se actualizó.
4. Volver al **tablero** y comprobar que las alertas reflejan los cambios.

## 4. Modos de ejecución

El motor de datos se elige con la variable `DB_DRIVER`. La lógica de negocio y las vistas son idénticas en ambos modos; solo cambia el adaptador de persistencia, que implementa la misma interfaz (`all`, `find`, `create`, `update`, `remove`).

| Modo | Comando | Datos |
|---|---|---|
| Demostración | `npm run start:mock` | En memoria, se pierden al reiniciar. No requiere credenciales. |
| Firestore | `npm run start:firestore` | Persistentes en un proyecto de Firebase. Requiere credenciales (sección 5). |

El prototipo fue ejecutado por los estudiantes contra un proyecto real de Firestore, con datos de ejemplo cargados en la primera ejecución y operaciones de escritura persistidas en la nube.

## 5. Ejecutar con Firestore (opcional)

Las credenciales del proyecto de los estudiantes **no** se incluyen en el repositorio por seguridad. Para usar Firestore con otro proyecto:

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com) y habilitar **Firestore Database**.
2. En **Configuración del proyecto → Cuentas de servicio**, generar una clave privada y guardarla en la raíz como `serviceAccountKey.json` (ya está en `.gitignore`).
3. Indicar la ruta de la clave y ejecutar:

   - Windows (PowerShell):
     ```powershell
     $env:GOOGLE_APPLICATION_CREDENTIALS = "$PWD\serviceAccountKey.json"
     npm run start:firestore
     ```
   - Linux/macOS:
     ```bash
     export GOOGLE_APPLICATION_CREDENTIALS=serviceAccountKey.json
     npm run start:firestore
     ```

En el primer arranque, si la colección `propietarios` está vacía, se cargan automáticamente los datos de ejemplo (ficticios) de `src/db/seedData.js`.

## 6. Estructura del proyecto

```
├── src/
│   ├── server.js                # Punto de entrada (Express, puerto 4000)
│   ├── routes/index.js          # Rutas HTTP de cada módulo
│   ├── services/
│   │   ├── repo.js              # Reglas de negocio (mora, incrementos)
│   │   └── dashboard.js         # Consultas del tablero de alertas
│   ├── db/
│   │   ├── datastore.js         # Selector de adaptador (mock | firestore)
│   │   ├── mockAdapter.js       # Adaptador en memoria
│   │   ├── firestoreAdapter.js  # Adaptador Firestore
│   │   └── seedData.js          # Datos de ejemplo (ficticios)
│   ├── views/                   # Plantillas EJS
│   └── public/css/style.css
├── package.json
└── .gitignore
```

## 7. Relación con el Documento Maestro

- **Diseño de la solución:** diagramas de casos de uso, clases, entidad-relación y wireframe.
- **Desarrollo del prototipo:** Sprint Review y matriz de pruebas funcionales de caja negra.
- **Anexo 3:** enlace a este repositorio y al video de socialización.

Los datos incluidos en el repositorio son ficticios y solo sirven para demostración.
