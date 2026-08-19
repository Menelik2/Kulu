import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/AuthContext'
import { useLanguage } from '@/features/language/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export default function RegisterPage() {
  const { signUp, signInWithGoogle } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const { error } = await signUp(data.email, data.password, data.fullName, data.phone)
      if (error) {
        toast.error(error.message || 'Registration failed')
        return
      }
      toast.success(t('createAccount'))
      navigate('/login')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onGoogle = async () => {
    setGoogleLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        toast.error(error.message || t('googleSignInFailed'))
        setGoogleLoading(false)
      }
    } catch {
      toast.error(t('googleSignInFailed'))
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center container-padding py-10 sm:py-12">
      <Card className="w-full max-w-md rounded-2xl elevation-2 border-0">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">{t('createAccount')}</CardTitle>
          <CardDescription>{t('joinKulu')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-full text-base gap-3 border-charcoal-200 hover:bg-charcoal-50"
            onClick={onGoogle}
            loading={googleLoading}
            disabled={loading}
          >
            {!googleLoading && <GoogleIcon className="h-5 w-5" />}
            {t('continueWithGoogle')}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-charcoal-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-charcoal-400">{t('orContinueWith')}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('fullName')}</Label>
              <Input
                id="fullName"
                placeholder="Abebe Kebede"
                autoComplete="name"
                className="h-12 rounded-xl"
                {...register('fullName')}
              />
              {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="h-12 rounded-xl"
                {...register('email')}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phoneOptional')}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+251 9XX XXX XXX"
                autoComplete="tel"
                className="h-12 rounded-xl"
                {...register('phone')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="h-12 rounded-xl"
                {...register('password')}
              />
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="h-12 rounded-xl"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full h-12 rounded-full text-base" loading={loading} disabled={googleLoading}>
              {t('createAccount')}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-charcoal-500">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              {t('signIn')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
