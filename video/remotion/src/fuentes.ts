import {continueRender, delayRender} from 'remotion';
import '@fontsource/alegreya-sans/400.css';
import '@fontsource/alegreya-sans/400-italic.css';
import '@fontsource/alegreya-sans/500.css';
import '@fontsource/alegreya-sans/700.css';
import '@fontsource/alegreya-sans/800.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';

// Espera a que las tipografías estén cargadas antes de dibujar cada cuadro.
const espera = delayRender('Cargando tipografías');
Promise.all([
  document.fonts.load('400 40px "Alegreya Sans"'),
  document.fonts.load('italic 400 40px "Alegreya Sans"'),
  document.fonts.load('500 40px "Alegreya Sans"'),
  document.fonts.load('700 40px "Alegreya Sans"'),
  document.fonts.load('800 40px "Alegreya Sans"'),
  document.fonts.load('500 40px "IBM Plex Mono"'),
  document.fonts.load('600 40px "IBM Plex Mono"'),
])
  .then(() => continueRender(espera))
  .catch(() => continueRender(espera));
