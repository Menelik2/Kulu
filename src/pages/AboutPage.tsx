import { Link } from 'react-router-dom'
import { useLanguage } from '@/features/language/LanguageContext'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <div className="max-w-3xl mx-auto container-padding py-10 sm:py-14">
      <h1 className="text-3xl font-bold text-charcoal-900">{t('aboutTitle')}</h1>
      <p className="mt-4 text-charcoal-600 leading-relaxed">{t('aboutP1')}</p>
      <p className="mt-4 text-charcoal-600 leading-relaxed">{t('aboutP2')}</p>
      <p className="mt-4 text-charcoal-600 leading-relaxed">{t('aboutP3')}</p>
      <div className="mt-8">
        <Link to="/shop">
          <Button className="rounded-full">{t('exploreShop')}</Button>
        </Link>
      </div>
    </div>
  )
}
