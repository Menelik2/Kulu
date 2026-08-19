import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Check, Package, Info, AlertCircle } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthContext'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  subscribeToNotifications,
} from '@/services/notifications'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/database'
import { toast } from 'sonner'

function typeIcon(type: string) {
  switch (type) {
    case 'order':
      return <Package className="h-4 w-4 text-primary-600" />
    case 'alert':
      return <AlertCircle className="h-4 w-4 text-amber-600" />
    default:
      return <Info className="h-4 w-4 text-charcoal-500" />
  }
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(date).toLocaleDateString()
}

export function NotificationBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: unread = 0 } = useQuery({
    queryKey: ['notifications', 'unread', user?.id],
    queryFn: () => getUnreadCount(user!.id),
    enabled: !!user,
    refetchInterval: 60_000,
  })

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', 'list', user?.id],
    queryFn: () => getNotifications(user!.id, 10),
    enabled: !!user && open,
  })

  useEffect(() => {
    if (!user) return
    return subscribeToNotifications(user.id, (n) => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      toast(n.title, { description: n.message })
    })
  }, [user, qc])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) return null

  const handleClick = async (n: Notification) => {
    if (!n.is_read) {
      await markAsRead(n.id)
      qc.invalidateQueries({ queryKey: ['notifications'] })
    }
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  const handleMarkAll = async () => {
    await markAllAsRead(user.id)
    qc.invalidateQueries({ queryKey: ['notifications'] })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-charcoal-50 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-charcoal-700" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-charcoal-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-charcoal-100">
            <h3 className="font-semibold text-charcoal-900">Notifications</h3>
            {unread > 0 && (
              <button onClick={handleMarkAll} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                <Check className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-charcoal-500 text-center py-8">No notifications yet</p>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => handleClick(n)}
                      className={cn(
                        'w-full text-left px-4 py-3 flex gap-3 hover:bg-charcoal-50 transition-colors border-b border-charcoal-50',
                        !n.is_read && 'bg-primary-50/50'
                      )}
                    >
                      <div className="mt-0.5 shrink-0">{typeIcon(n.type)}</div>
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-sm truncate', !n.is_read ? 'font-semibold text-charcoal-900' : 'text-charcoal-700')}>{n.title}</p>
                        <p className="text-xs text-charcoal-500 line-clamp-2 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-charcoal-400 mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0 mt-1.5" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-t border-charcoal-100 px-4 py-2">
            <Link to="/notifications" onClick={() => setOpen(false)} className="block text-center text-sm text-primary-600 hover:underline py-1">
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
