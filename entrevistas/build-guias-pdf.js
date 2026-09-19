// Genera las guías de entrevista en PDF, una por rubro.
// Correr desde esta carpeta:  node build-guias-pdf.js
//
// Cada PDF sirve para las dos cosas: como guion para quien entrevista,
// y como cuestionario para quien prefiere contestar por escrito.

const PDFDocument = require("../presentacion/node_modules/pdfkit");
const fs = require("fs");
const path = require("path");

const TERRA = "#97381B";
const TEAL = "#0B4E46";
const INK = "#14211E";
const MUTED = "#46534F";
const LINEA = "#D8CCBB";

const guias = JSON.parse(fs.readFileSync(path.join(__dirname, "guias.json"), "utf8"));

for (const clave of Object.keys(guias)) {
  const g = guias[clave];
  const salida = path.join(__dirname, g.archivo + ".pdf");
  const doc = new PDFDocument({ size: "A4", margins: { top: 50, bottom: 55, left: 50, right: 50 } });
  doc.pipe(fs.createWriteStream(salida));
  const ANCHO = doc.page.width - 100;
  const FONDO = doc.page.height - 60;

  // ---------- Portada ----------
  doc.font("Helvetica-Bold").fontSize(9).fillColor(TERRA)
     .text("MINGA · ENTREVISTA DE DESCUBRIMIENTO", { characterSpacing: 1.2 });
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(23).fillColor(INK).text(g.titulo);
  doc.font("Helvetica").fontSize(11).fillColor(MUTED).text(g.subtitulo);
  doc.moveDown(1);

  // Datos de la charla
  const y0 = doc.y;
  doc.font("Helvetica").fontSize(9.5).fillColor(MUTED);
  doc.text("Nombre o apodo: ______________________________", 50, y0);
  doc.text("Rubro: ____________________________", 50, y0 + 16);
  doc.text("Localidad: ______________________", 320, y0 + 16);
  doc.text("Fecha: ______________", 50, y0 + 32);
  doc.text("Entrevista: ______________________", 320, y0 + 32);
  doc.y = y0 + 52;

  // ---------- Cómo usar esta guía ----------
  doc.rect(50, doc.y, ANCHO, 92).fill("#F2EADF");
  const yc = doc.y + 12;
  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(TEAL).text("Cómo usar esta guía", 62, yc);
  doc.font("Helvetica").fontSize(9.5).fillColor(INK);
  doc.text("Es una charla, no un interrogatorio. Dura 15 o 20 minutos.", 62, yc + 16, { width: ANCHO - 24 });
  doc.text("No hables de Minga ni preguntes si usaría una app: eso arruina la respuesta, porque la gente dice que sí por amabilidad.", 62, yc + 29, { width: ANCHO - 24 });
  doc.text("Preguntá por hechos que ya pasaron. Cuando algo suene interesante, repreguntá: «¿por qué?», «¿cuánto?», «contame la última vez».", 62, yc + 50, { width: ANCHO - 24 });
  doc.y = yc + 88;

  // ---------- Permiso ----------
  doc.moveDown(0.6);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(TEAL).text("Decí esto al empezar");
  doc.font("Helvetica-Oblique").fontSize(9.5).fillColor(INK).text(
    "«Gracias por tu tiempo. Estoy investigando cómo manejan las compras y la plata los negocios como el tuyo. " +
    "¿Te molesta si tomo notas o grabo? Podés frenar cuando quieras.»",
    { width: ANCHO }
  );
  doc.moveDown(1);

  // ---------- Preguntas ----------
  doc.font("Helvetica-Bold").fontSize(12).fillColor(TEAL).text("Preguntas");
  doc.moveDown(0.5);

  g.preguntas.forEach(([texto, renglones], i) => {
    const alto = doc.heightOfString(texto, { width: ANCHO - 22 }) + renglones * 17 + 14;
    if (doc.y + alto > FONDO) doc.addPage();

    const y = doc.y;
    doc.font("Helvetica-Bold").fontSize(10).fillColor(TERRA).text(String(i + 1) + ".", 50, y, { width: 18 });
    doc.font("Helvetica").fontSize(10.5).fillColor(INK).text(texto, 70, y, { width: ANCHO - 22 });

    let yl = doc.y + 8;
    for (let n = 0; n < renglones; n++) {
      doc.moveTo(70, yl).lineTo(50 + ANCHO, yl).lineWidth(0.6).strokeColor(LINEA).stroke();
      yl += 17;
    }
    doc.y = yl + 6;
  });

  // ---------- Qué escuchar ----------
  const altoCierre = 40 + g.escuchar.length * 15 + 80;
  if (doc.y + altoCierre > FONDO) doc.addPage(); else doc.moveDown(1);

  doc.font("Helvetica-Bold").fontSize(12).fillColor(TEAL).text("Qué conviene escuchar");
  doc.font("Helvetica").fontSize(9.5).fillColor(MUTED)
     .text("Si aparece alguna de estas cosas, anotá la frase textual: una cita real vale más que cien explicaciones.", { width: ANCHO });
  doc.moveDown(0.4);
  doc.fontSize(10).fillColor(INK);
  g.escuchar.forEach((s) => doc.text("•  " + s, { width: ANCHO, indent: 6 }));

  doc.moveDown(1);
  doc.font("Helvetica-Bold").fontSize(11).fillColor(TEAL).text("Lo más importante que dijo");
  let yf = doc.y + 8;
  for (let n = 0; n < 3; n++) {
    doc.moveTo(50, yf).lineTo(50 + ANCHO, yf).lineWidth(0.6).strokeColor(LINEA).stroke();
    yf += 17;
  }

  doc.font("Helvetica").fontSize(8.5).fillColor(MUTED)
     .text("Minga · Salta, Argentina · Método «The Mom Test»: hechos del pasado, no opiniones sobre el futuro.",
           50, doc.page.height - 45, { width: ANCHO, align: "center" });

  doc.end();
  console.log("generado: " + g.archivo + ".pdf");
}
