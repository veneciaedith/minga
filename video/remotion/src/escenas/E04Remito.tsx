import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {progreso} from '../animacion';
import {colores, fuentes} from '../tema';
import {textos} from '../textos';
import {Celular} from '../componentes/fotos/Celular';
import {Contador} from '../componentes/graficos/Contador';
import {Titulo} from '../componentes/texto/Titulo';
import {IconoTilde} from '../componentes/graficos/Iconos';

// Línea verde que recorre la captura una sola vez: Minga "lee" el remito.
const Lectura: React.FC = () => {
  const frame = useCurrentFrame();
  const t = progreso(frame, 40, 70, (x) => x);
  if (t <= 0 || t >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: `${t * 100}%`,
        height: 120,
        marginTop: -120,
        background: `linear-gradient(to bottom, transparent, ${colores.bien}33)`,
        borderBottom: `5px solid ${colores.bien}`,
      }}
    />
  );
};

const Fila: React.FC<{producto: string; cantidad: number; total: number; inicio: number; ultima: boolean}> = ({
  producto,
  cantidad,
  total,
  inicio,
  ultima,
}) => {
  const frame = useCurrentFrame();
  const t = progreso(frame, inicio, 22);
  const linea = progreso(frame, inicio + 10, 30);
  return (
    <div style={{position: 'relative', padding: '10px 0'}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          opacity: t,
          transform: `translateX(${(1 - t) * 120}px)`,
        }}
      >
        <div>
          <div style={{fontFamily: fuentes.texto, fontWeight: 800, fontSize: 46, color: colores.tinta}}>
            {producto}
          </div>
          <div style={{fontFamily: fuentes.texto, fontSize: 36, color: colores.tintaSuave, marginTop: 4}}>
            <Contador hasta={total} formato="plata" inicio={inicio + 6} tamano={36} peso={500} color={colores.tintaSuave} />{' '}
            en total
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
          <span style={{fontFamily: fuentes.texto, fontSize: 38, color: colores.tintaSuave}}>entraron</span>
          <Contador hasta={cantidad} inicio={inicio + 4} duracion={30} tamano={88} color={colores.verde} />
        </div>
      </div>
      {!ultima ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 3,
            background: colores.borde,
            transformOrigin: 'left',
            transform: `scaleX(${linea})`,
          }}
        />
      ) : null}
    </div>
  );
};

// 0:35–0:50 · Minga lee el remito y lo convierte en datos.
export const E04Remito: React.FC = () => {
  const frame = useCurrentFrame();
  const proveedor = progreso(frame, 70, 20);
  const boton = progreso(frame, 330, 18);
  const aprieta = progreso(frame, 360, 6) - progreso(frame, 366, 8);
  const listo = progreso(frame, 372, 20);

  return (
    <AbsoluteFill>
      <Celular
        capturas={[{archivo: 'cargar-remito.png'}]}
        ancho={380}
        inicio={0}
        giro={6}
        estilo={{left: 170, top: 165}}
      >
        <Lectura />
      </Celular>

      <div style={{position: 'absolute', left: 740, right: 120, top: 150}}>
        <Titulo texto={textos.remito.titulo} inicio={12} tamano={84} />
        <div
          style={{
            marginTop: 16,
            paddingLeft: 24,
            borderLeft: `8px solid ${colores.ocre}`,
            fontFamily: fuentes.texto,
            fontStyle: 'italic',
            fontSize: 42,
            color: colores.tintaSuave,
            opacity: proveedor,
            transform: `translateY(${(1 - proveedor) * 20}px)`,
          }}
        >
          {textos.remito.proveedor}
        </div>

        <div style={{marginTop: 16}}>
          {textos.remito.filas.map((f, i) => (
            <Fila key={f.producto} {...f} inicio={110 + i * 55} ultima={i === textos.remito.filas.length - 1} />
          ))}
        </div>

        <div
          style={{
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 36,
            opacity: boton,
            transform: `translateY(${(1 - boton) * 30}px)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: colores.verde,
              color: colores.papel,
              fontFamily: fuentes.texto,
              fontWeight: 800,
              fontSize: 46,
              padding: '16px 36px',
              borderRadius: 22,
              transform: `scale(${1 - aprieta * 0.06})`,
            }}
          >
            <IconoTilde tamano={46} color={colores.papel} grosor={3} dibujo={listo} />
            Está bien, guardar
          </div>
          <div style={{fontFamily: fuentes.texto, fontWeight: 700, fontSize: 46, color: colores.tinta}}>
            {textos.remito.cierre}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
