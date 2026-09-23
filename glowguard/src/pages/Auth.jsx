import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { loginUser, registerUser } from '../api/services'

import authBg from '../assets/log/land bg.png'
import loginImage from '../assets/log/signup-card.png'
import signupImage from '../assets/log/login-card.png'

/* =========================================================
   ICONS
========================================================= */

function ShieldIcon({ className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3 5.5 5.4v5.8c0 4.2 2.7 7.8 6.5 9.3 3.8-1.5 6.5-5.1 6.5-9.3V5.4L12 3Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9.3 12 1.8 1.8 3.8-4"
      />
    </svg>
  )
}

function LeafIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 4.5C12.2 4.1 6.5 6.4 5 11.2 3.7 15.2 6 18.5 9.5 18.5c4.7 0 7.7-4.1 7.4-8.5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.1 19.2c2.2-3.5 5.1-5.9 9.1-7.8"
      />
    </svg>
  )
}

function DropletIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.5s6 6.2 6 10.3a6 6 0 1 1-12 0C6 9.7 12 3.5 12 3.5Z"
      />
    </svg>
  )
}

function ArrowIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h13"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m13 6 6 6-6 6"
      />
    </svg>
  )
}

function LoginArrowIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 6V4.8A1.8 1.8 0 0 1 11.8 3h6.4A1.8 1.8 0 0 1 20 4.8v14.4a1.8 1.8 0 0 1-1.8 1.8h-6.4a1.8 1.8 0 0 1-1.8-1.8V18"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 12h11"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m11 7.5 4.5 4.5-4.5 4.5"
      />
    </svg>
  )
}

function EyeIcon({ off = false, className = 'h-4 w-4' }) {
  if (off) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3l18 18"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.6 6.2A10.9 10.9 0 0 1 12 6c5 0 8.5 6 8.5 6a17.1 17.1 0 0 1-3 3.7M6.3 6.8C4.2 8.1 3.5 10 3.5 10s3.5 6 8.5 6a8.5 8.5 0 0 0 2-.2"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.9 9.9a3 3 0 0 0 4.2 4.2"
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 12s3.5-6 8.5-6 8.5 6 8.5 6-3.5 6-8.5 6-8.5-6-8.5-6Z"
      />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

/* =========================================================
   DECORATIVE COMPONENTS
========================================================= */

function Sparkle({ className = '' }) {
  return (
    <span
      className={`absolute text-white/75 ${className}`}
      aria-hidden="true"
    >
      ✦
    </span>
  )
}

function BottleIllustration() {
  return (
    <div
      className="relative mb-5 h-[125px] w-[190px] max-[430px]:scale-[0.92] max-[360px]:scale-[0.84]"
      aria-hidden="true"
    >
      <div className="absolute bottom-0 left-8 h-[82px] w-[38px] rounded-[6px_6px_10px_10px] border-2 border-white/65 bg-white/15 shadow-[inset_0_0_18px_rgba(255,255,255,.1),0_10px_22px_rgba(0,0,0,.08)] backdrop-blur-[2px] before:absolute before:-top-[11px] before:left-1/2 before:h-[10px] before:w-[16px] before:-translate-x-1/2 before:rounded-[3px] before:border-2 before:border-white/65 before:bg-white/15" />

      <div className="absolute bottom-0 left-[78px] h-[64px] w-[31px] rounded-[6px_6px_10px_10px] border-2 border-white/65 bg-white/15 shadow-[inset_0_0_18px_rgba(255,255,255,.1),0_10px_22px_rgba(0,0,0,.08)] backdrop-blur-[2px] before:absolute before:-top-[11px] before:left-1/2 before:h-[8px] before:w-[13px] before:-translate-x-1/2 before:rounded-[3px] before:border-2 before:border-white/65 before:bg-white/15" />

      <div className="absolute bottom-0 left-[117px] h-[54px] w-[41px] rounded-[6px] border-2 border-white/65 bg-white/15 shadow-[inset_0_0_18px_rgba(255,255,255,.1),0_10px_22px_rgba(0,0,0,.08)] backdrop-blur-[2px] before:absolute before:-top-[11px] before:left-1/2 before:h-[8px] before:w-[17px] before:-translate-x-1/2 before:rounded-[3px] before:border-2 before:border-white/65 before:bg-white/15" />

      <Sparkle className="left-[18px] top-[7px] animate-[sparkle_2.6s_ease-in-out_infinite] text-[10px]" />
      <Sparkle className="right-[34px] top-[2px] animate-[sparkle_2.6s_ease-in-out_.5s_infinite] text-[10px]" />
      <Sparkle className="right-[7px] top-[31px] animate-[sparkle_2.6s_ease-in-out_1s_infinite] text-[10px]" />
      <Sparkle className="left-[73px] top-[17px] animate-[sparkle_2.6s_ease-in-out_.3s_infinite] text-[10px]" />

      <LeafIcon className="absolute bottom-0 left-0 h-7 w-7 -rotate-45 text-white/10" />
      <LeafIcon className="absolute right-0 top-3 h-7 w-7 rotate-[30deg] text-white/10" />
    </div>
  )
}

function FeatureIcons() {
  const icons = [LeafIcon, ShieldIcon, DropletIcon]

  return (
    <div
      className="mb-5 flex items-center justify-center gap-2.5 max-[360px]:gap-2"
      aria-hidden="true"
    >
      {icons.map((Icon, index) => (
        <div
          key={index}
          className="grid h-[42px] w-[42px] place-items-center rounded-[13px] border border-gg-400/20 bg-gradient-to-br from-[#edf7ef] to-[#dcecdf] text-gg-700 shadow-[0_8px_18px_rgba(45,90,61,.10),inset_0_1px_0_rgba(255,255,255,.85)] transition duration-200 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_11px_24px_rgba(45,90,61,.15)] max-[360px]:h-[38px] max-[360px]:w-[38px]"
        >
          <Icon className="h-[15px] w-[15px]" />
        </div>
      ))}
    </div>
  )
}

function Divider({ children }) {
  return (
    <div className="mx-auto my-3 flex w-full items-center text-[10px] uppercase tracking-[.7px] text-gray-400 max-[380px]:my-2.5">
      <span className="h-px flex-1 bg-[#dfe6e0]" />
      <span className="whitespace-nowrap px-3">
        {children}
      </span>
      <span className="h-px flex-1 bg-[#dfe6e0]" />
    </div>
  )
}

/* =========================================================
   FORM COMPONENTS
========================================================= */

const inputClass =
  'box-border h-[52px] w-full max-w-full rounded-[10px] border border-[#d6dfd7] bg-white px-4 text-[13px] text-ink outline-none transition placeholder:text-gray-400 hover:border-gg-400/60 focus:border-gg-500 focus:ring-4 focus:ring-gg-500/10 max-[430px]:h-[50px] max-[380px]:h-[48px] max-[380px]:text-[12px]'

const smallInputClass =
  'box-border h-[47px] w-full max-w-full rounded-[10px] border border-[#d6dfd7] bg-white px-4 text-xs text-ink outline-none transition placeholder:text-gray-400 hover:border-gg-400/60 focus:border-gg-500 focus:ring-4 focus:ring-gg-500/10 max-[430px]:h-[46px] max-[380px]:h-[44px] max-[380px]:text-[11px]'

function PasswordField({
  value,
  onChange,
  placeholder,
  autoComplete,
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative w-full">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={6}
        required
        className={`${inputClass} pr-12`}
      />

      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[#65816c] transition hover:bg-[#eef5ef] hover:text-gg-700 focus:outline-none focus:ring-2 focus:ring-gg-500/30 max-[380px]:right-2.5 max-[380px]:h-7 max-[380px]:w-7"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        <EyeIcon off={visible} />
      </button>
    </div>
  )
}

/* =========================================================
   AUTH PAGE
========================================================= */

export default function Auth() {
  const [mode, setMode] = useState('login')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  })

  const [busy, setBusy] = useState(false)
  const [localToast, setLocalToast] = useState(null)
  const [remember, setRemember] = useState(true)

  const toastTimer = useRef(null)

  const { user, setUser, notify } = useApp()
  const navigate = useNavigate()

  /* -------------------------------------------------------
     REDIRECT IF ALREADY LOGGED IN
  ------------------------------------------------------- */

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/users' : '/routine', {
        replace: true,
      })
    }

    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current)
      }
    }
  }, [user, navigate])

  /* -------------------------------------------------------
     TOAST
  ------------------------------------------------------- */

  const showToast = (message, success = true) => {
    setLocalToast({
      message,
      success,
    })

    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current)
    }

    toastTimer.current = window.setTimeout(() => {
      setLocalToast(null)
    }, 2800)
  }

  /* -------------------------------------------------------
     FORM HELPERS
  ------------------------------------------------------- */

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)

    setForm((current) => ({
      ...current,
      password: '',
      confirm: '',
    }))
  }

  /* -------------------------------------------------------
     SUBMIT
  ------------------------------------------------------- */

  const submit = async (event) => {
    event.preventDefault()

    if (busy) return

    const name = form.name.trim()
    const email = form.email.trim()
    const password = form.password
    const confirmPassword = form.confirm

    /* Validation */
    if (mode === 'register' && !name) {
      showToast('Please enter your name.', false)
      return
    }

    if (!email) {
      showToast('Please enter your email address.', false)
      return
    }

    if (!password) {
      showToast(
        mode === 'login'
          ? 'Please enter your password.'
          : 'Please create a password.',
        false
      )
      return
    }

    if (mode === 'register' && password.length < 6) {
      showToast(
        'Password must contain at least 6 characters.',
        false
      )
      return
    }

    if (
      mode === 'register' &&
      password !== confirmPassword
    ) {
      showToast('Passwords do not match.', false)
      return
    }

    setBusy(true)

    try {
      // `remember` decides where the session token is kept (localStorage
      // vs. sessionStorage) — see src/api/session.js. Not used to gate
      // any data loading, so it isn't "mock" state.
      const user =
        mode === 'login'
          ? await loginUser({ email, password }, remember)
          : await registerUser({ name, email, password }, remember)

      setUser(user)

      notify(
        mode === 'login'
          ? 'Signed in successfully.'
          : 'Account created successfully.'
      )

      navigate(user.role === 'admin' ? '/admin/users' : '/routine', {
        replace: true,
      })
    } catch (error) {
      showToast(
        error.response?.data?.error ||
          'Authentication failed. Check your credentials.',
        false
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans text-ink">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("${authBg}")`,
        }}
      />

      {/* =====================================================
          MAIN AUTH CONTAINER
      ===================================================== */}

      <main
        className={`relative mx-auto min-h-[650px] w-full max-w-[1080px] overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_34px_90px_rgba(20,57,34,.24),0_10px_35px_rgba(20,57,34,.10),inset_0_1px_0_rgba(255,255,255,.75)] backdrop-blur-[14px] transition-all duration-500 lg:my-[max(24px,calc((100vh-650px)/2))]
  max-lg:min-h-[100dvh]
  max-lg:h-auto
  max-lg:rounded-none
  max-lg:border-0
  max-lg:shadow-none
  max-lg:overflow-visible
  ${mode === 'register' ? 'auth-register-active' : ''}`}
      >

        {/* ===================================================
            LOGIN FORM
        =================================================== */}

        <section
          className={`absolute inset-0 box-border h-full w-1/2 transition-all duration-[600ms] [transition-timing-function:cubic-bezier(.65,0,.35,1)] max-lg:w-full max-lg:h-auto max-lg:min-h-[100dvh] ${
            mode === 'login'
              ? 'z-20 translate-x-0 opacity-100 max-lg:visible'
              : 'z-10 translate-x-full opacity-0 max-lg:invisible'
          }`}
        >
          <form
            onSubmit={submit}
            noValidate
            style={{
              backgroundImage: `
                linear-gradient(
                  135deg,
                  rgba(255,255,255,.91),
                  rgba(246,250,246,.88)
                ),
                url("${loginImage}")
              `,
            }}
            className="flex h-full w-full flex-col items-center justify-center bg-cover bg-center box-border p-[46px_68px] text-center max-lg:min-h-[100dvh] max-lg:h-auto max-lg:justify-center max-lg:overflow-y-auto max-lg:overscroll-contain max-lg:px-5 max-lg:py-6 max-lg:pb-[calc(24px+env(safe-area-inset-bottom))] max-md:px-4 max-md:py-6 max-[430px]:py-5"
          >
            <div className="mx-auto w-full max-w-[390px]">

              {/* Brand */}
              <div className="mb-6 flex flex-col items-center max-lg:mb-5 max-[430px]:mb-4">
                <div className="relative grid h-[68px] w-[68px] place-items-center rounded-[21px] bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,.26),transparent_26%),linear-gradient(145deg,#5f976c,#173b25)] text-white shadow-[0_14px_32px_rgba(35,91,55,.25),0_0_0_6px_rgba(107,158,117,.09),inset_0_1px_0_rgba(255,255,255,.24)] max-[430px]:h-[62px] max-[430px]:w-[62px] max-[380px]:h-[58px] max-[380px]:w-[58px]">
                  <ShieldIcon className="relative z-10 h-7 w-7 max-[430px]:h-6 max-[430px]:w-6" />
                  <span className="absolute inset-[7px] rounded-[15px] border border-white/30 max-[430px]:inset-[6px]" />
                </div>

                <div className="mt-3 text-2xl font-bold tracking-[-.6px] text-gg-700 max-[430px]:text-xl">
                  GlowGuard
                </div>

                <div className="mt-0.5 text-[11px] tracking-[1.1px] text-gray-500 max-[430px]:text-[10px]">
                  Skincare. Safe. Simple.
                </div>
              </div>

              {/* Heading */}
              <h1 className="text-[30px] font-bold leading-[1.18] tracking-[-.7px] text-ink max-[430px]:text-[24px] max-[380px]:text-[22px]">
                Welcome Back!
                <LeafIcon className="mb-0.5 ml-1 inline h-[17px] w-[17px] align-middle text-[#6b9e75] max-[380px]:h-4 max-[380px]:w-4" />
              </h1>

              <p className="mx-auto mb-5 mt-2.5 max-w-[330px] text-[13px] leading-[1.65] text-gray-500 max-[430px]:mb-4 max-[430px]:text-xs max-[380px]:mt-2 max-[380px]:mb-4">
                Sign in to continue your personalized skincare journey.
              </p>

              <FeatureIcons />

              {/* Login Inputs */}
              <div className="space-y-3">
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField(
                      'email',
                      event.target.value
                    )
                  }
                  placeholder="Email address"
                  autoComplete="email"
                  required
                  className={inputClass}
                />

                <PasswordField
                  value={form.password}
                  onChange={(event) =>
                    updateField(
                      'password',
                      event.target.value
                    )
                  }
                  placeholder="Password"
                  autoComplete="current-password"
                />
              </div>

              {/* Remember / Forgot */}
              <div className="my-1.5 flex w-full items-center justify-between gap-3 max-[380px]:gap-2">
                <label className="inline-flex cursor-pointer select-none items-center gap-2 rounded-lg px-1 py-1 text-[11px] text-gray-500 transition hover:bg-gg-500/5 max-[380px]:gap-1.5 max-[380px]:text-[10px]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) =>
                      setRemember(event.target.checked)
                    }
                    className="h-[15px] w-[15px] cursor-pointer accent-gg-700"
                  />

                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      'Password recovery will be available here.',
                      false
                    )
                  }
                  className="rounded-md px-1.5 py-1 text-[11px] font-semibold text-gg-700 transition hover:bg-gg-500/5 hover:text-gg-900 focus:outline-none focus:ring-2 focus:ring-gg-500/30 max-[380px]:px-1 max-[380px]:text-[10px]"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In */}
              <button
                disabled={busy}
                type="submit"
                className="mt-1 flex h-[54px] w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-br from-[#4d855b] to-[#173b25] text-xs font-bold tracking-[.8px] text-white shadow-[0_13px_28px_rgba(45,90,61,.25),inset_0_1px_0_rgba(255,255,255,.2)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(45,90,61,.30)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 max-[430px]:h-[52px] max-[380px]:h-[50px]"
              >
                {busy ? (
                  'Please wait…'
                ) : (
                  <>
                    <LoginArrowIcon className="h-4 w-4" />
                    Sign In
                  </>
                )}
              </button>

              {/* Mobile Switch */}
              <div className="mx-auto mt-5 w-full text-center text-[11px] text-gray-500 lg:hidden max-[380px]:mt-4 max-[380px]:text-[10px]">
                Don't have an account?

                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="ml-1 font-bold text-gg-700 hover:underline"
                >
                  Sign up
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* ===================================================
            REGISTER FORM
        =================================================== */}

        <section
          className={`absolute inset-0 box-border h-full w-1/2 transition-all duration-[600ms] [transition-timing-function:cubic-bezier(.65,0,.35,1)] max-lg:w-full max-lg:h-auto max-lg:min-h-[100dvh] ${
            mode === 'register'
              ? 'z-20 translate-x-full opacity-100 max-lg:translate-x-0 max-lg:visible'
              : 'z-10 translate-x-0 opacity-0 max-lg:invisible max-lg:translate-x-0'
          }`}
        >
          <form
            onSubmit={submit}
            noValidate
            style={{
              backgroundImage: `
                linear-gradient(
                  135deg,
                  rgba(255,255,255,.91),
                  rgba(246,250,246,.88)
                ),
                url("${signupImage}")
              `,
            }}
            className="flex h-full w-full box-border flex-col items-center justify-start bg-cover bg-center px-[58px] pb-5 pt-6 text-center max-lg:min-h-[100dvh] max-lg:h-auto max-lg:justify-center max-lg:overflow-y-auto max-lg:overscroll-contain max-lg:px-5 max-lg:py-6 max-lg:pb-[calc(24px+env(safe-area-inset-bottom))] max-md:px-4 max-md:py-6 max-[430px]:py-5"
          >
            <div className="mx-auto w-full max-w-[390px]">

              {/* Brand */}
              <div className="mb-3.5 flex flex-col items-center max-lg:mb-4">
                <div className="relative grid h-[52px] w-[52px] place-items-center rounded-2xl bg-gradient-to-br from-[#5f976c] to-[#173b25] text-white shadow-[0_12px_28px_rgba(45,90,61,.22)] max-[430px]:h-[48px] max-[430px]:w-[48px]">
                  <ShieldIcon className="h-5 w-5 max-[430px]:h-[18px] max-[430px]:w-[18px]" />
                  <span className="absolute inset-[6px] rounded-xl border border-white/30 max-[430px]:inset-[5px]" />
                </div>

                <div className="mt-1.5 text-[19px] font-bold text-gg-700 max-[430px]:text-[18px]">
                  GlowGuard
                </div>

                <div className="text-[10px] tracking-[1px] text-gray-500 max-[430px]:text-[9px]">
                  Skincare. Safe. Simple.
                </div>
              </div>

              {/* Heading */}
              <h1 className="text-[26px] font-bold leading-[1.15] tracking-[-.5px] text-ink max-[430px]:text-[23px] max-[380px]:text-[22px]">
                Create Account
                <LeafIcon className="mb-0.5 ml-1 inline h-4 w-4 align-middle text-[#6b9e75]" />
              </h1>

              <p className="mx-auto mb-3.5 mt-2 max-w-[330px] text-[11px] leading-[1.45] text-gray-500 max-lg:text-xs max-[430px]:mb-3 max-[380px]:mt-1.5">
                Create your account and keep your skincare journey organized.
              </p>

              <FeatureIcons />

              <Divider>
                create with email
              </Divider>

              {/* Register Inputs */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateField(
                      'name',
                      event.target.value
                    )
                  }
                  placeholder="Full name"
                  autoComplete="name"
                  required
                  className={smallInputClass}
                />

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField(
                      'email',
                      event.target.value
                    )
                  }
                  placeholder="Email address"
                  autoComplete="email"
                  required
                  className={smallInputClass}
                />

                <PasswordField
                  value={form.password}
                  onChange={(event) =>
                    updateField(
                      'password',
                      event.target.value
                    )
                  }
                  placeholder="Create a password"
                  autoComplete="new-password"
                />

                <PasswordField
                  value={form.confirm}
                  onChange={(event) =>
                    updateField(
                      'confirm',
                      event.target.value
                    )
                  }
                  placeholder="Confirm password"
                  autoComplete="new-password"
                />
              </div>

              {/* Create Account */}
              <button
                disabled={busy}
                type="submit"
                className="mt-2 flex h-[47px] w-full items-center justify-center gap-2 rounded-[13px] bg-gradient-to-br from-[#4d855b] to-[#173b25] text-[11px] font-bold tracking-[.8px] text-white shadow-[0_13px_28px_rgba(45,90,61,.25),inset_0_1px_0_rgba(255,255,255,.20)] transition hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 max-[430px]:h-[46px] max-[380px]:h-[45px]"
              >
                {busy ? (
                  'Please wait…'
                ) : (
                  <>
                    <LeafIcon className="h-3.5 w-3.5" />
                    Create Account
                  </>
                )}
              </button>

              {/* Mobile Switch */}
              <div className="mx-auto mt-4 w-full text-center text-[11px] text-gray-500 lg:hidden max-[380px]:mt-3 max-[380px]:text-[10px]">
                Already have an account?

                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="ml-1 font-bold text-gg-700 hover:underline"
                >
                  Sign in
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* ===================================================
            DESKTOP SLIDING PANEL
        =================================================== */}

        <div
          className={`absolute left-1/2 top-0 z-[100] hidden h-full w-1/2 overflow-hidden transition-transform duration-[600ms] [transition-timing-function:cubic-bezier(.65,0,.35,1)] lg:block ${
            mode === 'register'
              ? '-translate-x-full'
              : 'translate-x-0'
          }`}
        >
          <div
            style={{
              backgroundImage: `
                linear-gradient(
                  135deg,
                  rgba(15,50,28,.58),
                  rgba(45,90,61,.47)
                ),
                url("${loginImage}")
              `,
            }}
            className={`relative left-[-100%] h-full w-[200%] transform-gpu bg-cover bg-center text-white transition-transform duration-[600ms] [transition-timing-function:cubic-bezier(.65,0,.35,1)] ${
              mode === 'register'
                ? 'translate-x-1/2'
                : 'translate-x-0'
            }`}
          >

            {/* Left Panel */}
            <div
              className={`absolute left-0 top-0 flex h-full w-1/2 flex-col items-center justify-center px-[58px] text-center transition-transform duration-[600ms] [transition-timing-function:cubic-bezier(.65,0,.35,1)] ${
                mode === 'register'
                  ? 'translate-x-0'
                  : '-translate-x-[20%]'
              }`}
            >
              <BottleIllustration />

              <h2 className="text-[30px] font-bold tracking-[-.7px]">
                Welcome Back!
                <LeafIcon className="mb-0.5 ml-1 inline h-[17px] w-[17px] align-middle text-white/80" />
              </h2>

              <p className="my-3.5 mb-7 max-w-[310px] text-xs leading-[1.7] text-white/85">
                Keep your routines, products, and skincare progress organized in one simple place.
              </p>

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="inline-flex min-w-[142px] items-center justify-center gap-2 rounded-[13px] border border-white/70 bg-white/15 px-6 py-3 text-[11px] font-bold tracking-[.8px] text-white backdrop-blur-lg transition hover:-translate-y-0.5 hover:border-white hover:bg-white/25"
              >
                Sign In
                <ArrowIcon className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Right Panel */}
            <div
              className={`absolute right-0 top-0 flex h-full w-1/2 flex-col items-center justify-center px-[58px] text-center transition-transform duration-[600ms] [transition-timing-function:cubic-bezier(.65,0,.35,1)] ${
                mode === 'register'
                  ? 'translate-x-[20%]'
                  : 'translate-x-0'
              }`}
            >
              <BottleIllustration />

              <h2 className="text-[30px] font-bold tracking-[-.7px]">
                Hello, Friend!
                <LeafIcon className="mb-0.5 ml-1 inline h-[17px] w-[17px] align-middle text-white/80" />
              </h2>

              <p className="my-3.5 mb-5 max-w-[310px] text-xs leading-[1.7] text-white/85">
                Create your GlowGuard account and make your skincare routine easier to manage.
              </p>

              <ul className="mb-7 w-full max-w-[300px] space-y-3 text-left">
                {[
                  'Personalized skincare routines',
                  'Track your skincare progress',
                  'Check ingredients safely',
                  'Keep products organized',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-[11px] leading-[1.5] text-white/95"
                  >
                    <span className="grid h-[23px] w-[23px] flex-none place-items-center rounded-full bg-white/15 text-[9px]">
                      ✓
                    </span>

                    {item}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => switchMode('register')}
                className="inline-flex min-w-[142px] items-center justify-center gap-2 rounded-[13px] border border-white/70 bg-white/15 px-6 py-3 text-[11px] font-bold tracking-[.8px] text-white backdrop-blur-lg transition hover:-translate-y-0.5 hover:border-white hover:bg-white/25"
              >
                Sign Up
                <ArrowIcon className="h-3.5 w-3.5" />
              </button>

              <div className="mt-[18px] text-[10px] text-white/75">
                Already have an account?

                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="ml-1 border-b border-white/40 font-bold text-white hover:border-white"
                >
                  Sign in
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* =====================================================
          TOAST
      ===================================================== */}

      {localToast && (
        <div
          className="fixed bottom-6 left-1/2 z-[9999] flex min-h-12 max-w-[calc(100vw-32px)] -translate-x-1/2 items-center justify-center gap-2 rounded-[13px] border border-white/10 bg-[rgba(31,41,55,.94)] px-4 py-3 text-center text-[11px] text-white shadow-[0_12px_35px_rgba(0,0,0,.18)] backdrop-blur-lg max-[430px]:bottom-4 max-[430px]:max-w-[calc(100vw-24px)] max-[380px]:px-3 max-[380px]:py-2.5"
          role="status"
          aria-live="polite"
        >
          <span
            className={
              localToast.success
                ? 'text-[#9dcc9f]'
                : 'text-white/80'
            }
          >
            {localToast.success ? '✓' : 'ⓘ'}
          </span>

          <span>{localToast.message}</span>
        </div>
      )}
    </div>
  )
}