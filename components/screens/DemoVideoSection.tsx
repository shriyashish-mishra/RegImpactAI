'use client'

import { useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import SectionLabel from '@/components/primitives/SectionLabel'

/**
 * Browsers block autoplay-with-sound — muted+loop is the only way this
 * plays automatically on page load. The lofi bed is there for anyone who
 * unmutes; the video and captions carry the story either way.
 */
export default function DemoVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

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
          autoPlay
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
