import { Link } from 'react-router-dom'
import { useLanguage } from '@/features/language/LanguageContext'

export default function LegalPage() {
  const { t } = useLanguage()

  const sections = [
    { title: t('legalS1Title'), body: t('legalS1Body') },
    { title: t('legalS2Title'), body: t('legalS2Body') },
    { title: t('legalS3Title'), body: t('legalS3Body') },
    { title: t('legalS4Title'), body: t('legalS4Body') },
  ]

  return (
    <div className="max-w-3xl mx-auto container-padding py-10 sm:py-14">
      <h1 className="text-3xl font-bold text-charcoal-900">{t('legalTitle')}</h1>
      <p className="mt-2 text-sm text-charcoal-500">{t('legalUpdated')}</p>
      <p className="mt-4 text-charcoal-600 leading-relaxed">{t('legalIntro')}</p>

      <div className="mt-8 space-y-6">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-semibold text-charcoal-900">{s.title}</h2>
            <p className="mt-2 text-charcoal-600 leading-relaxed text-sm sm:text-base">{s.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm text-charcoal-500">
        {t('legalSeeAlso')}{' '}
        <Link to="/privacy" className="text-primary-600 hover:underline">
          {t('privacy')}
        </Link>
        {' · '}
        <Link to="/contact" className="text-primary-600 hover:underline">
          {t('contact')}
        </Link>
      </p>
    </div>
  )
}
