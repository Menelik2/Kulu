import { useLanguage } from '@/features/language/LanguageContext'

export default function PrivacyPage() {
  const { t } = useLanguage()

  const sections = [
    { title: t('privacyS1Title'), body: t('privacyS1Body') },
    { title: t('privacyS2Title'), body: t('privacyS2Body') },
    { title: t('privacyS3Title'), body: t('privacyS3Body') },
    { title: t('privacyS4Title'), body: t('privacyS4Body') },
  ]

  return (
    <div className="max-w-3xl mx-auto container-padding py-10 sm:py-14">
      <h1 className="text-3xl font-bold text-charcoal-900">{t('privacyTitle')}</h1>
      <p className="mt-2 text-sm text-charcoal-500">{t('privacyUpdated')}</p>
      <p className="mt-4 text-charcoal-600 leading-relaxed">{t('privacyIntro')}</p>

      <div className="mt-8 space-y-6">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-semibold text-charcoal-900">{s.title}</h2>
            <p className="mt-2 text-charcoal-600 leading-relaxed text-sm sm:text-base">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
