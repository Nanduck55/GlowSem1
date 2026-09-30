
import { useNavigate } from 'react-router-dom'
import heroBg from '../assets/landing/land bg.jpg'
import heroBgMobile from '../assets/landing/land bg mobile.jpg'

/* =========================================================
   WELCOME / FIRST-TIME ONBOARDING PAGE
   Shown once, right after a brand-new account signs up and
   then logs in for the first time (see Auth.jsx, which is
   what routes here instead of straight to /routine).
========================================================= */

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="relative w-full min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10 overflow-hidden">

      {/* Desktop background */}
      <div
        className="absolute inset-0 hidden sm:block bg-center bg-cover bg-fixed"
        style={{
          backgroundImage: `url("${heroBg}")`,
        }}
        aria-hidden="true"
      />

      {/* Mobile background */}
      <div
        className="absolute inset-0 block sm:hidden bg-center bg-cover"
        style={{
          backgroundImage: `url("${heroBgMobile}")`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-gg-200 bg-gg-100/70 p-8 text-center shadow-card sm:p-12">

        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
          Let&rsquo;s Build your Skincare Routine
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
          Add the products you use, organize your AM and PM routines, and
          let GlowGuard check your active ingredients.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/shelf', { state: { openAdd: true } })}
            className="btn-primary w-full max-w-xs sm:w-auto sm:px-8"
          >
            Add My First Product
          </button>

          <button
            type="button"
            onClick={() => navigate('/recommendations')}
            className="btn-primary w-full max-w-xs sm:w-auto sm:px-8"
          >
            See Recommendation
          </button>

          <button
            type="button"
            onClick={() => navigate('/routine')}
            className="btn-outline w-full max-w-xs sm:w-auto sm:px-8"
          >
            Skip For Now
          </button>
        </div>

      </div>
    </div>
  )
}

