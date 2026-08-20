import { Mail, Phone, MapPin } from 'lucide-react'
import { useLanguage } from '@/features/language/LanguageContext'

export default function ContactPage() {
  const { t } = useLanguage()

  const items = [
    {
      icon: Mail,
      label: t('email'),
      value: 'support@kulu.et',
      href: 'mailto:support@kulu.et',
    },
    {
      icon: Phone,
      label: t('phone'),
      value: '+251 911 000 000',
      href: 'tel:+251911000000',
    },
    {
      icon: MapPin,
      label: t('contactLocation'),
      value: t('contactAddress'),
      href: null as string | null,
    },
  ]

  return (
    <div className="max-w-3xl mx-auto container-padding py-10 sm:py-14">
      <h1 className="text-3xl font-bold text-charcoal-900">{t('contactTitle')}</h1>
      <p className="mt-3 text-charcoal-600 leading-relaxed">{t('contactIntro')}</p>

      <ul className="mt-8 space-y-4">
        {items.map((item) => {
          const Icon = item.icon
          const body = (
            <div className="flex items-start gap-3 rounded-2xl border border-charcoal-100 bg-white p-4">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-charcoal-500">{item.label}</p>
                <p className="text-charcoal-900 font-medium mt-0.5">{item.value}</p>
              </div>
            </div>
          )
          return item.href ? (
            <li key={item.label}>
              <a href={item.href} className="block hover:opacity-90">
                {body}
              </a>
            </li>
          ) : (
            <li key={item.label}>{body}</li>
          )
        })}
      </ul>

      <p className="mt-8 text-sm text-charcoal-500">{t('contactHours')}</p>
    </div>
  )
}
