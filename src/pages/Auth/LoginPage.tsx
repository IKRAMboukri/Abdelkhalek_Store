import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Armchair, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/hooks/useLocale'
import { ApiError } from '@/services/api/client'

export default function LoginPage() {
  const { t } = useLocale()
  const { user, initializing, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  if (user && !initializing) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim() || !password) {
      setError(t('auth.fillAllFields'))
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError && err.detail
          ? err.detail
          : t('auth.loginFailed'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-600/25 mb-4">
            <Armchair size={28} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">{t('app.name')}</h1>
          <p className="text-sm text-text-muted mt-1">{t('auth.adminArea')}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-2xl border border-border shadow-sm p-6 sm:p-8"
        >
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-5">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@furniture.com"
              icon={<Mail size={16} />}
              autoComplete="username"
              disabled={submitting}
              required
            />

            <div className="relative">
              <Input
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock size={16} />}
                autoComplete="current-password"
                disabled={submitting}
                className="pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-[38px] p-1 text-gray-400 hover:text-text-primary transition-colors cursor-pointer"
                aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button type="submit" loading={submitting} className="w-full mt-6 !rounded-xl">
            {submitting ? t('auth.signingIn') : t('auth.signIn')}
          </Button>

          <p className="mt-6 text-xs text-text-muted text-center leading-relaxed">
            {t('auth.secureNote')}
          </p>
        </form>
      </div>
    </div>
  )
}
