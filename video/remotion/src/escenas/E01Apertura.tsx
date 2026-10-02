import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {progreso, mezclar} from '../animacion';
import {colores, fuentes} from '../tema';
import {textos} from '../textos';
import {LogoAnimado} from '../componentes/graficos/LogoAnimado';
import {BarrasDiagonales} from '../componentes/graficos/BarrasDiagonales';
import {PalabraPorPalabra} from '../componentes/texto/PalabraPorPalabra';

// 0:00–0:10 · Apertura: las franjas de la marca entran, el logo se arma
// pieza por pieza y aparece el lema.
export const E01Apertura: React.FC = () => {
  const frame = useCurrentFrame();
  const corre = progreso(frame, 92, 30);
  const nombre = progreso(frame, 104, 26);
  const acercar = mezclar(1.04, 1, progreso(frame, 0, 300, (t) => t));

  return (
    <AbsoluteFill style={{transform: `scale(${acercar})`}}>
      <BarrasDiagonales inicio={0} lugar="abajo-derecha" />
      <BarrasDiagonales inicio={6} lugar="arriba-izquierda" escala={0.55} />

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', transform: `translateY(${-60 * corre}px)`}}>
          <div style={{transform: `scale(${mezclar(1.25, 1, corre)})`}}>
            <LogoAnimado tamano={260} inicio={16} />
          </div>
          <div
            style={{
              overflow: 'hidden',
              width: mezclar(0, 640, corre),
              marginLeft: mezclar(0, 54, corre),
            }}
          >
            <div
              style={{
                fontFamily: fuentes.texto,
                fontWeight: 800,
                fontSize: 230,
                lineHeight: 1,
                color: colores.verdeLogo,
                letterSpacing: '-0.02em',
                transform: `translateX(${(1 - nombre) * -110}%)`,
              }}
            >
              {textos.apertura.marca}
            </div>
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{marginTop: 330}}>
          <PalabraPorPalabra
            texto={textos.apertura.lema}
            inicio={150}
            paso={6}
            tamano={60}
            peso={400}
            italica
            color={colores.tintaSuave}
            alinear="center"
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
