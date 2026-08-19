import { useEffect, useState } from 'react'
import { KULU_LOGO_SRC } from '@/lib/logoSrc'

type Phase = 'in' | 'hold' | 'out'

interface SplashScreenProps {
  onFinish: () => void
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [phase, setPhase] = useState<Phase>('in')

  useEffect(() => {
    // Android-style splash: fade/scale in → hold → fade out
    const holdTimer = setTimeout(() => setPhase('hold'), 500)
    const outTimer = setTimeout(() => setPhase('out'), 2000)
    const finishTimer = setTimeout(() => onFinish(), 2600)

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
      role="img"
      aria-label="KULU"
    >
      {/* Soft brand gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#e8f4ff] via-white to-[#fff4eb]" />

      {/* Subtle decorative circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-blue-100/40 blur-3xl" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-orange-100/40 blur-3xl" />

      <div
        className={`relative z-10 flex flex-col items-center px-8 transition-all duration-700 ease-out ${
          phase === 'in'
            ? 'opacity-0 scale-75'
            : phase === 'hold'
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-110'
        }`}
      >
        {/* Logo with soft glow */}
        <div className="relative mb-4">
          <div
            className={`absolute inset-0 rounded-full bg-blue-400/20 blur-2xl transition-opacity duration-700 ${
              phase === 'hold' ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <img
            src={KULU_LOGO_SRC}
            alt="KULU"
            className="relative w-48 h-48 sm:w-56 sm:h-56 object-contain drop-shadow-lg select-none"
            draggable={false}
          />
        </div>

        {/* Animated loading dots */}
        <div
          className={`flex items-center gap-2.5 mt-3 mb-6 transition-opacity duration-500 ${
            phase === 'hold' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-[#2563eb] animate-bounce"
              style={{
                animationDelay: `${i * 0.18}s`,
                animationDuration: '0.75s',
              }}
            />
          ))}
        </div>

        {/* Taglines from logo */}
        <p
          className={`text-sm sm:text-base text-[#1e3a5f] font-semibold tracking-wide text-center transition-all duration-700 delay-150 ${
            phase === 'hold' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          THE WHOLE MARKET IN YOUR POCKET
        </p>
        <p
          className={`text-xs text-charcoal-400 mt-1.5 tracking-wider uppercase transition-all duration-700 delay-200 ${
            phase === 'hold' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          THE EVERYTHING MARKETPLACE
        </p>
      </div>
    </div>
  )
}
