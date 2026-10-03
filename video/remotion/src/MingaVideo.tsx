import React from 'react';
import {AbsoluteFill, Audio, Sequence, Series, interpolate, staticFile} from 'remotion';
import './fuentes';
import {s} from './tema';
import {Fondo} from './componentes/graficos/Fondo';
import {Marcador} from './componentes/graficos/Marcador';
import {Barrido, DURACION_BARRIDO, MITAD_BARRIDO} from './componentes/transiciones/Barrido';
import {E01Apertura} from './escenas/E01Apertura';
import {E02Problema} from './escenas/E02Problema';
import {E03Cargar} from './escenas/E03Cargar';
import {E04Remito} from './escenas/E04Remito';
import {E05Reporte} from './escenas/E05Reporte';
import {E06Aceite} from './escenas/E06Aceite';
import {E07Feria} from './escenas/E07Feria';
import {E08Pedido} from './escenas/E08Pedido';
import {E09Mensaje} from './escenas/E09Mensaje';
import {E10Cierre} from './escenas/E10Cierre';

// El orden y la duración de cada escena. Suman exactamente 120 segundos.
// Tres cortes caen justo donde cambia la música:
// 0:20,1 (entra fuerte) · 1:00,0 · 1:41,1. Si cambiás la canción, revisalos.
export const escenas = [
  {nombre: 'Apertura', duracion: s(10), Componente: E01Apertura},
  {nombre: 'Problema', duracion: s(10.1), Componente: E02Problema}, // termina en 0:20,1
  {nombre: 'Cargar', duracion: s(14.9), Componente: E03Cargar},
  {nombre: 'Remito', duracion: s(15), Componente: E04Remito},
  {nombre: 'Reporte', duracion: s(10), Componente: E05Reporte}, // termina en 1:00,0
  {nombre: 'Aceite', duracion: s(10), Componente: E06Aceite},
  {nombre: 'Feria', duracion: s(15), Componente: E07Feria},
  {nombre: 'Pedido', duracion: s(16.1), Componente: E08Pedido}, // termina en 1:41,1
  {nombre: 'Mensaje', duracion: s(8.9), Componente: E09Mensaje},
  {nombre: 'Cierre', duracion: s(10), Componente: E10Cierre},
];

export const DURACION_TOTAL = escenas.reduce((a, e) => a + e.duracion, 0);

// Cuadro en que empieza cada escena.
const comienzos = escenas.reduce<number[]>((a, e, i) => [...a, i === 0 ? 0 : a[i - 1] + escenas[i - 1].duracion], []);
const desde = (nombre: string) => comienzos[escenas.findIndex((e) => e.nombre === nombre)];

export const MingaVideo: React.FC = () => {
  const secciones = [
    {nombre: 'Cargar', desde: desde('Cargar'), hasta: desde('Reporte')},
    {nombre: 'Reporte', desde: desde('Reporte'), hasta: desde('Feria')},
    {nombre: 'La Feria', desde: desde('Feria'), hasta: desde('Pedido')},
    {nombre: 'Pedido protegido', desde: desde('Pedido'), hasta: desde('Mensaje')},
  ];

  return (
    <AbsoluteFill>
      {/* Música: «Deep House Groove», hecha con Suno. Baja suave en los últimos 4 segundos. */}
      <Audio
        src={staticFile('musica/deep-house-groove.mp3')}
        volume={(f) =>
          interpolate(f, [DURACION_TOTAL - s(4), DURACION_TOTAL - 1], [1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />

      <Fondo />

      <Series>
        {escenas.map(({nombre, duracion, Componente}) => (
          <Series.Sequence key={nombre} durationInFrames={duracion} name={nombre}>
            <Componente />
          </Series.Sequence>
        ))}
      </Series>

      <Marcador secciones={secciones} desde={desde('Cargar')} hasta={desde('Mensaje')} />

      {/* un barrido en cada corte; tapa la pantalla justo en el cambio de escena */}
      {comienzos.slice(1).map((corte, i) => (
        <Sequence key={corte} from={corte - MITAD_BARRIDO} durationInFrames={DURACION_BARRIDO} name={`Barrido ${i + 1}`}>
          <Barrido haciaIzquierda={i % 2 === 1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
