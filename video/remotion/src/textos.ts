// Todos los textos del video en un solo lugar.
// Los datos son los del prototipo (datos de ejemplo), no se inventó ninguno.

export const textos = {
  apertura: {
    marca: 'Minga',
    lema: 'Muchas manos levantan lo que una sola no puede.',
  },
  problema: {
    quien: 'Rosa tiene un almacén de barrio en Salta.',
    antes: {titulo: 'Si paga antes', resultado: 'arriesga'},
    despues: {titulo: 'Si paga después', resultado: 'no le venden'},
    remate: 'Alguno tiene que arriesgar primero.',
  },
  cargar: {
    titulo: 'Cargá sin escribir.',
    voz: 'Con la voz',
    foto: 'O con una foto del remito',
    bajada: 'No hace falta el teclado.',
  },
  remito: {
    titulo: 'Minga lee el remito',
    proveedor: 'Distribuidora El Portezuelo',
    filas: [
      {producto: 'Yerba Rosamonte 1 kg', cantidad: 12, total: 47760},
      {producto: 'Harina 000 Morixe 1 kg', cantidad: 20, total: 24800},
      {producto: 'Aceite Natura 900 ml', cantidad: 6, total: 17100},
    ],
    cierre: 'Vos solo confirmás.',
  },
  reporte: {
    titulo: 'Tu reporte de hoy',
    bajada: 'En qué ganás y en qué perdés, producto por producto.',
    total: 12,
    partes: [
      {cantidad: 7, etiqueta: 'Van bien', tipo: 'bien'},
      {cantidad: 3, etiqueta: 'Para mirar', tipo: 'atencion'},
      {cantidad: 2, etiqueta: 'Te dan pérdida', tipo: 'perdida'},
    ],
  },
  aceite: {
    producto: 'Aceite Natura 900 ml',
    compra: 2850,
    venta: 2700,
    perdidaUnidad: 150,
    vendidas: 9,
    perdidaTotal: 1350,
    precioSugerido: 3560,
    gananciaUnidad: 710,
  },
  feria: {
    titulo: 'La Feria',
    bajada: 'Lo que pagan otros comercios de tu zona por lo mismo que comprás vos.',
    comercios: 34,
    zonas: ['Salta capital', 'Cerrillos', 'Vaqueros'],
    privacidad: 'Nadie ve tu nombre. Solo se comparten precios.',
    producto: 'Yerba Rosamonte 1 kg',
    vosPagas: 3980,
    enTuZona: 3540,
    maximo: 4120,
  },
  pedido: {
    titulo: 'Tu pedido está protegido',
    detalle: '20 harinas · Distribuidora El Portezuelo',
    monto: 24800,
    pasos: [
      'Hiciste el pedido',
      'Tu plata quedó guardada',
      'Confirmás que llegó y el proveedor cobra',
    ],
    impacto: ['No la tiene el proveedor', 'ni la tiene Minga.'],
    cancelar: 'Si no llega, la plata vuelve entera.',
  },
  mensaje: {
    lineas: ['Que el pago', 'no dependa', 'de la confianza.'],
  },
  cierre: {
    lema: 'Muchas manos levantan lo que una sola no puede.',
    link: 'minga-r5ql.vercel.app',
    aviso: 'Prototipo · Los datos son de ejemplo',
  },
} as const;

// $24.800: separador de miles con punto, como se usa en Argentina
export const plata = (n: number) =>
  '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
