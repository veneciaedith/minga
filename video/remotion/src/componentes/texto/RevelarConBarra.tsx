import React from 'react';
import {useCurrentFrame} from 'remotion';
import {progreso, idaYVuelta} from '../../animacion';
import {colores} from '../../tema';

type Props = {
  inicio?: number;
  duracion?: number;
  colorBarra?: string;
  children: React.ReactNode;
  estilo?: React.CSSProperties;
};

// Una barra de color barre el texto y lo deja a la vista (estilo zócalo de TV).
export const RevelarConBarra: React.FC<Props> = ({
  inicio = 0,
  duracion = 22,
  colorBarra = colores.ocre,
  children,
  estilo,
}) => {
  const frame = useCurrentFrame();
  const t = progreso(frame, inicio, duracion, idaYVuelta);
  const crece = Math.min(t * 2, 1);
  const achica = Math.max(t * 2 - 1, 0);
  const visible = t >= 0.5;

  return (
    <div style={{position: 'relative', display: 'inline-block', ...estilo}}>
      <div style={{opacity: visible ? 1 : 0}}>{children}</div>
      <div
        style={{
          position: 'absolute',
          inset: '-4px -10px',
          background: colorBarra,
          transformOrigin: achica > 0 ? 'right center' : 'left center',
          transform: `scaleX(${achica > 0 ? 1 - achica : crece})`,
        }}
      />
    </div>
  );
};
