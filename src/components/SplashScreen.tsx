import { useEffect, useState } from 'react'
import { KULU_LOGO_SRC } from '@/lib/logoSrc'

interface SplashScreenProps {
  onFinish: () => void
  minDuration?: number
}

export function SplashScreen({ onFinish, minDuration = 2200 }: SplashScreenProps) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400)
    const t2 = setTimeout(() => setPhase('out'), minDuration - 500)
    const t3 = setTimeout(() => onFinish(), minDuration)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onFinish, minDuration])

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
        phase === 'out' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden={phase === 'out'}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary-100/60 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-orange-100/50 rounded-full blur-3xl" />
      </div>

      <div
        className={`relative flex flex-col items-center transition-all duration-700 ease-out ${
          phase === 'in' ? 'opacity-0 scale-90 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
        }`}
      >
        <img
          src={KULU_LOGO_SRC}
          alt="KULU"
          className="w-44 h-44 sm:w-52 sm:h-52 object-contain drop-shadow-md"
          draggable={false}
        />

        <div className="flex gap-1.5 mt-8">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-primary-500 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>

      <p
        className={`absolute bottom-12 text-xs text-charcoal-400 tracking-wide transition-opacity duration-500 ${
          phase === 'in' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        THE WHOLE MARKET IN YOUR POCKET
      </p>
    </div>
  )
}
