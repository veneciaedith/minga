import React from 'react';
import {useCurrentFrame} from 'remotion';
import {progreso, entradaSuave} from '../../animacion';
import {colores, fuentes} from '../../tema';

type Props = {
  texto: string | readonly string[];
  inicio?: number;
  paso?: number; // cuadros entre una palabra y la siguiente
  salida?: number; // cuadro en que las palabras se van
  tamano?: number;
  peso?: number;
  color?: string;
  italica?: boolean;
  alinear?: 'left' | 'center' | 'right';
  destacar?: Record<string, string>; // palabra -> color
  estilo?: React.CSSProperties;
};

// Cada palabra sube desde atrás de una máscara.
export const PalabraPorPalabra: React.FC<Props> = ({
  texto,
  inicio = 0,
  paso = 4,
  salida,
  tamano = 72,
  peso = 700,
  color = colores.tinta,
  italica = false,
  alinear = 'left',
  destacar = {},
  estilo,
}) => {
  const frame = useCurrentFrame();
  const palabras = typeof texto === 'string' ? texto.split(' ') : texto;

  return (
    <div
      style={{
        fontFamily: fuentes.texto,
        fontSize: tamano,
        fontWeight: peso,
        fontStyle: italica ? 'italic' : 'normal',
        color,
        lineHeight: 1.12,
        textAlign: alinear,
        letterSpacing: peso >= 700 ? '-0.01em' : 0,
        ...estilo,
      }}
    >
      {palabras.map((palabra, i) => {
        const entra = progreso(frame, inicio + i * paso, 18);
        const sale =
          salida === undefined ? 0 : progreso(frame, salida + i * 2, 12, entradaSuave);
        const y = (1 - entra) * 105 - sale * 105;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              overflow: 'hidden',
              verticalAlign: 'top',
              paddingBottom: '0.08em',
              marginRight: '0.24em',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${y}%)`,
                color: destacar[palabra] ?? color,
              }}
            >
              {palabra}
            </span>
          </span>
        );
      })}
    </div>
  );
};
