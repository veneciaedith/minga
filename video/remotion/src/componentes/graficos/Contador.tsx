import React from 'react';
import {useCurrentFrame} from 'remotion';
import {progreso} from '../../animacion';
import {colores, fuentes} from '../../tema';
import {plata} from '../../textos';

type Props = {
  hasta: number;
  desde?: number;
  inicio?: number;
  duracion?: number;
  formato?: 'plata' | 'numero';
  signo?: '' | '+' | '−';
  tamano?: number;
  color?: string;
  peso?: number;
  estilo?: React.CSSProperties;
};

// Número que cuenta hasta su valor. Usa la tipografía de los números de la app.
export const Contador: React.FC<Props> = ({
  hasta,
  desde = 0,
  inicio = 0,
  duracion = 36,
  formato = 'numero',
  signo = '',
  tamano = 96,
  color = colores.tinta,
  peso = 600,
  estilo,
}) => {
  const frame = useCurrentFrame();
  const t = progreso(frame, inicio, duracion);
  const valor = desde + (hasta - desde) * t;
  const texto = formato === 'plata' ? plata(valor) : String(Math.round(valor));
  return (
    <span
      style={{
        fontFamily: fuentes.numeros,
        fontWeight: peso,
        fontSize: tamano,
        color,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
        whiteSpace: 'nowrap',
        ...estilo,
      }}
    >
      {signo}
      {texto}
    </span>
  );
};
