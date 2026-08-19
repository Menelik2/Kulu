import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingCart, Heart, User, Menu, X, Home, Store, Languages } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { useCart } from '@/features/cart/CartContext'
import { useLanguage } from '@/features/language/LanguageContext'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { KULU_LOGO_SRC } from '@/lib/logoSrc'

export function StoreLayout() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const { t, locale, setLocale } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
      setMobileMenuOpen(false)
    }
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const bottomNavItems = [
    { to: '/', icon: Home, label: t('home'), match: '/' },
    { to: '/shop', icon: Store, label: t('shop'), match: '/shop' },
    { to: '/wishlist', icon: Heart, label: t('wishlist'), match: '/wishlist' },
    { to: '/cart', icon: ShoppingCart, label: t('cart'), match: '/cart', badge: itemCount },
    { to: user ? '/account' : '/login', icon: User, label: t('account'), match: user ? '/account' : '/login' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-charcoal-50">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-charcoal-100 shadow-sm safe-top">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex items-center justify-between h-14 md:h-16 gap-3">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img
                src={KULU_LOGO_SRC}
                alt="KULU"
                className="w-10 h-10 object-contain"
              />
              <div className="hidden sm:block">
                <span className="font-bold text-xl text-[#1e3a8a] tracking-tight">KULU</span>
              </div>
            </Link>

            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <Input
                  type="search"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 rounded-full"
                />
              </div>
            </form>

            <nav className="hidden md:flex items-center gap-1">
              <Link to="/shop">
                <Button variant="ghost" size="sm">{t('shop')}</Button>
              </Link>
              <Link to="/wishlist">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <NotificationBell />
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-medium">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={() => setLocale(locale === 'am' ? 'en' : 'am')}
                title={t('language')}
              >
                <Languages className="h-4 w-4" />
                <span className="text-xs font-medium">{locale === 'am' ? 'EN' : 'አማ'}</span>
              </Button>

              {user ? (
                <div className="relative group">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="max-w-[100px] truncate">{profile?.full_name || t('account')}</span>
                  </Button>
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-charcoal-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-1.5 z-50">
                    <Link to="/account" className="block px-4 py-2.5 text-sm hover:bg-charcoal-50">{t('myAccount')}</Link>
                    <Link to="/orders" className="block px-4 py-2.5 text-sm hover:bg-charcoal-50">{t('myOrders')}</Link>
                    <Link to="/notifications" className="block px-4 py-2.5 text-sm hover:bg-charcoal-50">{t('notifications')}</Link>
                    <Link to="/wishlist" className="block px-4 py-2.5 text-sm hover:bg-charcoal-50">{t('wishlist')}</Link>
                    {isAdmin && (
                      <Link to="/admin" className="block px-4 py-2.5 text-sm hover:bg-charcoal-50 text-primary-600 font-medium">
                        {t('adminDashboard')}
                      </Link>
                    )}
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-charcoal-50 text-red-600"
                    >
                      {t('signOut')}
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login">
                  <Button size="sm">{t('signIn')}</Button>
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-1 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setLocale(locale === 'am' ? 'en' : 'am')}
                aria-label={t('language')}
              >
                <Languages className="h-5 w-5" />
              </Button>
              <button
                className="p-2.5 rounded-full active:bg-charcoal-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
              <Input
                type="search"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full h-11 bg-charcoal-50 border-0 focus-visible:ring-primary-500"
              />
            </div>
          </form>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-charcoal-100 bg-white animate-in slide-in-from-top-2">
            <nav className="flex flex-col p-3 gap-0.5">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-charcoal-50 active:bg-charcoal-100 text-[15px]">
                {t('home')}
              </Link>
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-charcoal-50 active:bg-charcoal-100 text-[15px]">
                {t('shop')}
              </Link>
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-charcoal-50 active:bg-charcoal-100 text-[15px]">
                {t('wishlist')}
              </Link>
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-charcoal-50 active:bg-charcoal-100 text-[15px]">
                {t('cart')} ({itemCount})
              </Link>
              {user ? (
                <>
                  <Link to="/notifications" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-charcoal-50 active:bg-charcoal-100 text-[15px]">
                    {t('notifications')}
                  </Link>
                  <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-charcoal-50 active:bg-charcoal-100 text-[15px]">
                    {t('account')}
                  </Link>
                  <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-charcoal-50 active:bg-charcoal-100 text-[15px]">
                    {t('myOrders')}
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-charcoal-50 text-primary-600 font-medium text-[15px]">
                      {t('admin')}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="text-left px-4 py-3 rounded-xl hover:bg-charcoal-50 text-red-600 text-[15px]"
                  >
                    {t('signOut')}
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-charcoal-50 active:bg-charcoal-100 text-[15px]">
                  {t('signIn')}
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 pb-safe">
        <Outlet />
      </main>

      <footer className="hidden md:block bg-charcoal-900 text-charcoal-300 mt-auto">
        <div className="max-w-7xl mx-auto container-padding py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={KULU_LOGO_SRC} alt="KULU" className="w-9 h-9 object-contain brightness-0 invert" />
                <span className="font-bold text-xl text-white">KULU</span>
              </div>
              <p className="text-sm">{t('tagline')}</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">{t('shop')}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/shop" className="hover:text-white">{t('allProducts')}</Link>
                </li>
                <li>
                  <Link to="/shop?sort=newest" className="hover:text-white">{t('newArrivals')}</Link>
                </li>
                <li>
                  <Link to="/shop?sort=popular" className="hover:text-white">{t('bestSellers')}</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">{t('customer')}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/account" className="hover:text-white">{t('myAccount')}</Link>
                </li>
                <li>
                  <Link to="/orders" className="hover:text-white">{t('trackOrder')}</Link>
                </li>
                <li>
                  <Link to="/notifications" className="hover:text-white">{t('notifications')}</Link>
                </li>
                <li>
                  <Link to="/wishlist" className="hover:text-white">{t('wishlist')}</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">{t('delivery')}</h4>
              <p className="text-sm">{t('deliveryDesc')}</p>
            </div>
          </div>
          <div className="border-t border-charcoal-700 mt-8 pt-8 text-center text-sm">
            <p>
              &copy; {new Date().getFullYear()} KULU. {t('allRights')}
            </p>
          </div>
        </div>
      </footer>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-charcoal-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] safe-bottom">
        <div className="flex items-center justify-around h-16 px-1">
          {bottomNavItems.map((item) => {
            const active = isActive(item.match)
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-0 py-1 transition-colors',
                  active ? 'text-primary-600' : 'text-charcoal-400 active:text-charcoal-600'
                )}
              >
                <div
                  className={cn(
                    'relative flex items-center justify-center w-12 h-8 rounded-2xl transition-all',
                    active && 'bg-primary-50'
                  )}
                >
                  <Icon className={cn('h-[22px] w-[22px]', active && 'stroke-[2.5]')} />
                  {item.badge != null && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={cn('text-[11px] leading-tight truncate max-w-full', active && 'font-semibold')}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="md:hidden h-16 safe-bottom-spacer" />
    </div>
  )
}
