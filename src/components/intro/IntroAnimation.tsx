import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { FacadeScene } from './FacadeScene'

interface IntroAnimationProps {
  onComplete: () => void
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [fading, setFading] = useState(false)
  const [overlayOpacity, setOverlayOpacity] = useState(0)

  const handleFadeStart = useCallback(() => {
    setFading(true)
    // Ramp the white overlay from 0 → 1 over ~1.2s
    let start: number | null = null
    function step(ts: number) {
      if (start === null) start = ts
      const p = Math.min((ts - start) / 1200, 1)
      setOverlayOpacity(p)
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [])

  const handleComplete = useCallback(() => {
    onComplete()
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[9999] bg-[#F7F5F2]">
      {/* Three.js canvas — full viewport */}
      <Canvas
        shadows
        camera={{ position: [8, 6, 8], fov: 42, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#F7F5F2' }}
      >
        <FacadeScene onFadeStart={handleFadeStart} onComplete={handleComplete} />
      </Canvas>

      {/* Branding overlay */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col justify-end p-10 sm:p-16"
        style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.8s ease' }}
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8A8580]">
            Reclaimed façade marketplace · Sydney
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-[#2A2825] sm:text-5xl">
            ReFrame
          </h1>
        </div>
      </div>

      {/* Pathway labels — visible during explode phase */}
      <div
        className="pointer-events-none absolute inset-x-0 top-10 flex justify-around px-8 sm:top-14"
        style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.8s ease' }}
      >
        {['ReHome', 'ReUse', 'ReCycle'].map((label) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="rounded border border-[#2A2825] bg-[#2A2825] px-3 py-0.5 font-display text-xs text-[#F7F5F2] sm:text-sm">
              {label}
            </span>
            <div className="h-3 w-px bg-[#2A2825]/30" />
          </div>
        ))}
      </div>

      {/* Skip button */}
      {!fading && (
        <button
          onClick={() => { handleFadeStart(); setTimeout(handleComplete, 1300) }}
          className="absolute bottom-10 right-10 rounded border border-[#8A8580]/40 bg-[#F7F5F2]/80 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-[#8A8580] backdrop-blur-sm transition-opacity hover:opacity-70 sm:bottom-14 sm:right-14"
        >
          Skip →
        </button>
      )}

      {/* White fade overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-[#F7F5F2]"
        style={{ opacity: overlayOpacity }}
      />
    </div>
  )
}
