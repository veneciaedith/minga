import React from 'react';
import {useCurrentFrame} from 'remotion';
import {progreso} from '../../animacion';
import {colores, fuentes} from '../../tema';
import {PalabraPorPalabra} from './PalabraPorPalabra';

type Props = {
  texto: string;
  bajada?: string;
  inicio?: number;
  tamano?: number;
  salida?: number;
};

// Título de sección con una rayita ocre que se estira debajo.
export const Titulo: React.FC<Props> = ({texto, bajada, inicio = 0, tamano = 104, salida}) => {
  const frame = useCurrentFrame();
  const raya = progreso(frame, inicio + 6, 26);
  const fueraRaya = salida === undefined ? 0 : progreso(frame, salida, 14);
  return (
    <div>
      <PalabraPorPalabra texto={texto} inicio={inicio} tamano={tamano} peso={800} salida={salida} />
      <div
        style={{
          height: 10,
          width: 150,
          marginTop: 14,
          background: colores.ocre,
          transformOrigin: 'left',
          transform: `scaleX(${raya * (1 - fueraRaya)})`,
          borderRadius: 2,
        }}
      />
      {bajada ? (
        <PalabraPorPalabra
          texto={bajada}
          inicio={inicio + 14}
          paso={2}
          tamano={44}
          peso={400}
          color={colores.tintaSuave}
          salida={salida}
          estilo={{marginTop: 26, maxWidth: 900, fontFamily: fuentes.texto}}
        />
      ) : null}
    </div>
  );
};
