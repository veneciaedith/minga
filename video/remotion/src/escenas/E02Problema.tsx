import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {progreso, entradaSuave} from '../animacion';
import {colores, fuentes} from '../tema';
import {textos} from '../textos';
import {PalabraPorPalabra} from '../componentes/texto/PalabraPorPalabra';
import {IconoTienda} from '../componentes/graficos/Iconos';

const Panel: React.FC<{
  titulo: string;
  resultado: string;
  inicio: number;
  desdeIzquierda: boolean;
  aparta: number;
}> = ({titulo, resultado, inicio, desdeIzquierda, aparta}) => {
  const frame = useCurrentFrame();
  const t = progreso(frame, inicio, 24);
  const flecha = progreso(frame, inicio + 18, 20);
  const res = progreso(frame, inicio + 34, 16);
  const lado = desdeIzquierda ? -1 : 1;
  return (
    <div
      style={{
        width: 760,
        background: colores.tarjeta,
        border: `3px solid ${colores.borde}`,
        borderTop: `14px solid ${colores.perdida}`,
        borderRadius: 24,
        padding: '48px 56px',
        boxShadow: '0 20px 50px rgba(26,35,33,.08)',
        transform: `translateX(${(1 - t + aparta) * lado * 1200}px)`,
      }}
    >
      <div style={{fontFamily: fuentes.texto, fontWeight: 800, fontSize: 76, color: colores.tinta}}>
        {titulo}
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 30}}>
        <div
          style={{
            height: 8,
            width: 120 * flecha,
            background: colores.tintaSuave,
            borderRadius: 4,
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: -8,
              top: -12,
              borderLeft: `22px solid ${colores.tintaSuave}`,
              borderTop: '16px solid transparent',
              borderBottom: '16px solid transparent',
              opacity: flecha,
            }}
          />
        </div>
        <div
          style={{
            fontFamily: fuentes.texto,
            fontWeight: 800,
            fontSize: 64,
            color: colores.perdida,
            opacity: res,
            transform: `translateX(${(1 - res) * 40}px)`,
            marginLeft: 20,
          }}
        >
          ▼ {resultado}
        </div>
      </div>
    </div>
  );
};

// 0:10–0:22 · El problema de Rosa, en dos lados que chocan.
export const E02Problema: React.FC = () => {
  const frame = useCurrentFrame();
  const icono = progreso(frame, 0, 30);
  const aparta = progreso(frame, 205, 24);
  const subeTitulo = progreso(frame, 205, 24, entradaSuave);

  return (
    <AbsoluteFill style={{padding: '170px 120px 0'}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 40,
          opacity: 1 - subeTitulo,
          transform: `translateY(${-40 * subeTitulo}px)`,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 30,
            background: colores.papel2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${icono})`,
          }}
        >
          <IconoTienda tamano={76} color={colores.verde} dibujo={icono} />
        </div>
        <PalabraPorPalabra texto={textos.problema.quien} inicio={6} paso={5} tamano={84} peso={700} />
      </div>

      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 90}}>
        <Panel
          titulo={textos.problema.antes.titulo}
          resultado={textos.problema.antes.resultado}
          inicio={70}
          desdeIzquierda
          aparta={aparta}
        />
        <Panel
          titulo={textos.problema.despues.titulo}
          resultado={textos.problema.despues.resultado}
          inicio={118}
          desdeIzquierda={false}
          aparta={aparta}
        />
      </div>

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{marginTop: -120}}>
          <PalabraPorPalabra
            texto={textos.problema.remate}
            inicio={222}
            paso={6}
            tamano={120}
            peso={800}
            alinear="center"
            destacar={{'primero.': colores.terracota}}
            estilo={{maxWidth: 1500}}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
