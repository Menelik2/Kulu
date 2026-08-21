import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  AlertCircle,
  Trash2,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { useLanguage } from '@/features/language/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ETH_PHONE = /^(\+251|0)?[79]\d{8}$/

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  phone: z
    .string()
    .min(9, 'Phone is required')
    .regex(ETH_PHONE, 'Valid Ethiopian phone (+2519... or 09...)'),
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
  const { profile, user, isAdmin, signOut, updateProfile, updatePassword, deleteAccount, loading } =
    useAuth()
  const { t, locale, setLocale } = useLanguage()
  const navigate = useNavigate()
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [section, setSection] = useState<'menu' | 'profile' | 'password' | 'delete'>('menu')

  const needsPhone = !profile?.phone?.trim()
  const confirmWord = t('deleteAccountConfirmWord')
  const canDelete = deleteConfirm.trim().toUpperCase() === String(confirmWord).toUpperCase()

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

  useEffect(() => {
    if (!loading && profile && needsPhone && section === 'menu') {
      setSection('profile')
    }
  }, [loading, profile, needsPhone, section])

  // Admins must never land on the delete account screen
  useEffect(() => {
    if (isAdmin && section === 'delete') {
      setSection('menu')
      setDeleteConfirm('')
    }
  }, [isAdmin, section])

  const onSaveProfile = async (data: ProfileForm) => {
    setSavingProfile(true)
    try {
      const { error } = await updateProfile({
        full_name: data.fullName.trim(),
        phone: data.phone.trim(),
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

  const onDeleteAccount = async () => {
    if (!canDelete || isAdmin) return
    setDeleting(true)
    try {
      const { error } = await deleteAccount()
      if (error) {
        const msg = error.message || ''
        if (/admin/i.test(msg)) {
          toast.error(t('deleteAccountAdminBlocked'))
        } else {
          toast.error(msg || t('deleteAccountFailed'))
        }
        return
      }
      toast.success(t('deleteAccountSuccess'))
      navigate('/', { replace: true })
    } finally {
      setDeleting(false)
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

  if (section === 'profile') {
    return (
      <div className="max-w-lg mx-auto container-padding py-8 sm:py-12">
        {!needsPhone && (
          <button
            type="button"
            onClick={() => setSection('menu')}
            className="text-sm text-primary-600 mb-4 font-medium"
          >
            ← {t('back')}
          </button>
        )}
        <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900 mb-2">{t('editProfile')}</h1>
        {needsPhone && (
          <div className="mb-5 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>{t('phoneRequiredNotice')}</p>
          </div>
        )}

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
              <p className="text-sm text-red-600">{t('errFullName')}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t('phone')} *</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="09XXXXXXXX or +2519XXXXXXXX"
              className="h-12 rounded-xl"
              {...profileForm.register('phone')}
            />
            {profileForm.formState.errors.phone && (
              <p className="text-sm text-red-600">{t('errPhone')}</p>
            )}
          </div>
          <Button type="submit" className="w-full h-12 rounded-full" loading={savingProfile}>
            <Save className="h-4 w-4" />
            {t('saveChanges')}
          </Button>
        </form>
      </div>
    )
  }

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

  // Delete account UI — customers only (never shown for admins)
  if (section === 'delete' && !isAdmin) {
    return (
      <div className="max-w-lg mx-auto container-padding py-8 sm:py-12">
        <button
          type="button"
          onClick={() => {
            setDeleteConfirm('')
            setSection('menu')
          }}
          className="text-sm text-primary-600 mb-4 font-medium"
        >
          ← {t('back')}
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900 mb-2">{t('deleteAccountTitle')}</h1>

        <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3.5 text-sm text-red-900">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p className="leading-relaxed">{t('deleteAccountWarning')}</p>
        </div>

        <div className="bg-white rounded-2xl border border-charcoal-100 p-5 sm:p-6 space-y-4 elevation-1">
          <div className="space-y-2">
            <Label htmlFor="deleteConfirm">{t('deleteAccountConfirmHint')}</Label>
            <Input
              id="deleteConfirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={confirmWord}
              className="h-12 rounded-xl font-mono tracking-wide"
              autoComplete="off"
            />
          </div>
          <Button
            type="button"
            className="w-full h-12 rounded-full bg-red-600 hover:bg-red-700 text-white"
            disabled={!canDelete || deleting}
            loading={deleting}
            onClick={onDeleteAccount}
          >
            <Trash2 className="h-4 w-4" />
            {t('deleteAccountBtn')}
          </Button>
        </div>
      </div>
    )
  }

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
      <div className="bg-white rounded-2xl border border-charcoal-100 p-5 elevation-1 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
          <User className="h-8 w-8 text-primary-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-bold text-charcoal-900 truncate">
            {profile?.full_name || t('myAccount')}
          </h1>
          <p className="text-charcoal-500 text-sm truncate">{profile?.email || user?.email}</p>
          {profile?.phone ? (
            <p className="text-charcoal-400 text-xs mt-0.5">{profile.phone}</p>
          ) : (
            <p className="text-amber-600 text-xs mt-0.5 font-medium">{t('phoneMissing')}</p>
          )}
        </div>
      </div>

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
            <User className="h-5 w-5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-charcoal-900">{t('changePassword')}</p>
            <p className="text-xs text-charcoal-500">{t('changePasswordDesc')}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-charcoal-300" />
        </button>

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

        {!isAdmin && (
          <button
            type="button"
            onClick={() => {
              setDeleteConfirm('')
              setSection('delete')
            }}
            className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 elevation-1 active:scale-[0.98] transition-transform text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-red-600">{t('deleteAccount')}</p>
              <p className="text-xs text-charcoal-500">{t('deleteAccountDesc')}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-charcoal-300" />
          </button>
        )}
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
