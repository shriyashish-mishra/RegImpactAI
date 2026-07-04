import React from 'react'
import { AbsoluteFill, Audio, Sequence, getStaticFiles, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { CAPTIONS, TOTAL_DURATION_SECONDS } from './narration/script'
import { COLORS } from './constants'
import { sansFont, monoFont } from './fonts'
import { fadeInOut, springIn } from './animations'
import { Scene01Hero } from './scenes/Scene01Hero'
import { Scene02Problem } from './scenes/Scene02Problem'
import { Scene03StructuredDiscovery } from './scenes/Scene03StructuredDiscovery'
import { Scene04Description } from './scenes/Scene04Description'
import { Scene05Mirror } from './scenes/Scene05Mirror'
import { Scene06Discovery } from './scenes/Scene06Discovery'
import { Scene07Architecture } from './scenes/Scene07Architecture'
import { Scene08Assessment } from './scenes/Scene08Assessment'
import { Scene09ExecutiveReport } from './scenes/Scene09ExecutiveReport'
import { Scene10TechStack } from './scenes/Scene10TechStack'
import { Scene11Closing } from './scenes/Scene11Closing'

const SCENE_COMPONENTS = [
  Scene01Hero, Scene02Problem, Scene03StructuredDiscovery, Scene04Description,
  Scene05Mirror, Scene06Discovery, Scene07Architecture, Scene08Assessment,
  Scene09ExecutiveReport, Scene10TechStack, Scene11Closing,
]

// getStaticFiles() is Remotion's own browser-safe public-folder listing —
// works both in Remotion Studio and inside the render (headless Chromium)
// without needing Node's fs module, which isn't available in this
// browser-bundled context. If public/audio/background-music.mp3 doesn't
// exist yet, the video simply renders silently instead of erroring. Drop
// the file in and re-render; no code change needed. See README.md.
function audioFileIfExists(relativePath: string): string | null {
  const exists = getStaticFiles().some(f => f.name === relativePath)
  return exists ? relativePath : null
}

/**
 * No spoken narration in this cut — the story is told entirely through
 * motion, typography, and these captions (see script.ts and the creative
 * direction in remotion/README.md). Large, cinematic, one idea at a time:
 * fades in with a slight blur-to-sharp resolve and a gentle upward
 * settle, holds, then fades back out the same way — never a hard cut.
 */
function CinematicCaption({ text, durationInFrames }: { text: string; durationInFrames: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fadeInOut(frame, durationInFrames, 18, 18)
  const entrance = springIn(frame, fps, 4)
  const blur = interpolate(frame, [0, 18], [10, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const y = interpolate(entrance, [0, 1], [22, 0])
  const scale = interpolate(entrance, [0, 1], [0.97, 1])

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 110 }}>
      <div
        style={{
          opacity,
          filter: `blur(${blur}px)`,
          transform: `translateY(${y}px) scale(${scale})`,
          maxWidth: 1500,
          textAlign: 'center',
        }}
      >
        <span style={{ fontFamily: sansFont, fontSize: 52, fontWeight: 600, color: COLORS.foreground, letterSpacing: -0.5 }}>
          {text}
        </span>
      </div>
    </AbsoluteFill>
  )
}

function WatermarkLabel() {
  return (
    <div style={{ position: 'absolute', top: 40, right: 60, fontFamily: monoFont, fontSize: 16, color: COLORS.subtle, letterSpacing: 2 }}>
      REGIMPACT AI — PRODUCT DEMO
    </div>
  )
}

export function RegImpactDemo() {
  const { fps } = useVideoConfig()
  let startFrame = 0

  const backgroundMusic = audioFileIfExists('audio/background-music.mp3')
  const totalFrames = Math.round(TOTAL_DURATION_SECONDS * fps)
  const fadeFrames = fps * 3 // 3s fade in/out — smooth, never abrupt

  // Ambient bed under the whole film, never above ~0.14 — "support the
  // visuals... never feel dramatic or distracting," per the creative
  // direction. A plain number in/out ramp, not a spring — music beds
  // should be steady, not bouncy.
  const musicVolume = (frame: number) =>
    interpolate(
      frame,
      [0, fadeFrames, totalFrames - fadeFrames, totalFrames],
      [0, 0.14, 0.14, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    )

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {backgroundMusic && <Audio src={staticFile(backgroundMusic)} volume={musicVolume} />}
      <WatermarkLabel />
      {CAPTIONS.map((line, i) => {
        const SceneComponent = SCENE_COMPONENTS[i]
        const durationInFrames = Math.round(line.durationInSeconds * fps)
        const from = startFrame
        startFrame += durationInFrames

        return (
          <Sequence key={line.scene} from={from} durationInFrames={durationInFrames}>
            <SceneComponent durationInFrames={durationInFrames} />
            <CinematicCaption text={line.text} durationInFrames={durationInFrames} />
          </Sequence>
        )
      })}
    </AbsoluteFill>
  )
}
