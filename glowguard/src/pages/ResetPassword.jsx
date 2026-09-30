import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
} from '../api/services'

import authBg from '../assets/log/land bg.png'
import cardImage from '../assets/log/signup-card.png'

/* =========================================================
   ICONS
========================================================= */

function Svg({ children, className = 'h-4 w-4', strokeWidth = 1.8 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const ShieldIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3 5.5 5.4v5.8c0 4.2 2.7 7.8 6.5 9.3 3.8-1.5 6.5-5.1 6.5-9.3V5.4L12 3Z" />
    <path d="m9.3 12 1.8 1.8 3.8-4" />
  </Svg>
)

const LockIcon = (p) => (
  <Svg {...p}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.2" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    <path d="M12 14.5v2" />
  </Svg>
)

const MailIcon = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.4" />
    <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
  </Svg>
)

const CheckIcon = (p) => (
  <Svg {...p} strokeWidth={2.2}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
)

const AlertIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3.5 2.8 19.5h18.4L12 3.5Z" />
    <path d="M12 10v4.2" />
    <path d="M12 17.2v.1" />
  </Svg>
)

const ArrowLeftIcon = (p) => (
  <Svg {...p} strokeWidth={2}>
    <path d="M19 12H6" />
    <path d="m11 6-6 6 6 6" />
  </Svg>
)

function EyeIcon({ off = false, className = 'h-4 w-4' }) {
  return off ? (
    <Svg className={className}>
      <path d="M3 3l18 18" />
      <path d="M10.6 6.2A9.7 9.7 0 0 1 12 6c5 0 8.5 4.2 9.5 6-.5.9-1.5 2.3-3 3.6" />
      <path d="M6.4 7.6C4.4 9 3.1 10.9 2.5 12c1 1.8 4.5 6 9.5 6 1.5 0 2.8-.4 4-.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </Svg>
  ) : (
    <Svg className={className}>
      <path d="M2.5 12C3.5 10.2 7 6 12 6s8.5 4.2 9.5 6c-1 1.8-4.5 6-9.5 6S3.5 13.8 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  )
}

/* =========================================================
   SHARED STYLES
========================================================= */

const inputClass =
  'box-border h-[52px] w-full max-w-full rounded-[10px] border border-[#d6dfd7] bg-white px-4 text-[13px] text-ink outline-none transition placeholder:text-gray-400 hover:border-gg-400/60 focus:border-gg-500 focus:ring-4 focus:ring-gg-500/10 disabled:opacity-60'

const primaryBtn =
  'mt-1 flex h-[54px] w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-br from-[#4d855b] to-[#173b25] text-xs font-bold tracking-[.8px] text-white shadow-[0_13px_28px_rgba(45,90,61,.25),inset_0_1px_0_rgba(255,255,255,.2)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(45,90,61,.30)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0'

const MIN_LENGTH = 6

/* =========================================================
   PASSWORD FIELD + STRENGTH METER
========================================================= */

function PasswordField({ value, onChange, placeholder, autoComplete, autoFocus }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative w-full">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={`${inputClass} pr-12`}
      />

      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[#65816c] transition hover:bg-[#eef5ef] hover:text-gg-700 focus:outline-none focus:ring-2 focus:ring-gg-500/30"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        <EyeIcon off={visible} />
      </button>
    </div>
  )
}

function scorePassword(pw) {
  if (!pw) return 0
  let score = 0
  if (pw.length >= MIN_LENGTH) score++
  if (pw.length >= 10) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}

const STRENGTH = [
  { label: 'Too short', bar: 'bg-red-400', text: 'text-red-500' },
  { label: 'Weak', bar: 'bg-red-400', text: 'text-red-500' },
  { label: 'Fair', bar: 'bg-amber-400', text: 'text-amber-600' },
  { label: 'Good', bar: 'bg-[#6b9e75]', text: 'text-gg-700' },
  { label: 'Strong', bar: 'bg-gg-600', text: 'text-gg-700' },
]

function StrengthMeter({ password }) {
  if (!password) return null
  const score = password.length < MIN_LENGTH ? 0 : Math.max(1, scorePassword(password))
  const info = STRENGTH[score]

  return (
    <div className="mt-2.5 text-left" aria-live="polite">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              score >= step ? info.bar : 'bg-[#e3eae4]'
            }`}
          />
        ))}
      </div>
      <p className={`mt-1.5 text-[11px] font-semibold ${info.text}`}>
        {info.label}
        {password.length < MIN_LENGTH && ` — use at least ${MIN_LENGTH} characters`}
      </p>
    </div>
  )
}

/* =========================================================
   CARD LAYOUT (icon badge + heading + body)
========================================================= */

function StatusBadge({ tone = 'green', children }) {
  const tones = {
    green:
      'bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,.26),transparent_26%),linear-gradient(145deg,#5f976c,#173b25)] shadow-[0_14px_32px_rgba(35,91,55,.25),0_0_0_6px_rgba(107,158,117,.09)]',
    red: 'bg-gradient-to-br from-[#e27d7d] to-[#b23b3b] shadow-[0_14px_32px_rgba(178,59,59,.25),0_0_0_6px_rgba(226,125,125,.12)]',
  }

  return (
    <div
      className={`relative mx-auto grid h-[68px] w-[68px] place-items-center rounded-[21px] text-white ${tones[tone]}`}
    >
      {children}
      <span className="absolute inset-[7px] rounded-[15px] border border-white/30" />
    </div>
  )
}

/* =========================================================
   PAGE
========================================================= */

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  const token = searchParams.get('token')

  // view: 'request' | 'sent' | 'checking' | 'invalid' | 'form' | 'done'
  const [view, setView] = useState(token ? 'checking' : 'request')

  const [email, setEmail] = useState(location.state?.email || '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [devLink, setDevLink] = useState('')

  const redirectTimer = useRef(null)

  /* -------------------------------------------------------
     If a token is in the URL, check it before showing the form
     so an expired/used link is caught immediately.
  ------------------------------------------------------- */
  useEffect(() => {
    if (!token) {
      setView('request')
      return undefined
    }

    let cancelled = false
    setView('checking')

    verifyResetToken(token)
      .then((data) => {
        if (cancelled) return
        setMaskedEmail(data?.email || '')
        setView('form')
      })
      .catch((err) => {
        if (cancelled) return
        setError(
          err.response?.data?.error ||
            'This reset link is invalid or has expired.'
        )
        setView('invalid')
      })

    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(
    () => () => {
      if (redirectTimer.current) window.clearTimeout(redirectTimer.current)
    },
    []
  )

  const passwordsMatch = useMemo(
    () => confirm.length > 0 && password === confirm,
    [password, confirm]
  )

  /* -------------------------------------------------------
     STEP 1 — request a reset link
  ------------------------------------------------------- */
  const submitRequest = async (event) => {
    event.preventDefault()
    if (busy) return

    const trimmed = email.trim()
    if (!trimmed || !/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError('Please enter a valid email address.')
      return
    }

    setError('')
    setBusy(true)

    try {
      const res = await requestPasswordReset(trimmed)
      // Only present when the backend runs in dev mode (no mail server on XAMPP).
      setDevLink(res?.devResetLink || '')
      setView('sent')
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Something went wrong. Please try again in a moment.'
      )
    } finally {
      setBusy(false)
    }
  }

  /* -------------------------------------------------------
     STEP 2 — choose a new password
  ------------------------------------------------------- */
  const submitNewPassword = async (event) => {
    event.preventDefault()
    if (busy) return

    if (password.length < MIN_LENGTH) {
      setError(`Password must contain at least ${MIN_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setError('')
    setBusy(true)

    try {
      await resetPassword({ token, password })
      setView('done')
      redirectTimer.current = window.setTimeout(
        () => navigate('/auth', { replace: true }),
        3500
      )
    } catch (err) {
      const message =
        err.response?.data?.error ||
        'We could not reset your password. Please try again.'

      // 410 (or 404) means the token is no longer usable — send them to the
      // "link expired" state. A 400 is just a validation message (e.g. too
      // short), so it stays on the form.
      if ([404, 410].includes(err.response?.status)) {
        setError(message)
        setView('invalid')
      } else {
        setError(message)
      }
    } finally {
      setBusy(false)
    }
  }

  const ErrorBanner = () =>
    error ? (
      <div
        role="alert"
        className="mb-3 flex items-start gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-left text-[12px] leading-[1.5] text-red-700"
      >
        <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{error}</span>
      </div>
    ) : null

  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans text-ink">
      {/* Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${authBg}")` }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 pb-[calc(32px+env(safe-area-inset-bottom))]">
        <main
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(255,255,255,.93), rgba(246,250,246,.9)), url("${cardImage}")`,
          }}
          className="w-full max-w-[460px] rounded-[28px] border border-white/70 bg-cover bg-center px-8 py-10 text-center shadow-[0_34px_90px_rgba(20,57,34,.24),0_10px_35px_rgba(20,57,34,.10),inset_0_1px_0_rgba(255,255,255,.75)] backdrop-blur-[14px] max-[430px]:px-5 max-[430px]:py-8"
        >
          {/* Brand */}
          <div className="mb-6 flex flex-col items-center">
            <div className="text-2xl font-bold tracking-[-.6px] text-gg-700">
              GlowGuard
            </div>
            <div className="mt-0.5 text-[11px] tracking-[1.1px] text-gray-500">
              Skincare. Safe. Simple.
            </div>
          </div>

          {/* ================= REQUEST LINK ================= */}
          {view === 'request' && (
            <form onSubmit={submitRequest} noValidate>
              <StatusBadge>
                <MailIcon className="relative z-10 h-7 w-7" />
              </StatusBadge>

              <h1 className="mt-5 text-[26px] font-bold leading-[1.18] tracking-[-.6px]">
                Forgot your password?
              </h1>
              <p className="mx-auto mb-5 mt-2.5 max-w-[340px] text-[13px] leading-[1.65] text-gray-500">
                Enter the email you signed up with and we'll send you a link to
                reset it.
              </p>

              <ErrorBanner />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                autoComplete="email"
                autoFocus
                className={inputClass}
              />

              <button type="submit" disabled={busy} className={`${primaryBtn} mt-3`}>
                {busy ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}

          {/* ================= LINK SENT ================= */}
          {view === 'sent' && (
            <div>
              <StatusBadge>
                <CheckIcon className="relative z-10 h-7 w-7" />
              </StatusBadge>

              <h1 className="mt-5 text-[26px] font-bold leading-[1.18] tracking-[-.6px]">
                Check your inbox
              </h1>
              <p className="mx-auto mt-2.5 max-w-[350px] text-[13px] leading-[1.65] text-gray-500">
                If an account exists for{' '}
                <span className="font-semibold text-ink">{email.trim()}</span>,
                a password reset link is on its way. The link expires in 1 hour.
              </p>
              <p className="mx-auto mb-5 mt-2 max-w-[350px] text-[12px] leading-[1.6] text-gray-400">
                Didn't get it? Check your spam folder, or try again in a minute.
              </p>

              {devLink && (
                <div className="mb-4 rounded-[12px] border border-amber-200 bg-amber-50 px-3.5 py-3 text-left text-[12px] leading-[1.55] text-amber-800">
                  <p className="font-bold">Dev mode — no email server</p>
                  <p className="mt-0.5">
                    Use this link to continue (it's hidden in production):
                  </p>
                  <a
                    href={devLink}
                    className="mt-1.5 block break-all font-semibold text-gg-700 underline"
                  >
                    Open reset link
                  </a>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setError('')
                  setView('request')
                }}
                className="mb-2 w-full rounded-[12px] border border-[#d6dfd7] bg-white py-3 text-[12px] font-semibold text-gg-700 transition hover:border-gg-400 hover:bg-[#f3f8f4]"
              >
                Use a different email
              </button>
            </div>
          )}

          {/* ================= CHECKING TOKEN ================= */}
          {view === 'checking' && (
            <div className="py-6" role="status" aria-live="polite">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px] border-gg-200 border-t-gg-600" />
              <p className="mt-4 text-[13px] text-gray-500">
                Verifying your reset link…
              </p>
            </div>
          )}

          {/* ================= INVALID / EXPIRED ================= */}
          {view === 'invalid' && (
            <div>
              <StatusBadge tone="red">
                <AlertIcon className="relative z-10 h-7 w-7" />
              </StatusBadge>

              <h1 className="mt-5 text-[26px] font-bold leading-[1.18] tracking-[-.6px]">
                Link expired
              </h1>
              <p className="mx-auto mb-5 mt-2.5 max-w-[340px] text-[13px] leading-[1.65] text-gray-500">
                {error ||
                  'This reset link is invalid or has already been used.'}{' '}
                Request a new one and we'll send it right over.
              </p>

              <Link
                to="/reset-password"
                replace
                className={primaryBtn}
              >
                Request a new link
              </Link>
            </div>
          )}

          {/* ================= NEW PASSWORD FORM ================= */}
          {view === 'form' && (
            <form onSubmit={submitNewPassword} noValidate>
              <StatusBadge>
                <LockIcon className="relative z-10 h-7 w-7" />
              </StatusBadge>

              <h1 className="mt-5 text-[26px] font-bold leading-[1.18] tracking-[-.6px]">
                Set a new password
              </h1>
              <p className="mx-auto mb-5 mt-2.5 max-w-[340px] text-[13px] leading-[1.65] text-gray-500">
                {maskedEmail ? (
                  <>
                    Choose a new password for{' '}
                    <span className="font-semibold text-ink">{maskedEmail}</span>.
                  </>
                ) : (
                  'Choose a new password for your account.'
                )}
              </p>

              <ErrorBanner />

              <div className="space-y-3">
                <div>
                  <PasswordField
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                    autoComplete="new-password"
                    autoFocus
                  />
                  <StrengthMeter password={password} />
                </div>

                <div>
                  <PasswordField
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                  {confirm && (
                    <p
                      className={`mt-1.5 text-left text-[11px] font-semibold ${
                        passwordsMatch ? 'text-gg-700' : 'text-red-500'
                      }`}
                      aria-live="polite"
                    >
                      {passwordsMatch ? '✓ Passwords match' : 'Passwords do not match yet'}
                    </p>
                  )}
                </div>
              </div>

              <button type="submit" disabled={busy} className={`${primaryBtn} mt-4`}>
                {busy ? 'Saving…' : 'Reset password'}
              </button>
            </form>
          )}

          {/* ================= DONE ================= */}
          {view === 'done' && (
            <div role="status" aria-live="polite">
              <StatusBadge>
                <CheckIcon className="relative z-10 h-7 w-7" />
              </StatusBadge>

              <h1 className="mt-5 text-[26px] font-bold leading-[1.18] tracking-[-.6px]">
                Password updated
              </h1>
              <p className="mx-auto mb-5 mt-2.5 max-w-[340px] text-[13px] leading-[1.65] text-gray-500">
                Your password has been changed. Taking you to sign in…
              </p>

              <Link to="/auth" replace className={primaryBtn}>
                Sign in now
              </Link>
            </div>
          )}

          {/* Back to sign in */}
          {view !== 'done' && view !== 'checking' && (
            <Link
              to="/auth"
              className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-gg-700 transition hover:text-gg-900 hover:underline"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          )}
        </main>
      </div>
    </div>
  )
}
