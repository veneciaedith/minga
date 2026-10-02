import React from 'react';
import {Composition} from 'remotion';
import {MingaVideo, DURACION_TOTAL} from './MingaVideo';
import {video} from './tema';

export const Root: React.FC = () => (
  <Composition
    id="MingaVideo"
    component={MingaVideo}
    durationInFrames={DURACION_TOTAL}
    fps={video.fps}
    width={video.ancho}
    height={video.alto}
  />
);
