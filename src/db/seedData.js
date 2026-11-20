// Datos semilla compartidos entre el adaptador Firestore y el adaptador mock.
// Los IDs aquí (p1, a1, i1, c1...) son solo claves internas de referencia
// para enlazar las relaciones al momento de sembrar; el ID real de cada
// documento lo asigna el adaptador (Firestore autogenera el suyo; el mock
// usa un contador incremental).

function buildSeed() {
  const propietarios = [
    { _seedId: 'p1', nombre: 'Carlos Andrés Restrepo', documento: '18.345.221', telefono: '3104567890', correo: 'carlos.restrepo@example.com', direccion: 'Cra 14 #12-30, Armenia' },
    { _seedId: 'p2', nombre: 'María Elena Soto', documento: '41.223.998', telefono: '3157891234', correo: 'maria.soto@example.com', direccion: 'Calle 20 #8-15, Armenia' },
    { _seedId: 'p3', nombre: 'Jorge Iván Gómez', documento: '9.887.112', telefono: '3001122334', correo: 'jorge.gomez@example.com', direccion: 'Av. Bolívar #45-10, Armenia' },
  ];

  const arrendatarios = [
    { _seedId: 'a1', nombre: 'Laura Jiménez Ortiz', documento: '1.094.556.221', telefono: '3112223344', correo: 'laura.jimenez@example.com' },
    { _seedId: 'a2', nombre: 'Comercial Andina SAS', documento: '900.332.112-1', telefono: '3209998877', correo: 'contacto@comercialandina.com' },
    { _seedId: 'a3', nombre: 'Felipe Rendón Cárdenas', documento: '1.088.776.554', telefono: '3005554433', correo: 'felipe.rendon@example.com' },
  ];

  const inmuebles = [
    { _seedId: 'i1', propietario_id: 'p1', direccion: 'Cra 14 #12-30 Apto 301, Armenia', tipo: 'Vivienda urbana', estrato: 4, estado: 'Arrendado', valor_referencia: 950000 },
    { _seedId: 'i2', propietario_id: 'p2', direccion: 'Calle 20 #8-15 Local 2, Armenia', tipo: 'Local comercial', estrato: 3, estado: 'Arrendado', valor_referencia: 1800000 },
    { _seedId: 'i3', propietario_id: 'p3', direccion: 'Av. Bolívar #45-10 Casa, Armenia', tipo: 'Vivienda urbana', estrato: 3, estado: 'Disponible', valor_referencia: 1100000 },
  ];

  const contratos = [
    { _seedId: 'c1', inmueble_id: 'i1', arrendatario_id: 'a1', propietario_id: 'p1', canon: 950000, fecha_inicio: '2026-01-05', fecha_fin: '2027-01-25', dia_pago: 5, estado: 'Vigente' },
    { _seedId: 'c2', inmueble_id: 'i2', arrendatario_id: 'a2', propietario_id: 'p2', canon: 1800000, fecha_inicio: '2025-11-15', fecha_fin: '2027-02-10', dia_pago: 15, estado: 'Vigente' },
    { _seedId: 'c3', inmueble_id: 'i3', arrendatario_id: 'a3', propietario_id: 'p3', canon: 1100000, fecha_inicio: '2025-06-01', fecha_fin: '2026-06-01', dia_pago: 1, estado: 'Vencido' },
  ];

  const pagos = [
    { contrato_id: 'c1', periodo: '2026-10', fecha_pago: '2026-10-05', valor: 950000, estado: 'Pagado', dias_mora: 0 },
    { contrato_id: 'c1', periodo: '2026-11', fecha_pago: null, valor: 950000, estado: 'Pendiente', dias_mora: 2 },
    { contrato_id: 'c2', periodo: '2026-10', fecha_pago: '2026-10-18', valor: 1800000, estado: 'Pagado', dias_mora: 3 },
    { contrato_id: 'c2', periodo: '2026-11', fecha_pago: null, valor: 1800000, estado: 'En mora', dias_mora: 6 },
    { contrato_id: 'c3', periodo: '2026-05', fecha_pago: null, valor: 1100000, estado: 'En mora', dias_mora: 180 },
  ];

  const incrementos = [
    { contrato_id: 'c1', fecha: '2026-12-05', tipo: 'IPC', porcentaje: 5.2, canon_anterior: 950000, canon_nuevo: 999400, aplicado: 0 },
    { contrato_id: 'c2', fecha: '2026-11-15', tipo: 'IPC + adicional', porcentaje: 7.0, canon_anterior: 1800000, canon_nuevo: 1926000, aplicado: 0 },
  ];

  return { propietarios, arrendatarios, inmuebles, contratos, pagos, incrementos };
}

module.exports = { buildSeed };
