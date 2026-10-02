// Colores, tipografías y medidas del video.
// Salen de la app (mockups/minga-app.html) y del logo (marca/README.md).

export const colores = {
  // superficies (siempre claras)
  papel: '#FBF7F1',
  papel2: '#F2EADF',
  tarjeta: '#FFFFFF',
  borde: '#E2D6C6',
  bordeFuerte: '#C9B79F',

  // texto
  tinta: '#1A2321',
  tintaSuave: '#56635E',

  // marca
  verde: '#0E5A51',
  verdeLogo: '#0B4E46',
  ocre: '#D9A227',
  terracota: '#C0512F',

  // estados: siempre van con ícono, nunca solo el color
  bien: '#1A6B44',
  bienFondo: '#E3F1E8',
  atencion: '#8A5A0B',
  atencionFondo: '#FAEED3',
  perdida: '#9C2A20',
  perdidaFondo: '#FAE3DF',
} as const;

export const fuentes = {
  texto: '"Alegreya Sans", system-ui, sans-serif',
  numeros: '"IBM Plex Mono", ui-monospace, monospace',
} as const;

export const video = {
  ancho: 1920,
  alto: 1080,
  fps: 30,
  segundos: 120,
} as const;

export const s = (segundos: number) => Math.round(segundos * video.fps);
