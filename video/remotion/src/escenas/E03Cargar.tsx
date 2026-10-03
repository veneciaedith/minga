import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {progreso} from '../animacion';
import {colores, fuentes} from '../tema';
import {textos} from '../textos';
import {RevelarConBarra} from '../componentes/texto/RevelarConBarra';
import {PalabraPorPalabra} from '../componentes/texto/PalabraPorPalabra';
import {Celular} from '../componentes/fotos/Celular';
import {IconoCamara, IconoMicrofono} from '../componentes/graficos/Iconos';

// Ondas de voz: suben y bajan con calma (no parpadean).
const Ondas: React.FC<{inicio: number}> = ({inicio}) => {
  const frame = useCurrentFrame();
  const t = progreso(frame, inicio, 20);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 10, height: 80, marginLeft: 26}}>
      {Array.from({length: 9}).map((_, i) => {
        const alto = 18 + 50 * Math.abs(Math.sin((frame - inicio) / 9 + i * 0.8));
        return (
          <div
            key={i}
            style={{width: 10, height: alto * t, borderRadius: 5, background: colores.verde, opacity: 0.85}}
          />
        );
      })}
    </div>
  );
};

const Fila: React.FC<{
  inicio: number;
  colorIcono: string;
  fondoIcono: string;
  icono: 'voz' | 'foto';
  texto: string;
  extra?: React.ReactNode;
}> = ({inicio, colorIcono, fondoIcono, icono, texto, extra}) => {
  const frame = useCurrentFrame();
  const t = progreso(frame, inicio, 22);
  const dibujo = progreso(frame, inicio + 4, 30);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 36,
        opacity: t,
        transform: `translateX(${(1 - t) * -160}px)`,
      }}
    >
      <div
        style={{
          width: 132,
          height: 132,
          borderRadius: 34,
          background: fondoIcono,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icono === 'voz' ? (
          <IconoMicrofono tamano={74} color={colorIcono} dibujo={dibujo} />
        ) : (
          <IconoCamara tamano={74} color={colorIcono} dibujo={dibujo} />
        )}
      </div>
      <div style={{fontFamily: fuentes.texto, fontWeight: 700, fontSize: 62, color: colores.tinta}}>{texto}</div>
      {extra}
    </div>
  );
};

// 0:22–0:35 · Cargar: voz o foto, sin teclado.
export const E03Cargar: React.FC = () => {
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 120, top: 220, width: 980}}>
        <RevelarConBarra inicio={8} colorBarra={colores.verde}>
          <div style={{fontFamily: fuentes.texto, fontWeight: 800, fontSize: 124, color: colores.tinta, lineHeight: 1}}>
            {textos.cargar.titulo}
          </div>
        </RevelarConBarra>

        <div style={{display: 'flex', flexDirection: 'column', gap: 44, marginTop: 80}}>
          <Fila
            inicio={60}
            icono="voz"
            colorIcono={colores.verde}
            fondoIcono={colores.bienFondo}
            texto={textos.cargar.voz}
            extra={<Ondas inicio={80} />}
          />
          <Fila
            inicio={130}
            icono="foto"
            colorIcono={colores.terracota}
            fondoIcono={colores.papel2}
            texto={textos.cargar.foto}
          />
        </div>

        <div style={{marginTop: 70}}>
          <PalabraPorPalabra
            texto={textos.cargar.bajada}
            inicio={210}
            paso={4}
            tamano={50}
            peso={500}
            italica
            color={colores.tintaSuave}
          />
        </div>
      </div>

      <Celular
        capturas={[{archivo: 'cargar-inicio.png'}, {archivo: 'cargar-hoy.png', desde: 280}]}
        ancho={430}
        inicio={20}
        estilo={{right: 170, top: 80}}
      />
    </AbsoluteFill>
  );
};
