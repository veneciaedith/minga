import React from 'react';

// Íconos de línea simples, dibujados a mano en SVG (sin librerías externas).
// "dibujo" va de 0 a 1 para trazarlos de a poco.

type Props = {tamano: number; color: string; grosor?: number; dibujo?: number};

const trazo = (dibujo: number) => ({
  pathLength: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1 - dibujo,
});

const Base: React.FC<Props & {children: React.ReactNode}> = ({tamano, color, grosor = 2, children}) => (
  <svg
    width={tamano}
    height={tamano}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={grosor}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const IconoMicrofono: React.FC<Props> = ({dibujo = 1, ...p}) => (
  <Base {...p}>
    <rect x="9" y="2" width="6" height="12" rx="3" {...trazo(dibujo)} />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" {...trazo(dibujo)} />
  </Base>
);

export const IconoCamara: React.FC<Props> = ({dibujo = 1, ...p}) => (
  <Base {...p}>
    <path d="M3 8a2 2 0 0 1 2-2h2.5l1.5-2h6l1.5 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" {...trazo(dibujo)} />
    <circle cx="12" cy="13" r="3.5" {...trazo(dibujo)} />
  </Base>
);

export const IconoEscudo: React.FC<Props> = ({dibujo = 1, ...p}) => (
  <Base {...p}>
    <path d="M12 2.5 4 5.5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10v-6z" {...trazo(dibujo)} />
    <path d="m8.5 12 2.5 2.5 4.5-5" {...trazo(Math.max(0, dibujo * 2 - 1))} />
  </Base>
);

export const IconoTilde: React.FC<Props> = ({dibujo = 1, ...p}) => (
  <Base {...p}>
    <path d="m4.5 12.5 5 5 10-11" {...trazo(dibujo)} />
  </Base>
);

export const IconoVolver: React.FC<Props> = ({dibujo = 1, ...p}) => (
  <Base {...p}>
    <path d="M9 14 4 9l5-5" {...trazo(dibujo)} />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" {...trazo(dibujo)} />
  </Base>
);

export const IconoTienda: React.FC<Props> = ({dibujo = 1, ...p}) => (
  <Base {...p}>
    <path d="M3 9.5 4.5 4h15L21 9.5M3 9.5h18M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 12v8h14v-8M10 20v-5h4v5" {...trazo(dibujo)} />
  </Base>
);

// Candado que se cierra: "cerrado" va de 0 (abierto) a 1 (cerrado).
export const IconoCandado: React.FC<Props & {cerrado: number}> = ({cerrado, dibujo = 1, ...p}) => (
  <Base {...p}>
    <rect x="5" y="11" width="14" height="10" rx="2" {...trazo(dibujo)} />
    <path
      d="M8 11V7.5a4 4 0 0 1 8 0V11"
      transform={`translate(0 ${-3 * (1 - cerrado)})`}
      {...trazo(dibujo)}
    />
    <circle cx="12" cy="16" r="1.3" fill={p.color} stroke="none" opacity={cerrado} />
  </Base>
);
