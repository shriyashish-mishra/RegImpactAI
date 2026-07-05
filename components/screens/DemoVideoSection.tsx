'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import SectionLabel from '@/components/primitives/SectionLabel'

/**
 * Browsers block autoplay-with-sound — muted+loop is the only way this
 * plays automatically on page load. The lofi bed is there for anyone who
 * unmutes; the video and captions carry the story either way.
 *
 * Playback is started from a post-mount effect rather than the native
 * `autoPlay` attribute, and `preload="none"` keeps the browser from
 * buffering the 22MB file until after that first paint — `autoPlay` was
 * measured to stall the entire hero's initial render (header, byline, even
 * sibling sections) waiting on video decode. Explicit width/height give the
 * browser the real aspect ratio immediately, so there's no layout jump
 * whether or not the video has loaded yet.
 */
export default function DemoVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    videoRef.current?.play().catch(() => {})
  }, [])

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  return (
    <section className="flex flex-col gap-5">
      <SectionLabel index={1} label="What Is RegImpact?" />
      <p className="text-sm text-muted max-w-2xl leading-relaxed">
        A 60-second walkthrough of the product — from a plain-language description to a
        citation-backed compliance report.
      </p>
      <div className="relative rounded-xl overflow-hidden border border-border bg-surface group">
        <video
          ref={videoRef}
          src="/video/regimpact-demo.mp4"
          poster="/video/regimpact-demo-poster.png"
          width={1920}
          height={1080}
          preload="none"
          muted
          loop
          playsInline
          className="w-full h-auto block"
        />
        <button
          onClick={toggleMute}
          aria-label={muted ? 'Unmute demo video' : 'Mute demo video'}
          className="absolute bottom-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-background/80 border border-border text-foreground opacity-80 hover:opacity-100 transition-opacity"
        >
          {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
        </button>
      </div>
    </section>
  )
}
