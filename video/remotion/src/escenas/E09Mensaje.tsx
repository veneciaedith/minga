import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {progreso, mezclar} from '../animacion';
import {colores, fuentes} from '../tema';
import {textos} from '../textos';
import {BarrasDiagonales} from '../componentes/graficos/BarrasDiagonales';

// 1:40–1:50 · El mensaje: las palabras llegan separadas y se agrupan.
export const E09Mensaje: React.FC = () => {
  const frame = useCurrentFrame();
  const lineas = textos.mensaje.lineas;
  const subrayado = progreso(frame, 150, 26);
  const respira = mezclar(1, 1.03, progreso(frame, 120, 180, (t) => t));
  let n = 0;

  return (
    <AbsoluteFill>
      <BarrasDiagonales inicio={0} lugar="abajo-derecha" escala={0.8} />
      <BarrasDiagonales inicio={4} lugar="arriba-izquierda" escala={0.5} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${respira})`}}>
        <div style={{textAlign: 'center'}}>
          {lineas.map((linea, li) => (
            <div key={linea} style={{display: 'flex', justifyContent: 'center', gap: 40, position: 'relative'}}>
              {linea.split(' ').map((palabra) => {
                const i = n++;
                const t = progreso(frame, 14 + i * 9, 30);
                const dx = (random(`x${i}`) - 0.5) * 1400 * (1 - t);
                const dy = (random(`y${i}`) - 0.5) * 300 * (1 - t);
                const ultima = palabra === 'confianza.';
                return (
                  <span
                    key={palabra + i}
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      fontFamily: fuentes.texto,
                      fontWeight: 800,
                      fontSize: 150,
                      lineHeight: 1.08,
                      letterSpacing: '-0.02em',
                      color: li === 2 && ultima ? colores.verde : colores.tinta,
                      opacity: t,
                      transform: `translate(${dx}px, ${dy}px) scale(${0.7 + 0.3 * t})`,
                    }}
                  >
                    {palabra}
                    {ultima ? (
                      <span
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 30,
                          bottom: 8,
                          height: 16,
                          background: colores.ocre,
                          transformOrigin: 'left',
                          transform: `scaleX(${subrayado})`,
                          zIndex: -1,
                        }}
                      />
                    ) : null}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
