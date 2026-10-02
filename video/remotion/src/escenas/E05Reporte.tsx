import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {progreso} from '../animacion';
import {colores, fuentes} from '../tema';
import {textos} from '../textos';
import {Titulo} from '../componentes/texto/Titulo';
import {Contador} from '../componentes/graficos/Contador';
import {Etiqueta, colorDeEstado} from '../componentes/graficos/Etiqueta';

// Mismas tramas que la app: rayas para "para mirar", puntitos para "pérdida".
// Así se distinguen aunque no se vean los colores.
const trama = (tipo: string) => {
  if (tipo === 'atencion')
    return `repeating-linear-gradient(45deg, transparent 0 14px, ${colores.atencion}38 14px 28px)`;
  if (tipo === 'perdida')
    return `radial-gradient(circle at 8px 8px, ${colores.perdida}55 4px, transparent 4.5px)`;
  return 'none';
};

const ANCHO = 1680;

// 0:50–0:59 · Reporte: 12 productos, 7 / 3 / 2.
export const E05Reporte: React.FC = () => {
  const frame = useCurrentFrame();
  const {total, partes} = textos.reporte;

  let acumulado = 0;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 120, top: 190, right: 120}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <Titulo texto={textos.reporte.titulo} bajada={textos.reporte.bajada} inicio={6} tamano={104} />
          <div style={{textAlign: 'right', marginTop: 10}}>
            <Contador hasta={total} inicio={30} duracion={30} tamano={200} color={colores.verde} />
            <div style={{fontFamily: fuentes.texto, fontWeight: 700, fontSize: 46, color: colores.tinta, marginTop: -10}}>
              productos
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            marginTop: 90,
            width: ANCHO,
            height: 170,
            borderRadius: 30,
            overflow: 'hidden',
            border: `4px solid ${colores.bordeFuerte}`,
            background: colores.tarjeta,
          }}
        >
          {partes.map((p, i) => {
            const ancho = (p.cantidad / total) * ANCHO;
            const izquierda = acumulado;
            acumulado += ancho;
            const t = progreso(frame, 70 + i * 22, 26);
            const e = colorDeEstado(p.tipo);
            return (
              <div
                key={p.tipo}
                style={{
                  position: 'absolute',
                  left: izquierda,
                  top: 0,
                  bottom: 0,
                  width: ancho * t,
                  background: e.fondo,
                  backgroundImage: trama(p.tipo),
                  backgroundSize: p.tipo === 'perdida' ? '16px 16px' : undefined,
                  borderRight: i < partes.length - 1 ? `4px solid ${colores.tarjeta}` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Contador hasta={p.cantidad} inicio={76 + i * 22} duracion={20} tamano={84} color={e.color} />
              </div>
            );
          })}
        </div>

        <div style={{position: 'relative', height: 120, marginTop: 34}}>
          {(() => {
            let izq = 0;
            return partes.map((p, i) => {
              const x = izq;
              izq += (p.cantidad / total) * ANCHO;
              return (
                <div key={p.tipo} style={{position: 'absolute', left: i === 2 ? undefined : x, right: i === 2 ? 0 : undefined}}>
                  <Etiqueta tipo={p.tipo} texto={p.etiqueta} inicio={110 + i * 22} tamano={46} />
                </div>
              );
            });
          })()}
        </div>
      </div>
    </AbsoluteFill>
  );
};
