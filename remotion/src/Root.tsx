import React from 'react'
import { Composition } from 'remotion'
import { RegImpactDemo } from './Composition'
import { TOTAL_DURATION_SECONDS } from './narration/script'
import { FPS, WIDTH, HEIGHT } from './constants'

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="RegImpactDemo"
      component={RegImpactDemo}
      durationInFrames={Math.round(TOTAL_DURATION_SECONDS * FPS)}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  )
}
