import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useLanguage } from '@/features/language/LanguageContext'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  const { t } = useLanguage()

  const benefits = [t('aboutBenefit1'), t('aboutBenefit2'), t('aboutBenefit3')]

  return (
    <div className="max-w-3xl mx-auto container-padding py-10 sm:py-14">
      <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 leading-snug">
        {t('aboutTitle')}
      </h1>
      <p className="mt-2 text-lg text-primary-700 font-medium italic">{t('aboutTagline')}</p>

      <p className="mt-6 text-charcoal-600 leading-relaxed">{t('aboutP1')}</p>

      <div className="mt-8 rounded-2xl border border-charcoal-100 bg-white p-5 sm:p-6">
        <h2 className="font-semibold text-charcoal-900 text-lg">{t('aboutWhyTitle')}</h2>
        <ul className="mt-4 space-y-3">
          {benefits.map((item) => (
            <li key={item} className="flex items-start gap-3 text-charcoal-700">
              <span className="mt-0.5 w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                <Check className="h-3.5 w-3.5 text-primary-600" />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 rounded-2xl bg-primary-50 border border-primary-100 p-5 sm:p-6">
        <p className="font-semibold text-charcoal-900">{t('aboutOrderNow')}</p>
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-charcoal-800">
          <a href="tel:+251955214105" className="font-medium hover:text-primary-700">
            📞 0955 214 105
          </a>
          <span className="hidden sm:inline text-charcoal-400">{t('or')}</span>
          <a href="tel:+251918117828" className="font-medium hover:text-primary-700">
            📞 0918 117 828
          </a>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/shop">
          <Button className="rounded-full">{t('exploreShop')}</Button>
        </Link>
        <Link to="/contact">
          <Button variant="outline" className="rounded-full">
            {t('contact')}
          </Button>
        </Link>
      </div>
    </div>
  )
}
