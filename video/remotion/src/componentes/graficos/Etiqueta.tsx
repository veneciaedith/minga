import React from 'react';
import {useCurrentFrame} from 'remotion';
import {progreso} from '../../animacion';
import {colores, fuentes} from '../../tema';

export type TipoEstado = 'bien' | 'atencion' | 'perdida';

// Igual que en la app: el estado nunca se dice solo con color, siempre con un signo.
const estilos: Record<TipoEstado, {color: string; fondo: string; signo: string}> = {
  bien: {color: colores.bien, fondo: colores.bienFondo, signo: '✓'},
  atencion: {color: colores.atencion, fondo: colores.atencionFondo, signo: '!'},
  perdida: {color: colores.perdida, fondo: colores.perdidaFondo, signo: '▼'},
};

type Props = {
  tipo: TipoEstado;
  texto: string;
  inicio?: number;
  tamano?: number;
};

export const Etiqueta: React.FC<Props> = ({tipo, texto, inicio = 0, tamano = 40}) => {
  const frame = useCurrentFrame();
  const t = progreso(frame, inicio, 16);
  const e = estilos[tipo];
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: tamano * 0.3,
        padding: `${tamano * 0.22}px ${tamano * 0.6}px`,
        borderRadius: 999,
        border: `${Math.max(3, tamano * 0.08)}px solid ${e.color}`,
        background: e.fondo,
        color: e.color,
        fontFamily: fuentes.texto,
        fontWeight: 800,
        fontSize: tamano,
        lineHeight: 1.1,
        whiteSpace: 'nowrap',
        opacity: t,
        transform: `scale(${0.7 + 0.3 * t})`,
        transformOrigin: 'left center',
      }}
    >
      <span>{e.signo}</span>
      <span>{texto}</span>
    </div>
  );
};

export const colorDeEstado = (tipo: TipoEstado) => estilos[tipo];
