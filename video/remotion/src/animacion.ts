import {Easing, interpolate} from 'remotion';

// Curvas de movimiento: entradas rápidas que frenan suave, como en TV deportiva.
export const salidaSuave = Easing.bezier(0.16, 1, 0.3, 1);
export const entradaSuave = Easing.bezier(0.7, 0, 0.84, 0);
export const idaYVuelta = Easing.bezier(0.65, 0, 0.35, 1);

// Progreso de 0 a 1 entre dos cuadros, sin pasarse.
export const progreso = (
  frame: number,
  inicio: number,
  duracion: number,
  curva: (t: number) => number = salidaSuave,
) =>
  interpolate(frame, [inicio, inicio + duracion], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: curva,
  });

export const mezclar = (desde: number, hasta: number, t: number) =>
  desde + (hasta - desde) * t;
