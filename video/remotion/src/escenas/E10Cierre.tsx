import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {progreso, mezclar} from '../animacion';
import {colores, fuentes} from '../tema';
import {textos} from '../textos';
import {LogoAnimado} from '../componentes/graficos/LogoAnimado';
import {BarrasDiagonales} from '../componentes/graficos/BarrasDiagonales';
import {PalabraPorPalabra} from '../componentes/texto/PalabraPorPalabra';

// 1:50–2:00 · Cierre: el logo se vuelve a armar y queda quieto para leer.
export const E10Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const nombre = progreso(frame, 40, 24);
  const link = progreso(frame, 120, 20);
  const aviso = progreso(frame, 150, 20);

  return (
    <AbsoluteFill>
      <BarrasDiagonales inicio={0} lugar="abajo-derecha" />
      <BarrasDiagonales inicio={4} lugar="arriba-izquierda" escala={0.55} />

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', marginTop: -120}}>
          <LogoAnimado tamano={220} inicio={0} velocidad={1.6} />
          <div style={{overflow: 'hidden', width: mezclar(0, 560, nombre), marginLeft: mezclar(0, 46, nombre)}}>
            <div
              style={{
                fontFamily: fuentes.texto,
                fontWeight: 800,
                fontSize: 196,
                lineHeight: 1,
                color: colores.verdeLogo,
                letterSpacing: '-0.02em',
                transform: `translateX(${(1 - nombre) * -110}%)`,
              }}
            >
              Minga
            </div>
          </div>
        </div>

        <div style={{marginTop: 50}}>
          <PalabraPorPalabra
            texto={textos.cierre.lema}
            inicio={70}
            paso={4}
            tamano={58}
            peso={400}
            italica
            color={colores.tintaSuave}
            alinear="center"
          />
        </div>

        <div
          style={{
            marginTop: 50,
            padding: '16px 40px',
            borderRadius: 999,
            background: colores.verde,
            color: colores.papel,
            fontFamily: fuentes.numeros,
            fontWeight: 600,
            fontSize: 46,
            opacity: link,
            transform: `translateY(${(1 - link) * 30}px)`,
          }}
        >
          {textos.cierre.link}
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 60,
          textAlign: 'center',
          fontFamily: fuentes.texto,
          fontSize: 34,
          color: colores.tintaSuave,
          opacity: aviso,
        }}
      >
        {textos.cierre.aviso}
      </div>
    </AbsoluteFill>
  );
};
