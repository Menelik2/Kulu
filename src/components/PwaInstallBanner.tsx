import { Download, Share, MoreVertical, X } from 'lucide-react'
import { usePwaInstall } from '@/hooks/usePwaInstall'
import { useLanguage } from '@/features/language/LanguageContext'
import { Button } from '@/components/ui/button'
import { KULU_LOGO_SRC } from '@/lib/logoSrc'

export function PwaInstallBanner() {
  const { showBanner, mode, canNativeInstall, installing, promptInstall, dismiss } = usePwaInstall()
  const { t } = useLanguage()

  if (!showBanner) return null

  return (
    <div
      className="fixed left-3 right-3 z-[60] md:left-auto md:right-4 md:w-[380px] bottom-[4.75rem] md:bottom-6 safe-bottom"
      role="dialog"
      aria-label={t('installApp')}
    >
      <div className="rounded-2xl border border-charcoal-100 bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-3.5 sm:p-4">
        <div className="flex items-start gap-3">
          <img
            src={KULU_LOGO_SRC}
            alt=""
            className="w-12 h-12 rounded-xl object-contain shrink-0 bg-charcoal-50"
            draggable={false}
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-charcoal-900 leading-snug">{t('installApp')}</p>
            <p className="text-xs text-charcoal-500 mt-0.5 leading-snug">
              {mode === 'ios'
                ? t('installIosHint')
                : mode === 'manual'
                  ? t('installManualHint')
                  : t('installAppDesc')}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="p-1.5 rounded-full text-charcoal-400 hover:bg-charcoal-50 hover:text-charcoal-600 shrink-0"
            aria-label={t('dismiss')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {mode === 'ios' ? (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-charcoal-50 px-3 py-2.5 text-xs text-charcoal-600">
            <Share className="h-4 w-4 shrink-0 text-primary-600" />
            <span>{t('installIosSteps')}</span>
          </div>
        ) : mode === 'manual' || !canNativeInstall ? (
          <div className="mt-3 space-y-2">
            <div className="flex items-start gap-2 rounded-xl bg-charcoal-50 px-3 py-2.5 text-xs text-charcoal-600">
              <MoreVertical className="h-4 w-4 shrink-0 text-primary-600 mt-0.5" />
              <span>{t('installManualSteps')}</span>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" className="flex-1 h-10 rounded-xl" onClick={dismiss}>
                {t('notNow')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              className="flex-1 gap-2 h-10 rounded-xl"
              onClick={() => promptInstall()}
              disabled={installing}
            >
              <Download className="h-4 w-4" />
              {installing ? t('installing') : t('installAppBtn')}
            </Button>
            <Button type="button" variant="ghost" className="h-10 rounded-xl px-3" onClick={dismiss}>
              {t('notNow')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
