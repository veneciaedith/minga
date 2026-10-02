import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {progreso, entradaSuave} from '../animacion';
import {colores, fuentes} from '../tema';
import {textos} from '../textos';
import {Contador} from '../componentes/graficos/Contador';
import {PalabraPorPalabra} from '../componentes/texto/PalabraPorPalabra';
import {IconoCandado, IconoEscudo, IconoTilde, IconoVolver} from '../componentes/graficos/Iconos';
import {Celular} from '../componentes/fotos/Celular';

const Paso: React.FC<{numero: number; texto: string; inicio: number; candado?: boolean}> = ({
  numero,
  texto,
  inicio,
  candado,
}) => {
  const frame = useCurrentFrame();
  const t = progreso(frame, inicio, 20);
  const lleno = progreso(frame, inicio + 10, 20);
  const cerrado = progreso(frame, inicio + 24, 14);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 330, opacity: t}}>
      <div
        style={{
          width: 130,
          height: 130,
          borderRadius: 65,
          border: `6px solid ${colores.bien}`,
          background: lleno > 0.5 ? colores.bien : colores.tarjeta,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${0.6 + 0.4 * t})`,
        }}
      >
        {candado ? (
          <IconoCandado tamano={70} color={lleno > 0.5 ? colores.papel : colores.bien} grosor={2.4} cerrado={cerrado} />
        ) : lleno > 0.5 ? (
          <IconoTilde tamano={70} color={colores.papel} grosor={3} dibujo={progreso(frame, inicio + 14, 16)} />
        ) : (
          <span style={{fontFamily: fuentes.numeros, fontSize: 56, color: colores.bien}}>{numero}</span>
        )}
      </div>
      <div
        style={{
          marginTop: 24,
          fontFamily: fuentes.texto,
          fontWeight: 700,
          fontSize: 40,
          lineHeight: 1.15,
          textAlign: 'center',
          color: colores.tinta,
        }}
      >
        {texto}
      </div>
    </div>
  );
};

// 1:25–1:40 · El pedido protegido: la plata queda guardada.
export const E08Pedido: React.FC = () => {
  const frame = useCurrentFrame();
  const p = textos.pedido;
  const escudo = progreso(frame, 0, 36);
  const pasos = progreso(frame, 225, 22, entradaSuave);
  const linea1 = progreso(frame, 100, 30);
  const linea2 = progreso(frame, 150, 30);
  const vuelve = progreso(frame, 360, 24);

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 120, top: 190, display: 'flex', alignItems: 'center', gap: 34}}>
        <IconoEscudo tamano={110} color={colores.verde} dibujo={escudo} grosor={2.2} />
        <div>
          <PalabraPorPalabra texto={p.titulo} inicio={8} paso={5} tamano={96} peso={800} />
          <div style={{fontFamily: fuentes.texto, fontSize: 42, color: colores.tintaSuave, marginTop: 6, opacity: progreso(frame, 30, 20)}}>
            {p.detalle} ·{' '}
            <Contador hasta={p.monto} formato="plata" inicio={34} duracion={36} tamano={44} color={colores.tinta} />
          </div>
        </div>
      </div>

      {/* los tres pasos */}
      <div
        style={{
          position: 'absolute',
          left: 120,
          top: 470,
          width: 1100,
          opacity: 1 - pasos,
          transform: `translateY(${-pasos * 60}px)`,
        }}
      >
        <div style={{position: 'absolute', left: 165, top: 62, width: 770, height: 6, background: colores.borde}} />
        <div style={{position: 'absolute', left: 165, top: 62, width: 385 * linea1, height: 6, background: colores.bien}} />
        <div style={{position: 'absolute', left: 550, top: 62, width: 385 * linea2, height: 6, background: colores.bien}} />
        <div style={{display: 'flex', justifyContent: 'space-between', position: 'relative'}}>
          <Paso numero={1} texto={p.pasos[0]} inicio={70} />
          <Paso numero={2} texto={p.pasos[1]} inicio={120} candado />
          <Paso numero={3} texto={p.pasos[2]} inicio={175} />
        </div>
      </div>

      {/* el golpe: nadie toca la plata */}
      <div style={{position: 'absolute', left: 120, top: 420, width: 1150}}>
        {p.impacto.map((linea, i) => (
          <PalabraPorPalabra
            key={linea}
            texto={linea}
            inicio={245 + i * 22}
            paso={4}
            tamano={100}
            peso={800}
            color={i === 0 ? colores.tinta : colores.verde}
          />
        ))}
        <div
          style={{
            marginTop: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            opacity: vuelve,
            transform: `translateX(${(1 - vuelve) * -80}px)`,
          }}
        >
          <IconoVolver tamano={64} color={colores.terracota} grosor={2.6} dibujo={vuelve} />
          <span style={{fontFamily: fuentes.texto, fontWeight: 700, fontSize: 50, color: colores.tinta}}>{p.cancelar}</span>
        </div>
      </div>

      <Celular
        capturas={[{archivo: 'feria-pedido.png'}, {archivo: 'feria-botones.png', desde: 300}]}
        ancho={400}
        inicio={40}
        giro={-6}
        estilo={{right: 150, top: 120}}
      />
    </AbsoluteFill>
  );
};
