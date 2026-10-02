import React from 'react';
import {useCurrentFrame} from 'remotion';
import {progreso, mezclar} from '../../animacion';
import {colores} from '../../tema';

type Props = {
  tamano: number;
  inicio?: number;
  velocidad?: number; // 1 = normal, 2 = el doble de rápido
};

// El logo se arma como dice su idea: pasos que llegan desde los cuatro lados
// y en el medio queda algo que es de todos (el cuadradito terracota).
// Mismas medidas que marca/minga-logo.svg (cuadrícula de 34).
const piezas = [
  // centro, en cuatro partes que llegan desde las esquinas
  {x: 10, y: 10, w: 7, h: 7, dx: -1, dy: -1},
  {x: 17, y: 10, w: 7, h: 7, dx: 1, dy: -1},
  {x: 10, y: 17, w: 7, h: 7, dx: -1, dy: 1},
  {x: 17, y: 17, w: 7, h: 7, dx: 1, dy: 1},
  // los cuatro escalones de afuera
  {x: 13, y: 7, w: 8, h: 3, dx: 0, dy: -1},
  {x: 24, y: 13, w: 3, h: 8, dx: 1, dy: 0},
  {x: 13, y: 24, w: 8, h: 3, dx: 0, dy: 1},
  {x: 7, y: 13, w: 3, h: 8, dx: -1, dy: 0},
];

export const LogoAnimado: React.FC<Props> = ({tamano, inicio = 0, velocidad = 1}) => {
  const frame = useCurrentFrame();
  const f = (frame - inicio) * velocidad;

  const fondo = progreso(f, 0, 18);
  const centro = progreso(f, 52, 16);

  return (
    <svg width={tamano} height={tamano} viewBox="0 0 34 34" style={{overflow: 'visible'}}>
      <g transform={`translate(17 17) scale(${fondo}) rotate(${mezclar(-45, 0, fondo)}) translate(-17 -17)`}>
        <rect width="34" height="34" rx="9" fill={colores.verdeLogo} />
      </g>
      {piezas.map((p, i) => {
        const t = progreso(f, 14 + i * 4, 18);
        const lejos = 14 * (1 - t);
        return (
          <rect
            key={i}
            x={p.x + p.dx * lejos}
            y={p.y + p.dy * lejos}
            width={p.w}
            height={p.h}
            fill={colores.ocre}
            opacity={t > 0 ? 1 : 0}
            // un pelito más grande para que no se vean costuras entre piezas
            stroke={colores.ocre}
            strokeWidth={0.12}
          />
        );
      })}
      <g transform={`translate(17 ${mezclar(5, 17, centro)}) scale(${centro})`}>
        <rect x="-2" y="-2" width="4" height="4" rx="1" fill={colores.terracota} />
      </g>
    </svg>
  );
};

// Logo quieto (para el marcador de arriba).
export const Logo: React.FC<{tamano: number}> = ({tamano}) => (
  <svg width={tamano} height={tamano} viewBox="0 0 34 34">
    <rect width="34" height="34" rx="9" fill={colores.verdeLogo} />
    <path d="M13 7h8v3h3v3h3v8h-3v3h-3v3h-8v-3h-3v-3H7v-8h3v-3h3z" fill={colores.ocre} />
    <rect x="15" y="15" width="4" height="4" rx="1" fill={colores.terracota} />
  </svg>
);
