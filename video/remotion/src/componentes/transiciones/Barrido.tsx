import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {progreso, entradaSuave, salidaSuave} from '../../animacion';
import {colores, video} from '../../tema';

// Duración total del barrido y cuadro en el que tapa toda la pantalla.
export const DURACION_BARRIDO = 26;
export const MITAD_BARRIDO = 13;

type Props = {haciaIzquierda?: boolean};

// Barrido de franjas inclinadas, como el pase entre bloques de una transmisión.
// En la mitad tapa todo con un bloque claro: ahí se hace el corte de escena.
// No titila: es un solo movimiento de punta a punta.
export const Barrido: React.FC<Props> = ({haciaIzquierda = false}) => {
  const frame = useCurrentFrame();
  const franjas = [
    {c: colores.verde, w: 150},
    {c: colores.ocre, w: 80},
    {c: colores.terracota, w: 40},
  ];
  const anchoFranjas = franjas.reduce((a, f) => a + f.w, 0);
  const anchoBloque = 2700;
  const anchoTotal = anchoFranjas * 2 + anchoBloque;

  const inicioX = -anchoTotal - 450;
  const tapadoX = video.ancho / 2 - anchoFranjas - anchoBloque / 2;
  const finX = video.ancho + 450;

  const entra = progreso(frame, 0, MITAD_BARRIDO - 2, salidaSuave);
  const sale = progreso(frame, MITAD_BARRIDO + 2, DURACION_BARRIDO - MITAD_BARRIDO - 2, entradaSuave);
  let x = frame < MITAD_BARRIDO ? inicioX + (tapadoX - inicioX) * entra : tapadoX + (finX - tapadoX) * sale;
  if (haciaIzquierda) x = video.ancho - x - anchoTotal;

  const fila = haciaIzquierda ? [...franjas] : [...franjas].reverse();
  const filaFinal = haciaIzquierda ? [...franjas].reverse() : [...franjas];

  return (
    <AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: -60,
          height: video.alto + 120,
          left: x,
          display: 'flex',
          transform: 'skewX(-20deg)',
        }}
      >
        {fila.map((f, i) => (
          <div key={`a${i}`} style={{width: f.w, background: f.c}} />
        ))}
        <div style={{width: anchoBloque, background: colores.papel2}} />
        {filaFinal.map((f, i) => (
          <div key={`b${i}`} style={{width: f.w, background: f.c}} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
