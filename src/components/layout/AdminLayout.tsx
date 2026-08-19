import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, FolderTree, ShoppingBag, Users,
  Star, Warehouse, Settings, LogOut, Menu, X, ChevronLeft
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminLayout() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (to: string, end?: boolean) => {
    if (end) return location.pathname === to
    return location.pathname.startsWith(to)
  }

  return (
    <div className="min-h-screen bg-charcoal-50 flex">
      <aside className="hidden lg:flex w-64 flex-col bg-charcoal-900 text-white fixed inset-y-0">
        <div className="p-4 border-b border-charcoal-700">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="font-bold">K</span>
            </div>
            <span className="font-bold text-lg">KULU Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive(item.to, item.end)
                  ? 'bg-primary-600 text-white'
                  : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-charcoal-700">
          <div className="px-3 py-2 text-sm text-charcoal-400 truncate">
            {profile?.full_name || profile?.email}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-charcoal-300 hover:text-white hover:bg-charcoal-800"
            onClick={() => { signOut(); navigate('/') }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
          <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-charcoal-400 hover:text-white mt-1">
            <ChevronLeft className="h-4 w-4" />
            Back to Store
          </Link>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-charcoal-900 text-white h-14 flex items-center px-4 gap-3">
        <button onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-bold">KULU Admin</span>
      </div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-charcoal-900 text-white flex flex-col">
            <div className="p-4 border-b border-charcoal-700 flex items-center justify-between">
              <span className="font-bold text-lg">KULU Admin</span>
              <button onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                    isActive(item.to, item.end) ? 'bg-primary-600' : 'text-charcoal-300 hover:bg-charcoal-800'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-64">
        <div className="lg:hidden h-14" />
        <Outlet />
      </div>
    </div>
  )
}
