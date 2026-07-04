import { ImageResponse } from 'next/og'

export const alt = 'RegImpact AI — AI-powered Regulatory Impact Assessment for Indian fintech'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#09090b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, backgroundColor: '#34d399', display: 'flex' }} />
          <div style={{ fontSize: 30, fontWeight: 600, color: '#fafafa', letterSpacing: '-0.02em', display: 'flex' }}>
            RegImpact AI
          </div>
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 700,
            color: '#fafafa',
            marginTop: 36,
            letterSpacing: '-0.02em',
            display: 'flex',
            lineHeight: 1.1,
          }}
        >
          Regulatory Impact Assessment
        </div>
        <div style={{ fontSize: 28, color: '#a1a1aa', marginTop: 24, display: 'flex' }}>
          AI-powered · Citation-backed · Built for Indian fintech
        </div>
      </div>
    ),
    { ...size }
  )
}
