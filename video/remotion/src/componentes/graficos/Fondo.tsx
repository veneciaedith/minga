import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colores} from '../../tema';

// Fondo claro de papel con una grilla de puntitos que se desliza muy despacio.
// Da sensación de continuidad entre escenas sin distraer.
export const Fondo: React.FC<{color?: string}> = ({color = colores.papel}) => {
  const frame = useCurrentFrame();
  const corrimiento = (frame * 0.4) % 48;
  return (
    <AbsoluteFill style={{background: color}}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle, ${colores.borde} 1.6px, transparent 1.8px)`,
          backgroundSize: '48px 48px',
          backgroundPosition: `${corrimiento}px ${corrimiento * 0.5}px`,
          opacity: 0.55,
        }}
      />
    </AbsoluteFill>
  );
};
