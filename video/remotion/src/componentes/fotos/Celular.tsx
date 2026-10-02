import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {progreso} from '../../animacion';
import {colores} from '../../tema';

// Las capturas recortadas miden 1080 × 1805.
const PROPORCION = 1805 / 1080;

type Props = {
  capturas: {archivo: string; desde?: number}[]; // cambia de captura en el cuadro "desde"
  ancho: number;
  inicio?: number;
  desdeAbajo?: boolean;
  giro?: number; // grados al entrar
  estilo?: React.CSSProperties;
  children?: React.ReactNode; // cosas que se dibujan encima de la pantalla
};

// Celular dibujado con la captura real de la app adentro.
export const Celular: React.FC<Props> = ({
  capturas,
  ancho,
  inicio = 0,
  desdeAbajo = true,
  giro = -8,
  estilo,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = progreso(frame, inicio, 30);
  const borde = ancho * 0.045;
  const altoPantalla = ancho * PROPORCION;

  return (
    <div
      style={{
        position: 'absolute',
        width: ancho + borde * 2,
        padding: borde,
        paddingTop: borde * 2.2,
        paddingBottom: borde * 2.2,
        borderRadius: ancho * 0.12,
        background: colores.tinta,
        boxShadow: '0 40px 80px rgba(26,35,33,.18), 0 10px 24px rgba(26,35,33,.12)',
        transform: `translateY(${(1 - t) * (desdeAbajo ? 900 : -900)}px) rotate(${giro * (1 - t)}deg)`,
        ...estilo,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: ancho,
          height: altoPantalla,
          overflow: 'hidden',
          borderRadius: ancho * 0.06,
          background: colores.papel,
        }}
      >
        {capturas.map((c, i) => {
          const aparece = i === 0 ? 1 : progreso(frame, c.desde ?? 0, 18);
          return (
            <Img
              key={c.archivo}
              src={staticFile(`capturas/${c.archivo}`)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                transform: i === 0 ? undefined : `translateX(${(1 - aparece) * 100}%)`,
              }}
            />
          );
        })}
        {children}
      </div>
    </div>
  );
};
