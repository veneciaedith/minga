// Generador del pitch deck de Minga (Stellar Pulso Hackathon).
// Ejecutar: node build.js  ->  produce "Minga-Pitch.pptx"
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3" x 7.5"
pres.author = "Minga";
pres.title = "Minga — Pitch Stellar Pulso";

// ---- Paleta (andina / económica + acento cálido) ----
const DARK = "15302E"; // verde pino profundo (fondos de portada/cierre)
const TERRA = "C75B39"; // terracota (acento cálido, energía LatAm)
const GREEN = "2E7D5B"; // verde (éxito / "ganancia")
const INK = "1B2A2A"; // texto sobre claro
const MUTED = "6B7A77"; // gris verdoso para captions
const LIGHT = "FFFFFF"; // fondo de contenido
const TINT = "F1EDE6"; // tinte suave para tarjetas
const ICE = "CFE3DC"; // texto secundario sobre oscuro

const SERIF = "Cambria";
const SANS = "Calibri";
const W = 13.3;
const MX = 0.7; // margen izquierdo

const shadow = () => ({ type: "outer", color: "000000", blur: 7, offset: 3, angle: 90, opacity: 0.12 });

// Círculo con número/letra adentro (motivo repetido en todo el deck)
function circle(slide, x, y, d, txt, fill, txtColor = "FFFFFF", fs = 18) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill } });
  slide.addText(txt, { x, y, w: d, h: d, align: "center", valign: "middle", fontFace: SANS, bold: true, color: txtColor, fontSize: fs, margin: 0 });
}

// Encabezado de slide de contenido (kicker + título)
function header(slide, kicker, title) {
  slide.background = { color: LIGHT };
  slide.addText(kicker.toUpperCase(), { x: MX, y: 0.45, w: W - 2 * MX, h: 0.35, fontFace: SANS, bold: true, color: TERRA, fontSize: 13, charSpacing: 3, margin: 0 });
  slide.addText(title, { x: MX, y: 0.78, w: W - 2 * MX, h: 0.85, fontFace: SERIF, bold: true, color: INK, fontSize: 32, margin: 0 });
}

// ============ SLIDE 1 — PORTADA ============
(() => {
  const s = pres.addSlide();
  s.background = { color: DARK };
  // motivo: círculos concéntricos "muchas manos"
  s.addShape(pres.shapes.OVAL, { x: 10.4, y: -1.6, w: 4.6, h: 4.6, fill: { color: "1C3D39" } });
  s.addShape(pres.shapes.OVAL, { x: 11.3, y: 4.6, w: 3.4, h: 3.4, fill: { color: "1C3D39" } });
  circle(s, 11.9, 1.0, 1.0, "M", TERRA, "FFFFFF", 40);

  s.addText("Minga", { x: MX, y: 1.7, w: 9, h: 1.3, fontFace: SERIF, bold: true, color: "FFFFFF", fontSize: 80, margin: 0 });
  s.addText("Economía viva, descentralizada y de todos.", { x: MX, y: 3.05, w: 10, h: 0.6, fontFace: SERIF, italic: true, color: TERRA, fontSize: 24, margin: 0 });
  s.addText("Pagos en escrow para las economías invisibles de América Latina — sobre Stellar.", { x: MX, y: 3.75, w: 9.6, h: 0.7, fontFace: SANS, color: ICE, fontSize: 16, margin: 0 });

  s.addText([
    { text: "Cintia Venecia · Ivon Fernández · Mariela Caminos", options: { breakLine: true, fontSize: 14, color: "FFFFFF", bold: true } },
    { text: "Salta, Argentina · 2026 · Stellar Pulso Hackathon", options: { fontSize: 12, color: ICE } },
  ], { x: MX, y: 6.2, w: 10, h: 0.9, fontFace: SANS, margin: 0, lineSpacingMultiple: 1.2 });

  s.addNotes("Presentar el nombre: la minga es la tradición andina del trabajo comunitario — muchas manos levantan lo que una sola no puede. Eso es Minga, ahora con tecnología. Hoy mostramos una pieza real funcionando sobre Stellar: pagos en escrow a proveedores.");
})();

// ============ SLIDE 2 — EL PROBLEMA (4 muros) ============
(() => {
  const s = pres.addSlide();
  header(s, "El problema", "El sistema económico no los ve");
  s.addText("Minga nace de una historia real: su fundador invirtió todos sus ahorros en una panadería que tuvo que cerrar. No por falta de esfuerzo — por falta de oportunidad. Es la vida de millones de pequeños comercios en América Latina, que enfrentan cuatro muros a la vez:", { x: MX, y: 1.65, w: W - 2 * MX, h: 0.9, fontFace: SANS, color: MUTED, fontSize: 14, margin: 0 });

  const muros = [
    ["1", "Invisibilidad", "No hay registro verificable de su actividad. Para un banco, el negocio no existe."],
    ["2", "Exclusión financiera", "Sin historial formal no hay crédito. Sin crédito no se crece ni se sobrevive a un mal mes."],
    ["3", "Ceguera de ganancia", "Venden, pero no saben si ganan. La inflación y los costos ocultos se comen el margen."],
    ["4", "Aislamiento", "Negocian solos contra proveedores. No tienen datos para saber si pagan de más."],
  ];
  const cw = (W - 2 * MX - 0.5) / 2;
  const ch = 1.75;
  muros.forEach((m, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = MX + col * (cw + 0.5);
    const y = 2.75 + row * (ch + 0.35);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: ch, fill: { color: TINT }, rectRadius: 0.08, shadow: shadow() });
    circle(s, x + 0.3, y + 0.3, 0.6, m[0], TERRA, "FFFFFF", 20);
    s.addText(m[1], { x: x + 1.05, y: y + 0.28, w: cw - 1.3, h: 0.45, fontFace: SERIF, bold: true, color: INK, fontSize: 18, margin: 0 });
    s.addText(m[2], { x: x + 1.05, y: y + 0.78, w: cw - 1.3, h: 0.85, fontFace: SANS, color: MUTED, fontSize: 13, margin: 0 });
  });
  s.addNotes("Los cuatro muros se refuerzan entre sí: sin registro no hay crédito, sin crédito no hay crecimiento, sin crecimiento el negocio cierra. Minga rompe el círculo por su punto más débil.");
})();

// ============ SLIDE 3 — LA SOLUCIÓN ============
(() => {
  const s = pres.addSlide();
  header(s, "La solución", "Un sistema operativo económico");
  s.addText("Minga toma la actividad real de cualquier microemprendedor y la convierte en tres activos que el sistema tradicional le niega:", { x: MX, y: 1.65, w: W - 2 * MX, h: 0.6, fontFace: SANS, color: MUTED, fontSize: 14, margin: 0 });

  const cols = [
    ["01", "Identidad y reputación propias", "Su historial no vive en un banco que puede negarle servicio: vive en una credencial portable que es suya."],
    ["02", "Crédito sin banco", "Su inventario y su constancia se vuelven garantía y puntaje para microcréditos en moneda estable."],
    ["03", "Poder colectivo", "Los datos de precios de la comunidad les dan poder de negociación — y el valor vuelve a ellos."],
  ];
  const cw = (W - 2 * MX - 2 * 0.5) / 3;
  cols.forEach((c, i) => {
    const x = MX + i * (cw + 0.5);
    const y = 2.45;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: 2.85, fill: { color: LIGHT }, line: { color: "E2DACE", width: 1 }, rectRadius: 0.08, shadow: shadow() });
    circle(s, x + 0.35, y + 0.35, 0.7, c[0], GREEN, "FFFFFF", 17);
    s.addText(c[1], { x: x + 0.35, y: y + 1.2, w: cw - 0.7, h: 0.7, fontFace: SERIF, bold: true, color: INK, fontSize: 17, margin: 0 });
    s.addText(c[2], { x: x + 0.35, y: y + 1.95, w: cw - 0.7, h: 0.8, fontFace: SANS, color: MUTED, fontSize: 12.5, margin: 0 });
  });
  s.addText([
    { text: "Principio que no se negocia:  ", options: { bold: true, color: INK } },
    { text: "la persona nunca toca la blockchain. Habla, saca fotos, recibe mensajes. La tecnología trabaja invisible por detrás.", options: { color: MUTED } },
  ], { x: MX, y: 5.7, w: W - 2 * MX, h: 0.7, fontFace: SANS, italic: true, fontSize: 14, margin: 0 });
  s.addNotes("Resolvé la vida hoy (saber si ganás plata), construí el futuro en silencio (la reputación que desbloquea el crédito se acumula sola). Y lo que generan los usuarios, vuelve a los usuarios.");
})();

// ============ SLIDE 4 — EL PROTOTIPO (Rosa) ============
(() => {
  const s = pres.addSlide();
  header(s, "Lo que construimos para el hackathon", "Pagos en escrow a proveedores");
  s.addText("Elegimos el flujo donde la blockchain no es un adorno sino imprescindible: garantizar un pago entre dos partes que no se conocen.", { x: MX, y: 1.65, w: 7.2, h: 1.0, fontFace: SANS, color: MUTED, fontSize: 14, margin: 0 });

  const pasos = [
    "Rosa, almacenera en Salta, le pide mercadería a un proveedor nuevo.",
    "En vez de pagar por adelantado (y arriesgarse) o después (y que no le confíen), Minga bloquea el pago en un contrato.",
    "El proveedor ve el pago garantizado y entrega la mercadería.",
    "Rosa confirma la entrega desde la app y el pago se libera solo.",
  ];
  pasos.forEach((p, i) => {
    const y = 2.8 + i * 0.95;
    circle(s, MX, y, 0.55, String(i + 1), TERRA, "FFFFFF", 18);
    s.addText(p, { x: MX + 0.8, y: y - 0.05, w: 6.4, h: 0.85, fontFace: SANS, color: INK, fontSize: 13.5, valign: "middle", margin: 0 });
  });

  // Tarjeta lateral con la frase clave
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.5, y: 2.2, w: 4.1, h: 4.4, fill: { color: DARK }, rectRadius: 0.1, shadow: shadow() });
  s.addText("“Pedido confirmado,\npago enviado.”", { x: 8.85, y: 2.7, w: 3.4, h: 1.6, fontFace: SERIF, italic: true, bold: true, color: "FFFFFF", fontSize: 26, margin: 0 });
  s.addText("Ni Rosa ni el proveedor necesitan entender qué es blockchain. Solo ven que el dinero llegó cuando tenía que llegar.", { x: 8.85, y: 4.5, w: 3.4, h: 1.8, fontFace: SANS, color: ICE, fontSize: 13.5, margin: 0 });
  s.addNotes("Este flujo es la funcionalidad 5.5 y la Fase 4 de nuestro roadmap: lo más avanzado de la visión, funcionando ya hoy.");
})();

// ============ SLIDE 5 — CÓMO FUNCIONA ============
(() => {
  const s = pres.addSlide();
  header(s, "Cómo funciona", "Un contrato de escrow en Soroban");

  const steps = [
    ["create_escrow", "Rosa bloquea el pago", "El XLM sale de su wallet y queda custodiado por el contrato."],
    ["entrega", "El proveedor entrega", "Ve on-chain que el pago está garantizado antes de mover mercadería."],
    ["confirm_delivery", "Rosa confirma", "Solo ella puede liberar el pago, desde la app."],
    ["liberado", "El contrato paga", "El XLM se transfiere automáticamente al proveedor."],
  ];
  const cw = 2.75, gap = 0.42, y = 2.4;
  const startX = MX;
  steps.forEach((st, i) => {
    const x = startX + i * (cw + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: 2.9, fill: { color: TINT }, rectRadius: 0.08, shadow: shadow() });
    circle(s, x + 0.3, y + 0.3, 0.55, String(i + 1), i === 3 ? GREEN : TERRA, "FFFFFF", 17);
    s.addText(st[1], { x: x + 0.25, y: y + 1.0, w: cw - 0.5, h: 0.6, fontFace: SERIF, bold: true, color: INK, fontSize: 15, margin: 0 });
    s.addText(st[2], { x: x + 0.25, y: y + 1.55, w: cw - 0.5, h: 1.0, fontFace: SANS, color: MUTED, fontSize: 11.5, margin: 0 });
    s.addText(st[0], { x: x + 0.25, y: y + 2.5, w: cw - 0.5, h: 0.3, fontFace: "Consolas", color: TERRA, fontSize: 10, margin: 0 });
    if (i < 3) s.addText("›", { x: x + cw + 0.02, y: y + 1.0, w: gap, h: 0.8, align: "center", valign: "middle", fontFace: SANS, bold: true, color: MUTED, fontSize: 28, margin: 0 });
  });
  s.addText([
    { text: "Stack:  ", options: { bold: true, color: INK } },
    { text: "Smart contract en Soroban (Rust) · Stellar Wallets Kit (firma multi-wallet) · React + TypeScript · red Testnet.", options: { color: MUTED } },
  ], { x: MX, y: 5.8, w: W - 2 * MX, h: 0.6, fontFace: SANS, fontSize: 13, margin: 0 });
  s.addNotes("La integración del Integration Track es Stellar Wallets Kit (categoría Wallet Integration). Es fundamental: sin la firma del usuario no hay escrow ni liberación de pago.");
})();

// ============ SLIDE 6 — EN VIVO EN TESTNET ============
(() => {
  const s = pres.addSlide();
  s.background = { color: DARK };
  s.addText("PRUEBA ON-CHAIN", { x: MX, y: 0.55, w: 10, h: 0.35, fontFace: SANS, bold: true, color: TERRA, fontSize: 13, charSpacing: 3, margin: 0 });
  s.addText("No es una promesa en una diapositiva. Está corriendo.", { x: MX, y: 0.95, w: W - 2 * MX, h: 0.8, fontFace: SERIF, bold: true, color: "FFFFFF", fontSize: 30, margin: 0 });

  const stats = [
    ["3", "transacciones reales", "deploy + crear escrow + liberar pago"],
    ["+10 XLM", "movidos on-chain", "del contrato a la wallet del proveedor"],
    ["pendiente → liberado", "estado verificable", "consultable por cualquiera en la red"],
  ];
  const cw = (W - 2 * MX - 2 * 0.5) / 3;
  stats.forEach((st, i) => {
    const x = MX + i * (cw + 0.5), y = 2.1;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: 2.3, fill: { color: "1C3D39" }, rectRadius: 0.1 });
    s.addText(st[0], { x: x + 0.3, y: y + 0.35, w: cw - 0.6, h: 0.9, fontFace: SERIF, bold: true, color: GREEN === "2E7D5B" ? "8FD9B6" : GREEN, fontSize: i === 2 ? 22 : 40, margin: 0, valign: "middle" });
    s.addText(st[1], { x: x + 0.3, y: y + 1.3, w: cw - 0.6, h: 0.4, fontFace: SANS, bold: true, color: "FFFFFF", fontSize: 15, margin: 0 });
    s.addText(st[2], { x: x + 0.3, y: y + 1.7, w: cw - 0.6, h: 0.5, fontFace: SANS, color: ICE, fontSize: 12, margin: 0 });
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: MX, y: 4.75, w: W - 2 * MX, h: 1.7, fill: { color: "0F2422" }, rectRadius: 0.08 });
  s.addText([
    { text: "Contrato (Stellar Testnet):  ", options: { color: ICE, fontSize: 13 } },
    { text: "CCYCSIXOT4XBMEGE2AQUMHZ2JKURZXRKB6MH7DFFQCDCZQGSL3MX2W5N", options: { color: "8FD9B6", fontFace: "Consolas", fontSize: 12.5, breakLine: true } },
    { text: "Verificable en stellar.expert · evidencia completa en DESPLIEGUE-TESTNET.md", options: { color: ICE, fontSize: 12 } },
  ], { x: MX + 0.35, y: 4.95, w: W - 2 * MX - 0.7, h: 1.3, fontFace: SANS, margin: 0, lineSpacingMultiple: 1.3 });
  s.addNotes("Mostrar en vivo: abrir stellar.expert y enseñar la transacción de confirm_delivery con el balance del proveedor subiendo. Este es el momento que separa a Minga de los proyectos que solo lo mencionan.");
})();

// ============ SLIDE 7 — DIFERENCIACIÓN ============
(() => {
  const s = pres.addSlide();
  header(s, "En qué nos diferenciamos", "No es una app de inventario con cripto");
  const rows = [
    ["Fintech tradicional", "Pide historial bancario que ellos no tienen. Los rechaza."],
    ["Apps de inventario", "Registran, pero los datos quedan en la empresa, no generan crédito ni poder."],
  ];
  rows.forEach((r, i) => {
    const y = 1.85 + i * 1.0;
    s.addText(r[0], { x: MX, y, w: 3.4, h: 0.9, fontFace: SERIF, bold: true, color: MUTED, fontSize: 15, valign: "middle", margin: 0 });
    s.addText(r[1], { x: MX + 3.6, y, w: 8.4, h: 0.9, fontFace: SANS, color: INK, fontSize: 13.5, valign: "middle", margin: 0 });
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: MX, y: 4.0, w: W - 2 * MX, h: 2.6, fill: { color: TINT }, rectRadius: 0.1, shadow: shadow() });
  circle(s, MX + 0.4, 4.35, 0.7, "M", TERRA, "FFFFFF", 22);
  s.addText("Minga", { x: MX + 1.3, y: 4.4, w: 4, h: 0.6, fontFace: SERIF, bold: true, color: INK, fontSize: 20, margin: 0 });
  s.addText([
    { text: "Reputación portable que el usuario posee", options: { bullet: true, breakLine: true } },
    { text: "Crédito respaldado por su propio inventario, sin banco", options: { bullet: true, breakLine: true } },
    { text: "Data-to-earn: el valor de los datos vuelve a la comunidad", options: { bullet: true, breakLine: true } },
    { text: "Pagos garantizados entre partes que no se conocen (ya funcionando)", options: { bullet: true } },
  ], { x: MX + 0.5, y: 5.05, w: W - 2 * MX - 1, h: 1.4, fontFace: SANS, color: INK, fontSize: 13.5, margin: 0, paraSpaceAfter: 4 });
  s.addNotes("La diferencia de fondo: el valor que generan los comerciantes vuelve a los comerciantes, no se concentra en una marca o un banco.");
})();

// ============ SLIDE 8 — ROADMAP ============
(() => {
  const s = pres.addSlide();
  header(s, "Hoja de ruta", "Adopción primero, modelo de negocio al final");
  const fases = [
    ["Fase 0", "Visión + prototipo", "Demo tocable para comerciantes de Salta."],
    ["Fase 1", "Núcleo gratuito", "Captura por voz/foto + inventario + semáforo de ganancia."],
    ["Fase 2", "Comunidad", "Precios de referencia y asistente por WhatsApp. Multi-rubro."],
    ["Fase 3", "Capa blockchain", "Reputación on-chain, wallet invisible, primeros microcréditos."],
    ["Fase 4", "Economía completa", "Pagos programables, escrow y data-to-earn a escala."],
  ];
  const cw = (W - 2 * MX - 4 * 0.3) / 5;
  fases.forEach((f, i) => {
    const x = MX + i * (cw + 0.3), y = 2.1;
    const done = i === 0 || i === 4;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: 3.0, fill: { color: done ? DARK : TINT }, rectRadius: 0.08, shadow: shadow() });
    s.addText(f[0], { x: x + 0.2, y: y + 0.25, w: cw - 0.4, h: 0.4, fontFace: SANS, bold: true, color: done ? TERRA : MUTED, fontSize: 13, margin: 0 });
    s.addText(f[1], { x: x + 0.2, y: y + 0.7, w: cw - 0.4, h: 0.8, fontFace: SERIF, bold: true, color: done ? "FFFFFF" : INK, fontSize: 14, margin: 0 });
    s.addText(f[2], { x: x + 0.2, y: y + 1.55, w: cw - 0.4, h: 1.2, fontFace: SANS, color: done ? ICE : MUTED, fontSize: 11, margin: 0 });
  });
  s.addText([
    { text: "Estamos en Fase 0  ", options: { bold: true, color: INK } },
    { text: "— y el escrow de la Fase 4 ya está demostrado on-chain. Probamos que la visión es construible.", options: { color: MUTED } },
  ], { x: MX, y: 5.45, w: W - 2 * MX, h: 0.6, fontFace: SANS, italic: true, fontSize: 14, margin: 0 });
  s.addNotes("Construimos en orden de prioridad: primero lo que hace que la gente adopte, después lo que la engancha, por último el modelo de negocio.");
})();

// ============ SLIDE 9 — VALIDACIÓN + CIERRE ============
(() => {
  const s = pres.addSlide();
  s.background = { color: DARK };
  s.addShape(pres.shapes.OVAL, { x: -1.6, y: 4.2, w: 4.6, h: 4.6, fill: { color: "1C3D39" } });
  s.addText("“Muchas manos levantan lo que una sola no puede.”", { x: MX, y: 1.4, w: 11.5, h: 1.6, fontFace: SERIF, italic: true, bold: true, color: "FFFFFF", fontSize: 34, margin: 0 });
  s.addText("Eso es una minga.", { x: MX, y: 3.0, w: 8, h: 0.6, fontFace: SERIF, color: TERRA, fontSize: 22, margin: 0 });

  s.addText("Validamos con comerciantes reales de Salta a través de entrevistas de descubrimiento, y construimos sobre Stellar para que la tecnología cambie las reglas a su favor — no como adorno, sino como motor.", { x: MX, y: 3.9, w: 11.5, h: 1.0, fontFace: SANS, color: ICE, fontSize: 15, margin: 0 });

  s.addText([
    { text: "Minga", options: { bold: true, color: "FFFFFF", fontSize: 18, breakLine: true } },
    { text: "Cintia Venecia · Ivon Fernández · Mariela Caminos", options: { color: ICE, fontSize: 13, breakLine: true } },
    { text: "Salta, Argentina · Stellar Pulso Hackathon 2026", options: { color: MUTED, fontSize: 12 } },
  ], { x: MX, y: 5.5, w: 11, h: 1.2, fontFace: SANS, margin: 0, lineSpacingMultiple: 1.25 });
  s.addNotes("Cerrar con fuerza y con el corazón: esto es por el sustento de muchas familias, incluidas las nuestras. Con buena tecnología podemos desarrollar algo increíble.");
})();

pres.writeFile({ fileName: "Minga-Pitch.pptx" }).then((f) => console.log("OK ->", f));
