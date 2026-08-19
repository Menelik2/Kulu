import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Heart, User, Menu, X, Home, Store } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { useCart } from '@/features/cart/CartContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function StoreLayout() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
      setMobileMenuOpen(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-charcoal-50">
      <header className="sticky top-0 z-50 bg-white border-b border-charcoal-100 shadow-sm">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-xl text-primary-600 tracking-tight">KULU</span>
              </div>
            </Link>

            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </form>

            <nav className="hidden md:flex items-center gap-1">
              <Link to="/shop"><Button variant="ghost" size="sm">Shop</Button></Link>
              <Link to="/wishlist">
                <Button variant="ghost" size="icon"><Heart className="h-5 w-5" /></Button>
              </Link>
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
              {user ? (
                <div className="relative group">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="max-w-[100px] truncate">{profile?.full_name || 'Account'}</span>
                  </Button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-charcoal-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-1 z-50">
                    <Link to="/account" className="block px-4 py-2 text-sm hover:bg-charcoal-50">My Account</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-charcoal-50">My Orders</Link>
                    <Link to="/wishlist" className="block px-4 py-2 text-sm hover:bg-charcoal-50">Wishlist</Link>
                    {isAdmin && (
                      <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-charcoal-50 text-primary-600 font-medium">Admin Dashboard</Link>
                    )}
                    <button onClick={() => signOut()} className="w-full text-left px-4 py-2 text-sm hover:bg-charcoal-50 text-red-600">
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login"><Button size="sm">Sign In</Button></Link>
              )}
            </nav>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
              <Input type="search" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </form>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-charcoal-100 bg-white">
            <nav className="flex flex-col p-4 gap-1">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-charcoal-50">Home</Link>
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-charcoal-50">Shop</Link>
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-charcoal-50">Wishlist</Link>
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-charcoal-50">Cart ({itemCount})</Link>
              {user ? (
                <>
                  <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-charcoal-50">Account</Link>
                  <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-charcoal-50">Orders</Link>
                  {isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-charcoal-50 text-primary-600">Admin</Link>}
                  <button onClick={() => { signOut(); setMobileMenuOpen(false) }} className="text-left px-3 py-2 rounded-lg hover:bg-charcoal-50 text-red-600">Sign Out</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-charcoal-50">Sign In</Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="bg-charcoal-900 text-charcoal-300 mt-auto">
        <div className="max-w-7xl mx-auto container-padding py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <span className="text-white font-bold">K</span>
                </div>
                <span className="font-bold text-xl text-white">KULU</span>
              </div>
              <p className="text-sm">Shop Smart. Delivered Across Ethiopia.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/shop" className="hover:text-white">All Products</Link></li>
                <li><Link to="/shop?sort=newest" className="hover:text-white">New Arrivals</Link></li>
                <li><Link to="/shop?sort=popular" className="hover:text-white">Best Sellers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Customer</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/account" className="hover:text-white">My Account</Link></li>
                <li><Link to="/orders" className="hover:text-white">Track Order</Link></li>
                <li><Link to="/wishlist" className="hover:text-white">Wishlist</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Delivery</h4>
              <p className="text-sm">We deliver across all regions of Ethiopia. Cash on Delivery available.</p>
            </div>
          </div>
          <div className="border-t border-charcoal-700 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} KULU. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-charcoal-100 z-40">
        <div className="flex items-center justify-around h-14">
          <Link to="/" className="flex flex-col items-center gap-0.5 text-charcoal-500 hover:text-primary-600">
            <Home className="h-5 w-5" /><span className="text-[10px]">Home</span>
          </Link>
          <Link to="/shop" className="flex flex-col items-center gap-0.5 text-charcoal-500 hover:text-primary-600">
            <Store className="h-5 w-5" /><span className="text-[10px]">Shop</span>
          </Link>
          <Link to="/wishlist" className="flex flex-col items-center gap-0.5 text-charcoal-500 hover:text-primary-600">
            <Heart className="h-5 w-5" /><span className="text-[10px]">Wishlist</span>
          </Link>
          <Link to="/cart" className="flex flex-col items-center gap-0.5 text-charcoal-500 hover:text-primary-600 relative">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && <span className="absolute -top-1 right-2 h-4 w-4 rounded-full bg-primary-600 text-white text-[10px] flex items-center justify-center">{itemCount}</span>}
            <span className="text-[10px]">Cart</span>
          </Link>
          <Link to={user ? '/account' : '/login'} className="flex flex-col items-center gap-0.5 text-charcoal-500 hover:text-primary-600">
            <User className="h-5 w-5" /><span className="text-[10px]">Account</span>
          </Link>
        </div>
      </nav>
      <div className="md:hidden h-14" />
    </div>
  )
}
