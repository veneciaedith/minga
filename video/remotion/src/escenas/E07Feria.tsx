import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {progreso, entradaSuave, mezclar} from '../animacion';
import {colores, fuentes} from '../tema';
import {textos, plata} from '../textos';
import {Titulo} from '../componentes/texto/Titulo';
import {Contador} from '../componentes/graficos/Contador';
import {Etiqueta} from '../componentes/graficos/Etiqueta';
import {IconoEscudo} from '../componentes/graficos/Iconos';

// Un puntito por comercio que aportó precios. No se sabe cuántos hay en cada
// zona, así que forman un solo grupo y las zonas aparecen como rótulos.
const Puntos: React.FC<{inicio: number}> = ({inicio}) => {
  const frame = useCurrentFrame();
  const n = textos.feria.comercios;
  const columnas = 7;
  return (
    <div style={{position: 'relative', width: 7 * 74, height: 5 * 74}}>
      {Array.from({length: n}).map((_, i) => {
        const fila = Math.floor(i / columnas);
        const col = i % columnas;
        const x = col * 74 + (fila % 2) * 37;
        const y = fila * 74;
        const angulo = random(`a${i}`) * Math.PI * 2;
        const t = progreso(frame, inicio + random(`d${i}`) * 40, 30);
        const dx = Math.cos(angulo) * 900 * (1 - t);
        const dy = Math.sin(angulo) * 700 * (1 - t);
        const color = [colores.verde, colores.ocre, colores.terracota][i % 3];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 46,
              height: 46,
              borderRadius: 23,
              background: color,
              opacity: t,
              transform: `translate(${dx}px, ${dy}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

const Comparacion: React.FC<{inicio: number}> = ({inicio}) => {
  const frame = useCurrentFrame();
  const f = textos.feria;
  const t = progreso(frame, inicio, 26);
  const marca = progreso(frame, inicio + 40, 36);
  const ancho = 1560;
  const pos = (v: number) => ((v - f.enTuZona) / (f.maximo - f.enTuZona)) * ancho;
  const diferencia = progreso(frame, inicio + 90, 20);

  return (
    <div style={{opacity: t, transform: `translateX(${(1 - t) * 300}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 40}}>
        <div style={{fontFamily: fuentes.texto, fontWeight: 800, fontSize: 80, color: colores.tinta}}>{f.producto}</div>
        <Etiqueta tipo="perdida" texto="Pagás de más" inicio={inicio + 20} tamano={44} />
      </div>

      <div style={{position: 'relative', width: ancho, marginTop: 130, marginLeft: 20}}>
        <div
          style={{
            height: 40,
            borderRadius: 20,
            border: `3px solid ${colores.bordeFuerte}`,
            background: `linear-gradient(to right, ${colores.bienFondo}, ${colores.atencionFondo}, ${colores.perdidaFondo})`,
          }}
        />
        {/* en tu zona */}
        <div style={{position: 'absolute', left: pos(f.enTuZona) - 9, top: -22, width: 18, height: 84, borderRadius: 9, background: colores.bien}} />
        <div style={{position: 'absolute', left: 0, top: -110, fontFamily: fuentes.texto, fontSize: 40, color: colores.bien, fontWeight: 700}}>
          ✓ En tu zona {plata(f.enTuZona)}
        </div>
        {/* vos pagás */}
        <div
          style={{
            position: 'absolute',
            left: mezclar(pos(f.enTuZona), pos(f.vosPagas), marca) - 9,
            top: -22,
            width: 18,
            height: 84,
            borderRadius: 9,
            background: colores.tinta,
            opacity: marca > 0 ? 1 : 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: pos(f.vosPagas),
            top: 80,
            transform: 'translateX(-50%)',
            fontFamily: fuentes.texto,
            fontSize: 40,
            fontWeight: 700,
            color: colores.tinta,
            opacity: marca,
            whiteSpace: 'nowrap',
          }}
        >
          Vos pagás {plata(f.vosPagas)}
        </div>
        <div style={{position: 'absolute', right: 0, top: -110, fontFamily: fuentes.numeros, fontSize: 36, color: colores.tintaSuave}}>
          {plata(f.maximo)}
        </div>
      </div>

      <div
        style={{
          marginTop: 170,
          display: 'flex',
          alignItems: 'baseline',
          gap: 24,
          opacity: diferencia,
          transform: `translateY(${(1 - diferencia) * 30}px)`,
        }}
      >
        <Contador hasta={f.vosPagas - f.enTuZona} formato="plata" inicio={inicio + 90} duracion={30} tamano={110} color={colores.perdida} />
        <span style={{fontFamily: fuentes.texto, fontSize: 52, fontWeight: 700, color: colores.tinta}}>
          de diferencia en cada paquete
        </span>
      </div>
    </div>
  );
};

// 1:10–1:25 · La Feria: precios de la zona, sin nombres.
export const E07Feria: React.FC = () => {
  const frame = useCurrentFrame();
  const f = textos.feria;
  const sale = progreso(frame, 200, 22, entradaSuave);
  const privacidad = progreso(frame, 120, 22);
  const escudo = progreso(frame, 120, 34);

  return (
    <AbsoluteFill>
      <div style={{opacity: 1 - sale, transform: `translateX(${-sale * 400}px)`}}>
        <div style={{position: 'absolute', left: 120, top: 190, width: 900}}>
          <Titulo texto={f.titulo} bajada={f.bajada} inicio={4} tamano={130} />
          <div style={{display: 'flex', alignItems: 'baseline', gap: 24, marginTop: 50}}>
            <Contador hasta={f.comercios} inicio={40} duracion={44} tamano={170} color={colores.verde} />
            <span style={{fontFamily: fuentes.texto, fontWeight: 800, fontSize: 58, color: colores.tinta}}>comercios</span>
          </div>
          <div
            style={{
              marginTop: 30,
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              opacity: privacidad,
              transform: `translateY(${(1 - privacidad) * 20}px)`,
            }}
          >
            <IconoEscudo tamano={60} color={colores.verde} dibujo={escudo} />
            <span style={{fontFamily: fuentes.texto, fontSize: 42, color: colores.tinta}}>{f.privacidad}</span>
          </div>
        </div>

        <div style={{position: 'absolute', left: 1180, top: 300}}>
          <Puntos inicio={36} />
          {f.zonas.map((z, i) => {
            const t = progreso(frame, 90 + i * 12, 18);
            const lugar = [
              {left: -40, top: -120},
              {left: 290, top: -120},
              {left: 120, top: 400},
            ][i];
            return (
              <div
                key={z}
                style={{
                  position: 'absolute',
                  ...lugar,
                  background: colores.tarjeta,
                  border: `3px solid ${colores.verde}`,
                  borderRadius: 999,
                  padding: '10px 26px',
                  fontFamily: fuentes.texto,
                  fontWeight: 700,
                  fontSize: 40,
                  color: colores.verde,
                  whiteSpace: 'nowrap',
                  opacity: t,
                  transform: `scale(${0.6 + 0.4 * t})`,
                  boxShadow: '0 10px 24px rgba(26,35,33,.08)',
                }}
              >
                {z}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{position: 'absolute', left: 140, top: 230}}>
        {frame >= 205 ? <Comparacion inicio={210} /> : null}
      </div>
    </AbsoluteFill>
  );
};
