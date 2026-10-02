import React from 'react';
import {useCurrentFrame} from 'remotion';
import {progreso} from '../../animacion';
import {colores} from '../../tema';

type Props = {
  inicio?: number;
  salida?: number;
  // dónde quedan apoyadas: esquina de abajo a la derecha o arriba a la izquierda
  lugar?: 'abajo-derecha' | 'arriba-izquierda';
  escala?: number;
};

const barras = [
  {color: colores.verde, ancho: 120},
  {color: colores.ocre, ancho: 64},
  {color: colores.terracota, ancho: 30},
];

// Tres franjas inclinadas con los colores del logo. Entran de un golpe desde el
// borde y quedan como acento de la marca en una esquina.
export const BarrasDiagonales: React.FC<Props> = ({
  inicio = 0,
  salida,
  lugar = 'abajo-derecha',
  escala = 1,
}) => {
  const frame = useCurrentFrame();
  const abajo = lugar === 'abajo-derecha';
  const alto = 560 * escala;
  const orden = abajo ? barras : [...barras].reverse();

  return (
    <div
      style={{
        position: 'absolute',
        [abajo ? 'right' : 'left']: 150 * escala,
        [abajo ? 'bottom' : 'top']: -40,
        height: alto,
        display: 'flex',
        alignItems: abajo ? 'flex-end' : 'flex-start',
        gap: 26 * escala,
        transform: 'skewX(-24deg)',
      }}
    >
      {orden.map((b, i) => {
        const k = abajo ? i : barras.length - 1 - i;
        const entra = progreso(frame, inicio + k * 4, 26);
        const sale = salida === undefined ? 0 : progreso(frame, salida + k * 3, 18);
        const desplazamiento = (1 - entra + sale) * (alto + 80);
        return (
          <div
            key={b.color}
            style={{
              width: b.ancho * escala,
              // las franjas bajan de largo: la verde es la más alta
              height: alto * (1 - k * 0.16),
              background: b.color,
              transform: `translateY(${abajo ? desplazamiento : -desplazamiento}px)`,
            }}
          />
        );
      })}
    </div>
  );
};
