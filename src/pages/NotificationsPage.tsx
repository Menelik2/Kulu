import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, Trash2, Package, Info, AlertCircle } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { useLanguage } from '@/features/language/LanguageContext'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '@/services/notifications'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Notification } from '@/types/database'

function typeIcon(type: string) {
  switch (type) {
    case 'order':
      return <Package className="h-5 w-5 text-primary-600" />
    case 'alert':
      return <AlertCircle className="h-5 w-5 text-amber-600" />
    default:
      return <Info className="h-5 w-5 text-charcoal-500" />
  }
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', 'all', user?.id],
    queryFn: () => getNotifications(user!.id, 50),
    enabled: !!user,
  })

  const markRead = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAll = useMutation({
    mutationFn: () => markAllAsRead(user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      toast.success(t('allMarkedRead'))
    },
  })

  const remove = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      toast.success(t('notificationDeleted'))
    },
  })

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto container-padding py-16 text-center">
        <p className="text-charcoal-500">{t('signInToNotifications')}</p>
        <Link to="/login">
          <Button className="mt-4 rounded-full">{t('signIn')}</Button>
        </Link>
      </div>
    )
  }

  const handleClick = async (n: Notification) => {
    if (!n.is_read) await markRead.mutateAsync(n.id)
    if (n.link) navigate(n.link)
  }

  const unread = notifications.filter((n) => !n.is_read).length

  return (
    <div className="max-w-2xl mx-auto container-padding py-8">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900">{t('notifications')}</h1>
          {unread > 0 && (
            <p className="text-sm text-charcoal-500 mt-0.5">
              {t('unreadCount', { count: unread })}
            </p>
          )}
        </div>
        {unread > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full shrink-0"
            onClick={() => markAll.mutate()}
            loading={markAll.isPending}
          >
            <Check className="h-4 w-4" /> {t('markAllRead')}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-charcoal-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="h-12 w-12 mx-auto text-charcoal-300" />
          <p className="text-charcoal-500 mt-4">{t('noNotifications')}</p>
          <p className="text-sm text-charcoal-400 mt-1">{t('noNotificationsDesc')}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={cn(
                'bg-white rounded-2xl border border-charcoal-100 p-4 flex gap-3 transition-colors',
                !n.is_read && 'border-primary-200 bg-primary-50/30'
              )}
            >
              <div className="mt-0.5 shrink-0">{typeIcon(n.type)}</div>
              <button onClick={() => handleClick(n)} className="flex-1 text-left min-w-0">
                <p
                  className={cn(
                    'text-sm',
                    !n.is_read ? 'font-semibold text-charcoal-900' : 'text-charcoal-700'
                  )}
                >
                  {n.title}
                </p>
                <p className="text-sm text-charcoal-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-charcoal-400 mt-1.5">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </button>
              <div className="flex flex-col gap-1 shrink-0">
                {!n.is_read && (
                  <button
                    onClick={() => markRead.mutate(n.id)}
                    className="p-1.5 rounded-lg hover:bg-charcoal-100 text-charcoal-400 hover:text-primary-600"
                    title={t('markAllRead')}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => remove.mutate(n.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-charcoal-400 hover:text-red-600"
                  title={t('notificationDeleted')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
