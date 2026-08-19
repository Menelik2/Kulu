import { useEffect, useState } from 'react'
import { KULU_LOGO_SRC } from '@/lib/logoSrc'

type Phase = 'in' | 'hold' | 'out'

interface SplashScreenProps {
  onFinish: () => void
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [phase, setPhase] = useState<Phase>('in')

  useEffect(() => {
    // Hide the HTML boot splash when React splash takes over
    if (typeof window !== 'undefined' && (window as any).__hideBootSplash) {
      ;(window as any).__hideBootSplash()
    }

    const holdTimer = setTimeout(() => setPhase('hold'), 300)
    const outTimer = setTimeout(() => setPhase('out'), 1800)
    const finishTimer = setTimeout(() => onFinish(), 2400)
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
      <div className="absolute inset-0 bg-gradient-to-b from-[#e8f4ff] via-white to-[#fff4eb]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-blue-100/50 blur-3xl" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-orange-100/50 blur-3xl" />

      <div
        className={`relative z-10 flex flex-col items-center px-8 transition-all duration-700 ease-out ${
          phase === 'in'
            ? 'opacity-0 scale-90'
            : phase === 'hold'
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-105'
        }`}
      >
        <div className="relative mb-2">
          <div
            className={`absolute inset-0 rounded-full bg-blue-400/15 blur-2xl transition-opacity duration-700 ${
              phase === 'hold' ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <img
            src={KULU_LOGO_SRC}
            alt="KULU — The Whole Market In Your Pocket"
            className="relative w-52 h-52 sm:w-60 sm:h-60 object-contain drop-shadow-lg select-none"
            draggable={false}
          />
        </div>

        <div
          className={`flex items-center gap-2.5 mt-2 transition-opacity duration-500 ${
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
      </div>
    </div>
  )
}
