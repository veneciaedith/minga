# Video de Minga (Remotion)

Video de **120 segundos**, **1920 × 1080**, 30 cuadros por segundo, con música:
«Deep House Groove», hecha con Suno (`public/musica/`). Se usan los primeros 2 minutos
y la música baja suave en los últimos 4 segundos.

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
| La música | `public/musica/` y el bloque `<Audio>` en `src/MingaVideo.tsx` |

## Las escenas

| Tiempo | Escena |
|---|---|
| 0:00–0:10 | Apertura: el logo se arma pieza por pieza y aparece el lema |
| 0:10–0:20 | El problema de Rosa: pagar antes o pagar después |
| 0:20–0:35 | Cargar: con la voz o con una foto del remito (entra fuerte la música) |
| 0:35–0:50 | Minga lee el remito |
| 0:50–1:00 | Tu reporte de hoy: 7 / 3 / 2 |
| 1:00–1:10 | El aceite: dónde se pierde plata y cómo arreglarlo (cambio en la música) |
| 1:10–1:25 | La Feria: precios de 34 comercios de la zona |
| 1:25–1:41 | El pedido protegido |
| 1:41–1:50 | «Que el pago no dependa de la confianza» (cambio en la música) |
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
