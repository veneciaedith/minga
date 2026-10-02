import React from 'react';
import {useCurrentFrame} from 'remotion';
import {progreso, entradaSuave} from '../../animacion';
import {colores, fuentes} from '../../tema';
import {Logo} from './LogoAnimado';

export type Seccion = {desde: number; hasta: number; nombre: string};

type Props = {secciones: Seccion[]; desde: number; hasta: number};

// El "marcador" de arriba a la izquierda, como en una transmisión:
// dice siempre en qué parte de la app estamos.
export const Marcador: React.FC<Props> = ({secciones, desde, hasta}) => {
  const frame = useCurrentFrame();
  const entra = progreso(frame, desde, 20);
  const sale = progreso(frame, hasta - 16, 16, entradaSuave);
  const x = (1 - entra) * -900 - sale * 900;
  if (frame < desde || frame > hasta) return null;
  const actual = secciones.find((sec) => frame >= sec.desde && frame < sec.hasta);

  return (
    <div
      style={{
        position: 'absolute',
        left: 64,
        top: 52,
        display: 'flex',
        alignItems: 'stretch',
        transform: `translateX(${x}px)`,
        filter: 'drop-shadow(0 6px 14px rgba(26,35,33,.10))',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          background: colores.tarjeta,
          padding: '10px 22px 10px 12px',
          borderRadius: '12px 0 0 12px',
          border: `2px solid ${colores.borde}`,
          borderRight: 'none',
        }}
      >
        <Logo tamano={46} />
        <span style={{fontFamily: fuentes.texto, fontWeight: 800, fontSize: 34, color: colores.verdeLogo}}>
          Minga
        </span>
      </div>
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          minWidth: 300,
          background: colores.verde,
          borderRadius: '0 12px 12px 0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 28px',
        }}
      >
        {secciones.map((sec) => {
          const dentro = progreso(frame, sec.desde, 14);
          const fuera = progreso(frame, sec.hasta, 14, entradaSuave);
          if (frame < sec.desde - 1 || frame > sec.hasta + 16) return null;
          return (
            <span
              key={sec.nombre}
              style={{
                position: sec === actual ? 'relative' : 'absolute',
                left: sec === actual ? undefined : 28,
                fontFamily: fuentes.texto,
                fontWeight: 700,
                fontSize: 32,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: colores.papel,
                transform: `translateY(${(1 - dentro) * 60 - fuera * 60}px)`,
                whiteSpace: 'nowrap',
              }}
            >
              {sec.nombre}
            </span>
          );
        })}
        {/* rayita ocre de avance dentro de la sección */}
        {actual ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              height: 6,
              width: '100%',
              background: colores.ocre,
              transformOrigin: 'left',
              transform: `scaleX(${(frame - actual.desde) / (actual.hasta - actual.desde)})`,
            }}
          />
        ) : null}
      </div>
    </div>
  );
};
