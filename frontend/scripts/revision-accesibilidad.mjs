import { chromium } from "playwright";

const URL = "http://localhost:4173/";
const SALIDA = process.env.SALIDA || ".";
const problemas = [];
const ok = (m) => console.log("OK    " + m);
const mal = (m) => { problemas.push(m); console.log("FALLA " + m); };

const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const ctx = await navegador.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();

const errores = [];
p.on("console", (m) => m.type() === "error" && errores.push(m.text()));
p.on("pageerror", (e) => errores.push(String(e)));

await p.goto(URL, { waitUntil: "networkidle" });

// --- se renderiza ---
await p.waitForSelector("h1");
(await p.textContent("h1")) === "Minga" ? ok("la app renderiza") : mal("no renderiza el titulo");

// --- primer tabulador = saltar al contenido ---
await p.keyboard.press("Tab");
const primerFoco = await p.evaluate(() => document.activeElement?.textContent?.trim());
primerFoco === "Saltar al contenido" ? ok("el primer tabulador es el salto al contenido") : mal("primer foco inesperado: " + primerFoco);

// --- el foco se ve ---
const anillo = await p.evaluate(() => {
  const b = document.querySelector(".boton-principal");
  b.focus();
  const e = getComputedStyle(b);
  return { ancho: e.outlineWidth, estilo: e.outlineStyle };
});
parseFloat(anillo.ancho) >= 2 && anillo.estilo !== "none"
  ? ok(`el foco se ve (contorno de ${anillo.ancho})`)
  : mal("el foco no deja contorno visible: " + JSON.stringify(anillo));

// --- validacion antes de tocar la red ---
await p.click('form button[type="submit"]');
await p.waitForSelector("#error-monto");
ok("no deja seguir sin monto: «" + (await p.textContent("#error-monto")).trim() + "»");
const focoError = await p.evaluate(() => document.activeElement?.id);
focoError === "campo-monto" ? ok("el foco va al campo con el problema") : mal("el foco quedo en: " + focoError);

// --- monto con letras ---
await p.fill("#campo-monto", "diez");
await p.click('form button[type="submit"]');
await p.waitForSelector("#error-monto");
ok("rechaza letras en el monto: «" + (await p.textContent("#error-monto")).trim() + "»");

// --- sin billetera avisa en castellano ---
await p.fill("#campo-monto", "10,50");
await p.click('form button[type="submit"]');
await p.waitForSelector('[role="alert"] p, [role="status"] p');
const avisoSinBilletera = (await p.textContent('.estado-sistema p')).trim();
avisoSinBilletera.includes("billetera") ? ok("avisa que falta la billetera: «" + avisoSinBilletera + "»") : mal("aviso inesperado: " + avisoSinBilletera);

// --- direccion mal copiada ---
await p.fill("#campo-proveedor", "GBJJK3S4FU7VCKDT");
await p.click('form button[type="submit"]');
await p.waitForSelector("#error-proveedor");
ok("detecta la billetera cortada: «" + (await p.textContent("#error-proveedor")).trim() + "»");

// --- tamano de texto ---
const base = await p.evaluate(() => getComputedStyle(document.body).fontSize);
await p.click('.ajustes .grande');
await p.click('.ajustes .grande');
const grande = await p.evaluate(() => getComputedStyle(document.body).fontSize);
parseFloat(grande) > parseFloat(base) ? ok(`el texto se agranda (${base} → ${grande})`) : mal("el texto no cambia de tamano");

// --- se recuerda tras recargar ---
await p.reload({ waitUntil: "networkidle" });
const trasRecarga = await p.evaluate(() => getComputedStyle(document.body).fontSize);
trasRecarga === grande ? ok("recuerda el tamano de texto al volver") : mal(`no recuerda el tamano (${trasRecarga} vs ${grande})`);

// --- pestanas con teclado ---
await p.evaluate(() => document.querySelector('#pestana-comerciante').focus());
await p.keyboard.press("ArrowRight");
const sel = await p.getAttribute("#pestana-proveedor", "aria-selected");
sel === "true" ? ok("las pestanas se mueven con las flechas") : mal("la flecha no cambia de pestana");
await p.waitForSelector("#titulo-proveedor");
ok("la pantalla del proveedor carga: «" + (await p.textContent("#titulo-proveedor")).trim() + "»");

// --- validacion del proveedor ---
await p.click('form button[type="submit"]');
await p.waitForSelector("#error-numero");
ok("pide el numero de pedido: «" + (await p.textContent("#error-numero")).trim() + "»");

// --- objetivos tactiles ---
const chicos = await p.evaluate(() =>
  [...document.querySelectorAll("button, a.saltar, summary")]
    .filter((e) => e.offsetParent !== null)
    .map((e) => ({ t: e.textContent.trim().slice(0, 30), h: Math.round(e.getBoundingClientRect().height) }))
    .filter((e) => e.h < 44)
);
chicos.length === 0 ? ok("ningun boton mide menos de 44 px de alto") : mal("botones chicos: " + JSON.stringify(chicos));

// --- sin scroll horizontal a 320 px ---
await p.setViewportSize({ width: 320, height: 800 });
const desborda = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
desborda ? mal("la pagina se desborda a lo ancho en 320 px") : ok("entra en una pantalla de 320 px");

// --- capturas ---
await p.setViewportSize({ width: 390, height: 900 });
await p.evaluate(() => document.querySelector("#pestana-comerciante").click());
await p.waitForTimeout(300);
await p.screenshot({ path: `${SALIDA}/minga-claro.png`, fullPage: true });
await p.evaluate(() => document.documentElement.setAttribute("data-tema", "oscuro"));
await p.waitForTimeout(300);
await p.screenshot({ path: `${SALIDA}/minga-oscuro.png`, fullPage: true });
ok("capturas guardadas");

errores.length === 0 ? ok("sin errores en la consola") : mal("errores en consola: " + errores.join(" | "));

await navegador.close();
console.log(`\n${problemas.length === 0 ? "Todo en orden." : problemas.length + " problema(s)."}`);
process.exit(problemas.length ? 1 : 0);
