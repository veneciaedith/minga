# Video de Minga (Remotion)

Video de **120 segundos**, **1920 × 1080**, 30 cuadros por segundo. Sin audio, para
que después se le pueda sumar música o voz.

## Cómo verlo y cómo armarlo

```bash
cd video/remotion
npm install
npm run studio   # abre un editor en el navegador para ver el video y moverse por el tiempo
npm run render   # arma el archivo out/minga-video.mp4
```

El `.mp4` no se sube a GitHub (pesa unos 16 MB).

## Qué cambiar y dónde

| Quiero cambiar… | Archivo |
|---|---|
| Un texto o un número | `src/textos.ts` (están todos ahí) |
| Un color o la tipografía | `src/tema.ts` |
| Cuánto dura cada escena | `src/MingaVideo.tsx` (tienen que sumar 120 s) |
| Una escena | `src/escenas/E01Apertura.tsx` … `E10Cierre.tsx` |
| Las capturas de la app | `public/capturas/` |

## Las escenas

| Tiempo | Escena |
|---|---|
| 0:00–0:10 | Apertura: el logo se arma pieza por pieza y aparece el lema |
| 0:10–0:22 | El problema de Rosa: pagar antes o pagar después |
| 0:22–0:35 | Cargar: con la voz o con una foto del remito |
| 0:35–0:50 | Minga lee el remito |
| 0:50–0:59 | Tu reporte de hoy: 7 / 3 / 2 |
| 0:59–1:10 | El aceite: dónde se pierde plata y cómo arreglarlo |
| 1:10–1:25 | La Feria: precios de 34 comercios de la zona |
| 1:25–1:40 | El pedido protegido |
| 1:40–1:50 | «Que el pago no dependa de la confianza» |
| 1:50–2:00 | Cierre con logo, lema y link |

## Accesibilidad

- Fondos claros y texto con contraste alto.
- Nada titila: ningún destello, nunca más de 3 cambios bruscos por segundo.
- Los estados no se dicen solo con color: llevan ✓, ! o ▼, y la barra del reporte
  usa rayas y puntitos, igual que la app.
- Cada frase queda quieta el tiempo suficiente para leerla.

## De dónde sale cada cosa

- Las capturas son del prototipo (`mockups/minga-app.html`), recortadas sin la barra
  del navegador. No hay personas inventadas ni imágenes generadas.
- Todos los datos son los de ejemplo del prototipo. El único número calculado es
  la diferencia de la yerba ($3.980 − $3.540 = $440).
- El video lo aclara al final: «Prototipo · Los datos son de ejemplo».
