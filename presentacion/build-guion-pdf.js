// Genera el PDF del guion del video demo de Minga.
// Ejecutar: node build-guion-pdf.js  ->  ../Guion-Video-Minga.pdf
const PDFDocument = require("pdfkit");
const fs = require("fs");

const TERRA = "#C75B39";
const DARK = "#15302E";
const INK = "#1B2A2A";
const MUTED = "#6B7A77";
const OUT = "D:\\Program Files (x86)\\claude\\minga\\Guion-Video-Minga.pdf";

const doc = new PDFDocument({ size: "A4", margins: { top: 55, bottom: 55, left: 55, right: 55 } });
doc.pipe(fs.createWriteStream(OUT));
const CW = doc.page.width - 110;

// ---- Encabezado ----
doc.font("Helvetica-Bold").fontSize(24).fillColor(DARK).text("Guion del video demo");
doc.font("Helvetica-Bold").fontSize(13).fillColor(TERRA).text("Minga  ·  Stellar Pulso Hackathon");
doc.moveDown(0.4);
doc.font("Helvetica").fontSize(10.5).fillColor(MUTED).text(
  "Recorrido del prototipo funcionando (aprox. 1:45). No hace falta aparecer en camara: " +
  "graba la pantalla + tu voz.",
  { width: CW }
);
doc.moveDown(0.3);
doc.font("Helvetica").fontSize(10.5).fillColor(INK).text(
  "Antes de grabar: tene abierta la app en localhost, una pestana en stellar.expert (el contrato) " +
  "y Freighter en Testnet. Genera un numero de pedido NUEVO (no reuses el #42).",
  { width: CW }
);

// Linea separadora suave
doc.moveDown(0.6);
doc.strokeColor("#D9D2C7").lineWidth(1).moveTo(55, doc.y).lineTo(55 + CW, doc.y).stroke();
doc.moveDown(0.6);

// ---- Bloques del guion ----
const bloques = [
  ["0:00 - 0:12", "Pantalla 'Comerciante (Rosa)', quieta.",
    "Rosa tiene un almacen en Salta. Cuando le compra a un proveedor nuevo, choca con un problema: si paga por adelantado se arriesga a que no le llegue; si paga despues, no le confian. Esto le pasa a millones de comerciantes en America Latina."],
  ["0:12 - 0:25", "Click en 'Conectar wallet' -> elegis Freighter en el modal -> conectada.",
    "Minga lo resuelve con un pago en garantia sobre Stellar. Rosa conecta su billetera, pero no necesita saber que es blockchain."],
  ["0:25 - 0:45", "Completas proveedor, monto (ej. 10) y descripcion. Mostras el N de pedido. Click en 'Crear pedido y bloquear pago' -> firmas en Freighter.",
    "Arma el pedido y, en vez de pagarle directo al proveedor, el dinero queda bloqueado en un contrato. Ni Rosa ni el proveedor lo tienen: lo custodia el contrato."],
  ["0:45 - 0:58", "Mensaje de exito + link a la transaccion. Vas a la pestana Proveedor, pegas el N de pedido -> 'Consultar estado' -> muestra: Pendiente.",
    "El proveedor entra, consulta el pedido directamente en la blockchain, y ve que el pago esta garantizado. Recien ahi entrega la mercaderia, tranquilo."],
  ["0:58 - 1:15", "Volves a Comerciante -> click en 'Confirmar entrega (liberar pago)' -> firmas en Freighter.",
    "Rosa recibe el pedido y confirma la entrega con un boton. En ese momento, el contrato libera el pago automaticamente al proveedor."],
  ["1:15 - 1:32", "Pestana Proveedor -> consultas de nuevo -> muestra: Pago liberado.",
    "Y listo: pago liberado. Para ellos fue 'pedido confirmado, pago enviado'. Por debajo, Stellar garantizo que nadie pudiera quedarse con el dinero indebidamente."],
  ["1:32 - 1:45", "Pasas a stellar.expert: mostras la transaccion de confirm_delivery y el balance del proveedor con +10 XLM.",
    "Y esto no es una maqueta: es una transaccion real en Stellar testnet. El dinero se movio de verdad. Minga convierte la economia invisible en algo que el sistema por fin puede ver."],
];

function bloque(t, pantalla, narracion) {
  // Salto de pagina si no entra el bloque completo (estimacion)
  if (doc.y > doc.page.height - 150) doc.addPage();
  doc.font("Helvetica-Bold").fontSize(12).fillColor(TERRA).text(t);
  doc.moveDown(0.15);
  doc.font("Helvetica-Bold").fontSize(9.5).fillColor(MUTED).text("EN PANTALLA:  ", { continued: true });
  doc.font("Helvetica").fontSize(9.5).fillColor(MUTED).text(pantalla, { width: CW });
  doc.moveDown(0.2);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(INK).text("Decis:  ", { continued: true });
  doc.font("Times-Italic").fontSize(12).fillColor(INK).text('"' + narracion + '"', { width: CW });
  doc.moveDown(0.7);
}
bloques.forEach((b) => bloque(b[0], b[1], b[2]));

// ---- Cierre opcional ----
if (doc.y > doc.page.height - 200) doc.addPage();
doc.strokeColor("#D9D2C7").lineWidth(1).moveTo(55, doc.y).lineTo(55 + CW, doc.y).stroke();
doc.moveDown(0.5);
doc.font("Helvetica-Bold").fontSize(13).fillColor(DARK).text("Cierre opcional (+10 s)");
doc.moveDown(0.2);
doc.font("Times-Italic").fontSize(12).fillColor(INK).text(
  '"La minga es el trabajo comunitario andino: muchas manos levantan lo que una sola no puede. Eso queremos ser, ahora con tecnologia. Gracias."',
  { width: CW }
);

// ---- Checklist ----
doc.moveDown(0.8);
doc.font("Helvetica-Bold").fontSize(13).fillColor(DARK).text("Checklist antes de grabar");
doc.moveDown(0.3);
const checks = [
  "Freighter en Testnet y con saldo (Friendbot).",
  "Numero de pedido nuevo (no el #42).",
  "Wallet del proveedor a mano para pegar.",
  "Pestana de stellar.expert ya abierta en el contrato.",
  "Audio probado. Graba en pantalla completa (Win + Alt + R).",
];
doc.font("Helvetica").fontSize(11).fillColor(INK);
checks.forEach((c) => {
  doc.text("[  ]  " + c, { width: CW });
  doc.moveDown(0.15);
});

doc.end();
console.log("PDF generado en", OUT);
