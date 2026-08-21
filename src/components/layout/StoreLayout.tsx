import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Home,
  Store,
  Languages,
  Truck,
  Shield,
  Headphones,
  MapPin,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthContext'
import { useCart } from '@/features/cart/CartContext'
import { useLanguage } from '@/features/language/LanguageContext'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { PwaInstallBanner } from '@/components/PwaInstallBanner'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { KULU_LOGO_SRC } from '@/lib/logoSrc'
import { getCategories } from '@/services/products'
import { getCategoryIcon } from '@/lib/categoryIcons'

export function StoreLayout() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const { t, locale, setLocale } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [megaOpen, setMegaOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const isHome = location.pathname === '/'

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 10,
  })

  useEffect(() => {
    setMobileMenuOpen(false)
    setMegaOpen(false)
  }, [location.pathname])

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

  const trustBadges = [
    { icon: Truck, title: t('nationwideDelivery'), desc: t('allRegions') },
    { icon: Shield, title: t('secureShopping'), desc: t('safeProtected') },
    { icon: Headphones, title: t('customerSupport'), desc: t('hereToHelp') },
    { icon: MapPin, title: t('cashOnDelivery'), desc: t('payWhenReceive') },
  ]

  const DesktopHeader = () => (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-charcoal-100 shadow-sm safe-top hidden md:block">
      {/* Top utility strip */}
      <div className="bg-charcoal-900 text-charcoal-300 text-xs">
        <div className="max-w-7xl mx-auto container-padding h-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-primary-400" />
              {t('nationwideDelivery')}
            </span>
            <span className="hidden lg:flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-gold-400" />
              {t('cashOnDelivery')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/about" className="hover:text-white transition-colors">{t('about')}</Link>
            <Link to="/contact" className="hover:text-white transition-colors">{t('contact')}</Link>
            <button
              type="button"
              onClick={() => setLocale(locale === 'am' ? 'en' : 'am')}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Languages className="h-3.5 w-3.5" />
              {locale === 'am' ? 'EN' : 'አማ'}
            </button>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex items-center justify-between h-16 lg:h-[4.25rem] gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src={KULU_LOGO_SRC}
              alt="KULU"
              className="w-11 h-11 object-contain transition-transform group-hover:scale-105"
            />
            <div className="leading-tight">
              <span className="font-bold text-xl lg:text-2xl text-[#1e3a8a] tracking-tight block">KULU</span>
              <span className="text-[10px] text-charcoal-400 font-medium tracking-wide hidden lg:block">
                {t('tagline')?.slice(0, 28) || 'Ethiopian Marketplace'}
              </span>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-2 lg:mx-6">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-charcoal-400 group-focus-within:text-primary-600 transition-colors" />
              <Input
                type="search"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-28 h-11 lg:h-12 rounded-full border-charcoal-200 bg-charcoal-50/80 focus-visible:bg-white focus-visible:ring-primary-500/30 focus-visible:border-primary-400 text-[15px] shadow-sm"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 lg:h-9 rounded-full px-5 text-sm font-semibold"
              >
                {t('search')}
              </Button>
            </div>
          </form>

          <nav className="flex items-center gap-0.5 lg:gap-1 shrink-0">
            <Link to="/shop">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'gap-1.5 font-medium',
                  isActive('/shop') && 'text-primary-600 bg-primary-50'
                )}
              >
                <Store className="h-4 w-4" />
                <span className="hidden lg:inline">{t('shop')}</span>
              </Button>
            </Link>
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative h-10 w-10">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            <NotificationBell />
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative h-10 w-10">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[1.25rem] h-5 px-1 rounded-full bg-primary-600 text-white text-[11px] flex items-center justify-center font-bold shadow-sm">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Button>
            </Link>

            <div className="w-px h-6 bg-charcoal-200 mx-1 lg:mx-2" />

            {user ? (
              <div className="relative group">
                <Button variant="ghost" size="sm" className="gap-2 h-10 pl-2 pr-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                    {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[110px] truncate text-sm font-medium hidden xl:inline">
                    {profile?.full_name || t('account')}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-charcoal-400" />
                </Button>
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-charcoal-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50 elevation-3">
                  <div className="px-4 py-2 border-b border-charcoal-100 mb-1">
                    <p className="text-sm font-semibold text-charcoal-900 truncate">
                      {profile?.full_name || t('account')}
                    </p>
                    <p className="text-xs text-charcoal-500 truncate">{user.email}</p>
                  </div>
                  <Link to="/account" className="block px-4 py-2.5 text-sm hover:bg-charcoal-50 rounded-lg mx-1">
                    {t('myAccount')}
                  </Link>
                  <Link to="/orders" className="block px-4 py-2.5 text-sm hover:bg-charcoal-50 rounded-lg mx-1">
                    {t('myOrders')}
                  </Link>
                  <Link to="/notifications" className="block px-4 py-2.5 text-sm hover:bg-charcoal-50 rounded-lg mx-1">
                    {t('notifications')}
                  </Link>
                  <Link to="/wishlist" className="block px-4 py-2.5 text-sm hover:bg-charcoal-50 rounded-lg mx-1">
                    {t('wishlist')}
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2.5 text-sm hover:bg-primary-50 text-primary-700 font-medium rounded-lg mx-1"
                    >
                      {t('adminDashboard')}
                    </Link>
                  )}
                  <div className="border-t border-charcoal-100 mt-1 pt-1">
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 rounded-lg mx-1"
                    >
                      {t('signOut')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm" className="rounded-full h-10 px-5 font-semibold shadow-sm">
                  {t('signIn')}
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Categories mega bar */}
      <div className="border-t border-charcoal-100 bg-white relative">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex items-center gap-1 h-11 overflow-x-auto scrollbar-hide">
            <button
              type="button"
              onClick={() => setMegaOpen((o) => !o)}
              className={cn(
                'flex items-center gap-1.5 px-3 h-8 rounded-full text-sm font-semibold shrink-0 transition-colors',
                megaOpen
                  ? 'bg-primary-600 text-white'
                  : 'bg-charcoal-900 text-white hover:bg-charcoal-800'
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {t('shopByCategory')}
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', megaOpen && 'rotate-180')} />
            </button>

            <div className="w-px h-5 bg-charcoal-200 mx-1 shrink-0" />

            {categories?.slice(0, 8).map((cat) => {
              const Icon = getCategoryIcon(cat.slug || cat.name)
              return (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.id}`}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-full text-sm text-charcoal-700 hover:bg-primary-50 hover:text-primary-700 whitespace-nowrap shrink-0 transition-colors font-medium"
                >
                  <Icon className="h-3.5 w-3.5 opacity-70" strokeWidth={1.75} />
                  {cat.name}
                </Link>
              )
            })}

            <Link
              to="/shop"
              className="flex items-center gap-1 px-3 h-8 rounded-full text-sm text-primary-600 hover:bg-primary-50 whitespace-nowrap shrink-0 font-semibold ml-auto"
            >
              {t('viewAll')}
            </Link>
          </div>
        </div>

        {/* Mega dropdown panel */}
        {megaOpen && categories && categories.length > 0 && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMegaOpen(false)} />
            <div className="absolute left-0 right-0 top-full z-50 bg-white border-b border-charcoal-100 shadow-xl">
              <div className="max-w-7xl mx-auto container-padding py-6">
                <div className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {categories.map((cat) => {
                    const Icon = getCategoryIcon(cat.slug || cat.name)
                    return (
                      <Link
                        key={cat.id}
                        to={`/shop?category=${cat.id}`}
                        onClick={() => setMegaOpen(false)}
                        className="group flex flex-col items-center gap-2 p-4 rounded-2xl border border-transparent hover:border-primary-200 hover:bg-primary-50/50 transition-all"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                          <Icon className="h-6 w-6 text-primary-600" strokeWidth={1.75} />
                        </div>
                        <span className="text-xs font-medium text-charcoal-800 text-center line-clamp-2 group-hover:text-primary-700">
                          {cat.name}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )

  return (
    <div className="min-h-screen flex flex-col bg-charcoal-50">
      <DesktopHeader />

      {isHome && (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-charcoal-100 shadow-sm safe-top md:hidden">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="flex items-center justify-between h-14 gap-3">
              <Link to="/" className="flex items-center gap-2 shrink-0">
                <img src={KULU_LOGO_SRC} alt="KULU" className="w-10 h-10 object-contain" />
                <span className="font-bold text-xl text-[#1e3a8a] tracking-tight sm:inline hidden">KULU</span>
              </Link>

              <div className="flex items-center gap-1">
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

            <form onSubmit={handleSearch} className="pb-3">
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
            <div className="border-t border-charcoal-100 bg-white">
              <nav className="flex flex-col p-3 gap-0.5">
                <Link to="/" className="px-4 py-3 rounded-xl hover:bg-charcoal-50 text-[15px]">{t('home')}</Link>
                <Link to="/shop" className="px-4 py-3 rounded-xl hover:bg-charcoal-50 text-[15px]">{t('shop')}</Link>
                <Link to="/wishlist" className="px-4 py-3 rounded-xl hover:bg-charcoal-50 text-[15px]">{t('wishlist')}</Link>
                <Link to="/cart" className="px-4 py-3 rounded-xl hover:bg-charcoal-50 text-[15px]">{t('cart')} ({itemCount})</Link>
                <Link to="/about" className="px-4 py-3 rounded-xl hover:bg-charcoal-50 text-[15px]">{t('about')}</Link>
                <Link to="/contact" className="px-4 py-3 rounded-xl hover:bg-charcoal-50 text-[15px]">{t('contact')}</Link>
                {user ? (
                  <>
                    <Link to="/notifications" className="px-4 py-3 rounded-xl hover:bg-charcoal-50 text-[15px]">{t('notifications')}</Link>
                    <Link to="/account" className="px-4 py-3 rounded-xl hover:bg-charcoal-50 text-[15px]">{t('account')}</Link>
                    <Link to="/orders" className="px-4 py-3 rounded-xl hover:bg-charcoal-50 text-[15px]">{t('myOrders')}</Link>
                    {isAdmin && (
                      <Link to="/admin" className="px-4 py-3 rounded-xl hover:bg-charcoal-50 text-primary-600 font-medium text-[15px]">{t('admin')}</Link>
                    )}
                    <button
                      onClick={() => signOut()}
                      className="text-left px-4 py-3 rounded-xl hover:bg-charcoal-50 text-red-600 text-[15px]"
                    >
                      {t('signOut')}
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="px-4 py-3 rounded-xl hover:bg-charcoal-50 text-[15px]">{t('signIn')}</Link>
                )}
              </nav>
            </div>
          )}
        </header>
      )}

      <main className="flex-1 pb-safe">
        <Outlet />
      </main>

      <footer className="bg-charcoal-900 text-charcoal-300 mt-auto pb-20 md:pb-0">
        <div className="border-b border-charcoal-700">
          <div className="max-w-7xl mx-auto container-padding py-6 sm:py-8 md:py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {trustBadges.map((item) => (
                <div key={item.title} className="flex items-start gap-2.5 sm:gap-3 md:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-charcoal-800 flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-xs sm:text-sm md:text-base text-white leading-snug">{item.title}</h3>
                    <p className="text-[11px] sm:text-xs md:text-sm text-charcoal-400 mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto container-padding py-8 sm:py-12 md:py-14">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
            <div className="col-span-2 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <img src={KULU_LOGO_SRC} alt="KULU" className="w-9 h-9 md:w-11 md:h-11 object-contain brightness-0 invert" />
                <span className="font-bold text-xl md:text-2xl text-white">KULU</span>
              </div>
              <p className="text-sm md:text-[15px] leading-relaxed">{t('tagline')}</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm sm:text-base">{t('shop')}</h4>
              <ul className="space-y-2 text-sm md:text-[15px]">
                <li><Link to="/shop" className="hover:text-white transition-colors">{t('allProducts')}</Link></li>
                <li><Link to="/shop?sort=newest" className="hover:text-white transition-colors">{t('newArrivals')}</Link></li>
                <li><Link to="/shop?sort=popular" className="hover:text-white transition-colors">{t('bestSellers')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm sm:text-base">{t('customer')}</h4>
              <ul className="space-y-2 text-sm md:text-[15px]">
                <li><Link to="/account" className="hover:text-white transition-colors">{t('myAccount')}</Link></li>
                <li><Link to="/orders" className="hover:text-white transition-colors">{t('trackOrder')}</Link></li>
                <li><Link to="/wishlist" className="hover:text-white transition-colors">{t('wishlist')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm sm:text-base">{t('company')}</h4>
              <ul className="space-y-2 text-sm md:text-[15px]">
                <li><Link to="/about" className="hover:text-white transition-colors">{t('about')}</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">{t('contact')}</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">{t('privacy')}</Link></li>
                <li><Link to="/legal" className="hover:text-white transition-colors">{t('legal')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-charcoal-700 mt-6 sm:mt-8 md:mt-10 pt-6 sm:pt-8 text-center text-sm space-y-3">
            <p className="text-[11px] sm:text-xs text-charcoal-400 max-w-3xl mx-auto leading-relaxed">
              {t('legalDisclaimerShort')}{' '}
              <Link to="/legal" className="text-charcoal-200 underline hover:text-white">
                {t('legalReadMore')}
              </Link>
            </p>
            <p>&copy; {new Date().getFullYear()} KULU. {t('allRights')}</p>
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

      <PwaInstallBanner />
    </div>
  )
}
