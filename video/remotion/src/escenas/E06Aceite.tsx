import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {progreso} from '../animacion';
import {colores, fuentes} from '../tema';
import {textos, plata} from '../textos';
import {Contador} from '../componentes/graficos/Contador';
import {Etiqueta} from '../componentes/graficos/Etiqueta';
import {PalabraPorPalabra} from '../componentes/texto/PalabraPorPalabra';

const ESCALA = 560 / 3560; // px por peso (la barra más alta es la del precio sugerido)

const Barra: React.FC<{valor: number; inicio: number; color: string; rotulo: string; trama?: boolean}> = ({
  valor,
  inicio,
  color,
  rotulo,
  trama,
}) => {
  const frame = useCurrentFrame();
  const t = progreso(frame, inicio, 34);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 210}}>
      <Contador hasta={valor} formato="plata" inicio={inicio} duracion={34} tamano={52} color={color} />
      <div
        style={{
          marginTop: 14,
          width: 170,
          height: valor * ESCALA * t,
          background: color,
          backgroundImage: trama
            ? `repeating-linear-gradient(-45deg, transparent 0 12px, ${colores.tarjeta}40 12px 24px)`
            : undefined,
          borderRadius: '14px 14px 0 0',
        }}
      />
      <div style={{fontFamily: fuentes.texto, fontWeight: 700, fontSize: 38, color: colores.tinta, marginTop: 16}}>
        {rotulo}
      </div>
    </div>
  );
};

// 0:59–1:10 · El caso del aceite: se pierde plata y Minga dice cómo arreglarlo.
export const E06Aceite: React.FC = () => {
  const frame = useCurrentFrame();
  const a = textos.aceite;
  const brecha = progreso(frame, 100, 20);
  const multiplica = progreso(frame, 140, 20);
  const solucion = progreso(frame, 215, 24);
  const base = 610; // altura donde apoyan las barras

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 120, top: 180, display: 'flex', alignItems: 'center', gap: 40}}>
        <PalabraPorPalabra texto={a.producto} inicio={4} paso={4} tamano={84} peso={800} />
        <Etiqueta tipo="perdida" texto="Perdés plata" inicio={24} tamano={44} />
      </div>

      {/* barras */}
      <div style={{position: 'absolute', left: 120, top: 300, height: base + 90, display: 'flex', alignItems: 'flex-end', gap: 30}}>
        <Barra valor={a.compra} inicio={40} color={colores.tintaSuave} rotulo="Lo comprás" />
        <div style={{position: 'relative'}}>
          <Barra valor={a.venta} inicio={56} color={colores.perdida} rotulo="Lo vendés" trama />
        </div>
        <div style={{opacity: solucion}}>
          <Barra valor={a.precioSugerido} inicio={215} color={colores.bien} rotulo="Precio nuevo" />
        </div>
      </div>

      {/* lo que pasa */}
      <div style={{position: 'absolute', left: 940, right: 120, top: 330}}>
        <div style={{opacity: brecha, transform: `translateX(${(1 - brecha) * 80}px)`}}>
          <div style={{fontFamily: fuentes.texto, fontSize: 46, color: colores.tintaSuave}}>Perdés en cada botella</div>
          <div style={{fontFamily: fuentes.numeros, fontWeight: 600, fontSize: 96, color: colores.perdida}}>
            −{plata(a.perdidaUnidad)}
          </div>
        </div>

        <div
          style={{
            marginTop: 30,
            opacity: multiplica * (1 - solucion * 0.6),
            transform: `translateX(${(1 - multiplica) * 80}px)`,
          }}
        >
          <div style={{fontFamily: fuentes.texto, fontSize: 46, color: colores.tintaSuave}}>
            × {a.vendidas} botellas vendidas esta semana
          </div>
          <Contador hasta={a.perdidaTotal} formato="plata" signo="−" inicio={150} duracion={40} tamano={150} color={colores.perdida} />
        </div>

        <div
          style={{
            marginTop: 26,
            padding: '26px 34px',
            borderRadius: 24,
            background: colores.bienFondo,
            border: `4px solid ${colores.bien}`,
            opacity: solucion,
            transform: `translateY(${(1 - solucion) * 60}px)`,
          }}
        >
          <div style={{fontFamily: fuentes.texto, fontWeight: 800, fontSize: 52, color: colores.bien}}>
            ✓ Subilo a {plata(a.precioSugerido)}
          </div>
          <div style={{fontFamily: fuentes.texto, fontSize: 44, color: colores.tinta, marginTop: 6}}>
            y volvés a ganar{' '}
            <Contador hasta={a.gananciaUnidad} formato="plata" signo="+" inicio={235} duracion={30} tamano={50} color={colores.bien} />{' '}
            por botella
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
