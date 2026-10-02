// Dibuja las imágenes del README (portada y encabezados de sección) en castellano e inglés.
// Uso:  node marca/readme/hacer-imagenes.js
// Necesita Chrome o Chromium. Si no lo encuentra solo, indicá dónde está:
//   CHROME=/ruta/a/chrome node marca/readme/hacer-imagenes.js
const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');

const aca = __dirname;
const chrome =
  process.env.CHROME ||
  ['/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', '/usr/bin/chromium', '/usr/bin/google-chrome']
    .find((r) => fs.existsSync(r));
if (!chrome) throw new Error('No encontré Chrome. Usá CHROME=/ruta/a/chrome');

const textos = {
  es: {
    datos: ['Comercio', 'Proveedor', 'Pago protegido'],
    caja: 'Que el pago no dependa de la confianza',
    lema: ['Muchas manos', ' levantan lo que una sola no puede.'],
    tags: ['Testnet en vivo', '29 pruebas en verde', 'Diseño universal'],
    secciones: ['La historia', 'El problema', 'Cómo funciona', 'Seguridad', 'El estado', 'Novedades',
      'Accesibilidad', 'Lo técnico', 'Probarlo', 'Hoja de ruta', 'Equipo', 'Enlaces'],
  },
  en: {
    datos: ['Shop', 'Supplier', 'Protected payment'],
    caja: "Payments that don't depend on trust",
    lema: ['Many hands', ' lift what one alone cannot.'],
    tags: ['Live on testnet', '29 tests passing', 'Universal design'],
    secciones: ['The story', 'The problem', 'How it works', 'Security', 'Status', "What's new",
      'Accessibility', 'Under the hood', 'Try it', 'Roadmap', 'Team', 'Links'],
  },
};

const logo = `<svg width="150" height="150" viewBox="0 0 34 34"><rect width="34" height="34" rx="9" fill="#0B4E46"/><path d="M13 7h8v3h3v3h3v8h-3v3h-3v3h-8v-3h-3v-3H7v-8h3v-3h3z" fill="#D9A227"/><rect x="15" y="15" width="4" height="4" rx="1" fill="#C0512F"/></svg>`;

const portada = (t) => `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="base.css">
<style>
body{width:1280px;height:600px}
.marco{position:absolute;inset:0;border:8px solid var(--tinta);overflow:hidden}
.fila1{display:flex;border-bottom:6px solid var(--tinta);height:250px}
.marca{flex:1;display:flex;align-items:center;gap:34px;padding:0 48px;border-right:6px solid var(--tinta)}
.nombre{font-family:A;font-weight:800;font-size:170px;line-height:.8;letter-spacing:-.02em;text-transform:uppercase;color:var(--verde);margin-top:18px}
.datos{width:390px;white-space:nowrap;display:flex;flex-direction:column}
.datos div{flex:1;display:flex;align-items:center;padding:0 28px;font-size:21px;border-bottom:3px solid var(--tinta)}
.datos div:last-child{border-bottom:none}
.datos b{color:var(--terra);margin-right:16px;font-weight:600}
.caja{position:absolute;left:48px;top:292px;font-size:30px;padding:18px 26px}
.lema{position:absolute;left:48px;top:392px;font-family:M;font-weight:500;font-size:27px;letter-spacing:.02em}
.lema mark{background:var(--ocre);color:var(--tinta);padding:2px 6px}
.tags{position:absolute;left:48px;bottom:44px;display:flex;gap:22px}
.tag{font-size:21px;padding:10px 18px}
.franjas{position:absolute;right:70px;bottom:-30px;height:330px;display:flex;gap:16px;transform:skewX(-24deg);align-items:flex-end}
</style>
<div class="marco">
  <div class="fila1">
    <div class="marca">${logo}<div class="nombre">Minga</div></div>
    <div class="datos mono">${t.datos.map((d, i) => `<div><b>0${i + 1}</b>${d}</div>`).join('')}</div>
  </div>
  <div class="caja">${t.caja}</div>
  <div class="lema"><mark>${t.lema[0]}</mark>${t.lema[1]}</div>
  <div class="tags">${t.tags.map((x) => `<span class="tag">${x}</span>`).join('')}</div>
  <div class="franjas"><i style="display:block;width:70px;height:330px;background:var(--verde)"></i><i style="display:block;width:38px;height:277px;background:var(--ocre)"></i><i style="display:block;width:18px;height:224px;background:var(--terra)"></i></div>
</div>`;

const seccion = (n, nombre) => `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="base.css">
<style>
body{width:1280px;height:170px}
.linea{position:absolute;left:0;right:0;top:0;height:8px;background:var(--tinta)}
.caja{position:absolute;left:0;top:50px;font-size:26px;padding:16px 24px}
.num{position:absolute;right:0;top:4px;font-family:A;font-weight:800;font-size:160px;line-height:1;color:var(--terra);letter-spacing:-.03em}
</style>
<div class="linea"></div>
<div class="caja">${n} // ${nombre}</div>
<div class="num">${n}</div>`;

const dibujar = (html, archivo, alto) => {
  const temporal = path.join(aca, '_temporal.html');
  fs.writeFileSync(temporal, html);
  execFileSync(chrome, [
    '--headless', '--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=2',
    '--allow-file-access-from-files', `--window-size=1280,${alto}`,
    `--screenshot=${path.join(aca, archivo)}`, `file://${temporal}`,
  ], {stdio: 'ignore'});
  fs.unlinkSync(temporal);
  console.log('listo', archivo);
};

for (const [idioma, t] of Object.entries(textos)) {
  dibujar(portada(t), `portada-${idioma}.png`, 600);
  t.secciones.forEach((nombre, i) => {
    const n = String(i + 1).padStart(2, '0');
    dibujar(seccion(n, nombre), `seccion-${n}-${idioma}.png`, 170);
  });
}
