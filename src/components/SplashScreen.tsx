import { useEffect, useState } from 'react'
import { KULU_LOGO_SRC } from '@/lib/logoSrc'

type Phase = 'in' | 'hold' | 'out'

interface SplashScreenProps {
  onFinish: () => void
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [phase, setPhase] = useState<Phase>('in')

  useEffect(() => {
    // Phase timeline: in 0–600ms, hold 600–1600ms, out 1600–2200ms
    const holdTimer = setTimeout(() => setPhase('hold'), 600)
    const outTimer = setTimeout(() => setPhase('out'), 1600)
    const finishTimer = setTimeout(() => onFinish(), 2200)

    return () => {
      clearTimeout(holdTimer)
      clearTimeout(outTimer)
      clearTimeout(finishTimer)
    }
  }, [onFinish])

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ease-out ${
        phase === 'out' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden={phase === 'out'}
    >
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white to-orange-50/40" />

      <div
        className={`relative z-10 flex flex-col items-center px-6 transition-all duration-700 ease-out ${
          phase === 'in'
            ? 'opacity-0 scale-90 translate-y-4'
            : phase === 'hold'
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-105 -translate-y-2'
        }`}
      >
        {/* Logo */}
        <div className="relative mb-6">
          <img
            src={KULU_LOGO_SRC}
            alt="KULU"
            className="w-44 h-44 sm:w-52 sm:h-52 object-contain drop-shadow-md"
            draggable={false}
          />
        </div>

        {/* Loading dots */}
        <div className="flex items-center gap-2 mt-2 mb-5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-bounce"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '0.7s',
              }}
            />
          ))}
        </div>

        {/* Tagline */}
        <p className="text-sm sm:text-base text-charcoal-500 font-medium tracking-wide text-center max-w-[280px]">
          THE WHOLE MARKET IN YOUR POCKET
        </p>
        <p className="text-xs text-charcoal-400 mt-1 tracking-wider">
          THE EVERYTHING MARKETPLACE
        </p>
      </div>
    </div>
  )
}
