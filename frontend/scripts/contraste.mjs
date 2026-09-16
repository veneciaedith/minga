// Calcula el contraste WCAG 2.1 de cada par de colores que usa Minga.
const lum = (hex) => {
  const c = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(c.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const claro = {
  papel: "#FBF7F1", papel2: "#F2EADF", tarjeta: "#FFFFFF",
  borde: "#D9CBB8", bordeFuerte: "#8A7157",
  tinta: "#14211E", tintaSuave: "#46534F",
  teal: "#0B4E46", terracota: "#97381B", ocre: "#7A5206",
  accionFondo: "#0B4E46", accionTexto: "#FFFFFF", foco: "#97381B",
  bien: "#13593A", bienFondo: "#E4F2EA",
  atencion: "#6F4805", atencionFondo: "#FAEED3",
  mal: "#8C2318", malFondo: "#FBE4E0",
};

const oscuro = {
  papel: "#0E1F1C", papel2: "#15302B", tarjeta: "#16312C",
  borde: "#2B4A43", bordeFuerte: "#5E857B",
  tinta: "#EFF5F2", tintaSuave: "#A9BDB7",
  teal: "#7BDCC7", terracota: "#F0977A", ocre: "#E8B84C",
  accionFondo: "#7BDCC7", accionTexto: "#06231F", foco: "#F5B08D",
  bien: "#85DFAE", bienFondo: "#103528",
  atencion: "#F3CB74", atencionFondo: "#382B10",
  mal: "#F8A296", malFondo: "#3E1C18",
};

// [frente, fondo, mínimo exigido, para qué se usa]
const pares = (t) => [
  ["tinta", "papel", 4.5, "texto general sobre el fondo"],
  ["tinta", "tarjeta", 4.5, "texto general sobre tarjeta"],
  ["tinta", "papel2", 4.5, "texto sobre el fondo alterno"],
  ["tintaSuave", "papel", 4.5, "texto secundario (bajadas, ayudas)"],
  ["tintaSuave", "tarjeta", 4.5, "texto secundario sobre tarjeta"],
  ["tintaSuave", "papel2", 4.5, "texto secundario sobre fondo alterno"],
  ["teal", "papel", 4.5, "titulos y enlaces de ayuda"],
  ["teal", "tarjeta", 4.5, "pestana activa"],
  ["terracota", "tarjeta", 4.5, "enlaces y numero de pedido"],
  ["terracota", "papel2", 4.5, "numero de pedido sobre fondo alterno"],
  ["ocre", "tarjeta", 4.5, "detalles de marca"],
  ["accionTexto", "accionFondo", 4.5, "texto del boton principal"],
  ["bien", "bienFondo", 4.5, "aviso de exito"],
  ["atencion", "atencionFondo", 4.5, "aviso de atencion"],
  ["mal", "malFondo", 4.5, "aviso de error"],
  ["mal", "tarjeta", 4.5, "texto de error en un campo"],
  ["bordeFuerte", "tarjeta", 3, "borde de campos y botones (componente)"],
  ["bordeFuerte", "papel", 3, "borde sobre el fondo"],
  ["foco", "papel", 3, "anillo de foco del teclado"],
  ["foco", "tarjeta", 3, "anillo de foco sobre tarjeta"],
  ["teal", "papel2", 3, "borde de la pestana activa"],
];

let fallos = 0;
for (const [nombre, t] of [["CLARO", claro], ["OSCURO", oscuro]]) {
  console.log(`\n=== TEMA ${nombre} ===`);
  for (const [f, b, min, uso] of pares(t)) {
    const r = ratio(t[f], t[b]);
    const ok = r >= min;
    if (!ok) fallos++;
    console.log(`${ok ? "OK  " : "FALLA"} ${r.toFixed(2).padStart(5)}:1 (min ${min})  ${f} sobre ${b} — ${uso}`);
  }
}
console.log(`\n${fallos === 0 ? "Todos los pares cumplen WCAG 2.1 AA." : fallos + " par(es) por debajo del mínimo."}`);
process.exit(fallos === 0 ? 0 : 1);
