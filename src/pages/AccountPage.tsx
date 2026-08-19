import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Package,
  Heart,
  LayoutDashboard,
  User,
  Bell,
  Languages,
  Lock,
  ChevronRight,
  Save,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { useLanguage } from '@/features/language/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
})

const passwordSchema = z
  .object({
    password: z.string().min(6, 'At least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function AccountPage() {
  const { profile, user, isAdmin, signOut, updateProfile, updatePassword, loading } = useAuth()
  const { t, locale, setLocale } = useLanguage()
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [section, setSection] = useState<'menu' | 'profile' | 'password'>('menu')

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '', phone: '' },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
      })
    }
  }, [profile]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSaveProfile = async (data: ProfileForm) => {
    setSavingProfile(true)
    try {
      const { error } = await updateProfile({
        full_name: data.fullName.trim(),
        phone: data.phone?.trim() || null,
      })
      if (error) {
        toast.error(error.message || t('profileSaveFailed'))
        return
      }
      toast.success(t('profileSaved'))
      setSection('menu')
    } finally {
      setSavingProfile(false)
    }
  }

  const onSavePassword = async (data: PasswordForm) => {
    setSavingPassword(true)
    try {
      const { error } = await updatePassword(data.password)
      if (error) {
        toast.error(error.message || t('passwordChangeFailed'))
        return
      }
      toast.success(t('passwordChanged'))
      passwordForm.reset()
      setSection('menu')
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto container-padding py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-charcoal-100 rounded-2xl" />
          <div className="h-14 bg-charcoal-100 rounded-2xl" />
          <div className="h-14 bg-charcoal-100 rounded-2xl" />
        </div>
      </div>
    )
  }

  /* ── Profile edit ── */
  if (section === 'profile') {
    return (
      <div className="max-w-lg mx-auto container-padding py-8 sm:py-12">
        <button
          type="button"
          onClick={() => setSection('menu')}
          className="text-sm text-primary-600 mb-4 font-medium"
        >
          ← {t('back')}
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900 mb-6">{t('editProfile')}</h1>

        <form
          onSubmit={profileForm.handleSubmit(onSaveProfile)}
          className="bg-white rounded-2xl border border-charcoal-100 p-5 sm:p-6 space-y-4 elevation-1"
        >
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              value={profile?.email || user?.email || ''}
              disabled
              className="h-12 rounded-xl bg-charcoal-50 text-charcoal-500"
            />
            <p className="text-xs text-charcoal-400">{t('emailCannotChange')}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">{t('fullName')} *</Label>
            <Input
              id="fullName"
              className="h-12 rounded-xl"
              {...profileForm.register('fullName')}
            />
            {profileForm.formState.errors.fullName && (
              <p className="text-sm text-red-600">{profileForm.formState.errors.fullName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t('phone')}</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+251 9XX XXX XXX"
              className="h-12 rounded-xl"
              {...profileForm.register('phone')}
            />
          </div>
          <Button type="submit" className="w-full h-12 rounded-full" loading={savingProfile}>
            <Save className="h-4 w-4" />
            {t('saveChanges')}
          </Button>
        </form>
      </div>
    )
  }

  /* ── Password change ── */
  if (section === 'password') {
    return (
      <div className="max-w-lg mx-auto container-padding py-8 sm:py-12">
        <button
          type="button"
          onClick={() => setSection('menu')}
          className="text-sm text-primary-600 mb-4 font-medium"
        >
          ← {t('back')}
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900 mb-6">{t('changePassword')}</h1>

        <form
          onSubmit={passwordForm.handleSubmit(onSavePassword)}
          className="bg-white rounded-2xl border border-charcoal-100 p-5 sm:p-6 space-y-4 elevation-1"
        >
          <div className="space-y-2">
            <Label htmlFor="password">{t('newPassword')}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              className="h-12 rounded-xl"
              {...passwordForm.register('password')}
            />
            {passwordForm.formState.errors.password && (
              <p className="text-sm text-red-600">{passwordForm.formState.errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="h-12 rounded-xl"
              {...passwordForm.register('confirmPassword')}
            />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-sm text-red-600">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full h-12 rounded-full" loading={savingPassword}>
            <Lock className="h-4 w-4" />
            {t('updatePassword')}
          </Button>
        </form>
      </div>
    )
  }

  /* ── Main menu ── */
  const quickLinks = [
    { to: '/orders', icon: Package, label: t('myOrdersBtn') },
    { to: '/wishlist', icon: Heart, label: t('wishlistBtn') },
    { to: '/notifications', icon: Bell, label: t('notifications') },
    ...(isAdmin
      ? [{ to: '/admin', icon: LayoutDashboard, label: t('adminDashboard'), highlight: true }]
      : []),
  ] as const

  return (
    <div className="max-w-lg mx-auto container-padding py-8 sm:py-12">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-charcoal-100 p-5 elevation-1 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
          <User className="h-8 w-8 text-primary-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-bold text-charcoal-900 truncate">
            {profile?.full_name || t('myAccount')}
          </h1>
          <p className="text-charcoal-500 text-sm truncate">{profile?.email || user?.email}</p>
          {profile?.phone && (
            <p className="text-charcoal-400 text-xs mt-0.5">{profile.phone}</p>
          )}
        </div>
      </div>

      {/* Quick links */}
      <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wide mb-2 px-1">
        {t('quickLinks')}
      </p>
      <div className="space-y-2 mb-6">
        {quickLinks.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-4 bg-white rounded-2xl p-4 elevation-1 active:scale-[0.98] transition-transform"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  'highlight' in item && item.highlight ? 'bg-gold-100' : 'bg-primary-50'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    'highlight' in item && item.highlight ? 'text-gold-700' : 'text-primary-600'
                  }`}
                />
              </div>
              <span
                className={`font-medium flex-1 ${
                  'highlight' in item && item.highlight ? 'text-primary-600' : 'text-charcoal-900'
                }`}
              >
                {item.label}
              </span>
              <ChevronRight className="h-5 w-5 text-charcoal-300" />
            </Link>
          )
        })}
      </div>

      {/* Settings */}
      <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wide mb-2 px-1">
        {t('settings')}
      </p>
      <div className="space-y-2 mb-8">
        <button
          type="button"
          onClick={() => setSection('profile')}
          className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 elevation-1 active:scale-[0.98] transition-transform text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
            <User className="h-5 w-5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-charcoal-900">{t('editProfile')}</p>
            <p className="text-xs text-charcoal-500">{t('editProfileDesc')}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-charcoal-300" />
        </button>

        <button
          type="button"
          onClick={() => setSection('password')}
          className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 elevation-1 active:scale-[0.98] transition-transform text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
            <Lock className="h-5 w-5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-charcoal-900">{t('changePassword')}</p>
            <p className="text-xs text-charcoal-500">{t('changePasswordDesc')}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-charcoal-300" />
        </button>

        {/* Language toggle */}
        <div className="flex items-center gap-4 bg-white rounded-2xl p-4 elevation-1">
          <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
            <Languages className="h-5 w-5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-charcoal-900">{t('language')}</p>
            <p className="text-xs text-charcoal-500">{t('languageDesc')}</p>
          </div>
          <div className="flex rounded-full border border-charcoal-200 p-0.5 bg-charcoal-50">
            <button
              type="button"
              onClick={() => setLocale('am')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                locale === 'am' ? 'bg-primary-600 text-white' : 'text-charcoal-600'
              }`}
            >
              አማ
            </button>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                locale === 'en' ? 'bg-primary-600 text-white' : 'text-charcoal-600'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full rounded-full h-12 text-red-600 border-red-200 hover:bg-red-50"
        onClick={() => signOut()}
      >
        {t('signOut')}
      </Button>
    </div>
  )
}
