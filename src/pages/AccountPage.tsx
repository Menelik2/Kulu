import { Link } from 'react-router-dom'
import { Package, Heart, LayoutDashboard, User } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { useLanguage } from '@/features/language/LanguageContext'
import { Button } from '@/components/ui/button'

export default function AccountPage() {
  const { profile, isAdmin, signOut } = useAuth()
  const { t } = useLanguage()

  return (
    <div className="max-w-lg mx-auto container-padding py-8 sm:py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
          <User className="h-8 w-8 text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900">{t('myAccount')}</h1>
          <p className="text-charcoal-500 text-sm mt-0.5">{profile?.full_name || profile?.email}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Link
          to="/orders"
          className="flex items-center gap-4 bg-white rounded-2xl p-4 elevation-1 active:scale-[0.98] transition-transform"
        >
          <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
            <Package className="h-5 w-5 text-primary-600" />
          </div>
          <span className="font-medium text-charcoal-900">{t('myOrdersBtn')}</span>
        </Link>

        <Link
          to="/wishlist"
          className="flex items-center gap-4 bg-white rounded-2xl p-4 elevation-1 active:scale-[0.98] transition-transform"
        >
          <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary-600" />
          </div>
          <span className="font-medium text-charcoal-900">{t('wishlistBtn')}</span>
        </Link>

        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center gap-4 bg-white rounded-2xl p-4 elevation-1 active:scale-[0.98] transition-transform"
          >
            <div className="w-11 h-11 rounded-xl bg-gold-100 flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-gold-700" />
            </div>
            <span className="font-medium text-primary-600">{t('adminDashboard')}</span>
          </Link>
        )}
      </div>

      <Button
        variant="outline"
        className="w-full mt-8 rounded-full h-12 text-red-600 border-red-200 hover:bg-red-50"
        onClick={() => signOut()}
      >
        {t('signOut')}
      </Button>
    </div>
  )
}
