import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
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
    <div className="fixed inset-0 z-[9999] bg-[#0F0C09]">
      {/* Three.js canvas — full viewport */}
      <Canvas
        shadows
        camera={{ position: [8, 6, 8], fov: 42, near: 0.1, far: 200 }}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{ background: '#0F0C09' }}
      >
        <FacadeScene onFadeStart={handleFadeStart} onComplete={handleComplete} />
      </Canvas>

      {/* Branding overlay */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col justify-end p-10 sm:p-16"
        style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.8s ease' }}
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A08060]">
            Reclaimed façade marketplace · Sydney
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-[#F0D0A0] sm:text-5xl">
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
            <span className="rounded border border-[#C07040]/60 bg-[#1C1410] px-3 py-0.5 font-display text-xs text-[#E0B080] sm:text-sm">
              {label}
            </span>
            <div className="h-3 w-px bg-[#C07040]/30" />
          </div>
        ))}
      </div>

      {/* Skip button */}
      {!fading && (
        <button
          onClick={() => { handleFadeStart(); setTimeout(handleComplete, 1300) }}
          className="absolute bottom-10 right-10 rounded border border-[#C07040]/40 bg-[#1C1410]/80 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-[#A07040] backdrop-blur-sm transition-opacity hover:opacity-70 sm:bottom-14 sm:right-14"
        >
          Skip →
        </button>
      )}

      {/* Dark fade overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-[#0F0C09]"
        style={{ opacity: overlayOpacity }}
      />
    </div>
  )
}
