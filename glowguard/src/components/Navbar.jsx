import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { logoutUser } from '../api/services'

const links = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/shelf', label: 'Shelf', icon: ShelfIcon },
  { to: '/routine', label: 'Routine', icon: RoutineIcon },
  { to: '/tracker', label: 'Tracker', icon: TrackerIcon },
  { to: '/account', label: 'Account', icon: AccountIcon },
]

function HomeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3.5 10.5 12 4l8.5 6.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
      <path d="M5.5 9.5V19a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1V9.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
    </svg>
  )
}

function ShelfIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="4" width="16" height="6.5" rx="1.4" strokeWidth="2" stroke="currentColor" />
      <rect x="4" y="13.5" width="16" height="6.5" rx="1.4" strokeWidth="2" stroke="currentColor" />
    </svg>
  )
}

function RoutineIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="5" width="16" height="15" rx="2" strokeWidth="2" stroke="currentColor" />
      <path d="M4 9.5h16M8 3v3M16 3v3" strokeWidth="2" strokeLinecap="round" stroke="currentColor" />
      <path d="m8.5 14 2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
    </svg>
  )
}

function TrackerIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 19V11M12 19V5M20 19v-6" strokeWidth="2" strokeLinecap="round" stroke="currentColor" />
    </svg>
  )
}

function AccountIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="3.4" strokeWidth="2" stroke="currentColor" />
      <path d="M4.8 19.5a7.2 7.2 0 0 1 14.4 0" strokeWidth="2" strokeLinecap="round" stroke="currentColor" />
    </svg>
  )
}

function MoonIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
    </svg>
  )
}

function SunIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="4" strokeWidth="2" stroke="currentColor" />
      <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" strokeWidth="2" strokeLinecap="round" stroke="currentColor" />
    </svg>
  )
}

function SettingsIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="3" strokeWidth="2" stroke="currentColor" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2.06 2.06 0 1 1-2.92 2.92l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V19.6a2.06 2.06 0 1 1-4.12 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2.06 2.06 0 1 1-2.92-2.92l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H4.4a2.06 2.06 0 1 1 0-4.12h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2.06 2.06 0 1 1 2.92-2.92l.06.06a1.7 1.7 0 0 0 1.87.34H10.5a1.7 1.7 0 0 0 1.03-1.56V4.4a2.06 2.06 0 1 1 4.12 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2.06 2.06 0 1 1 2.92 2.92l-.06.06a1.7 1.7 0 0 0-.34 1.87V10.5a1.7 1.7 0 0 0 1.56 1.03h.09a2.06 2.06 0 1 1 0 4.12h-.09a1.7 1.7 0 0 0-1.56 1.03Z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
    </svg>
  )
}

function LogoutIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M15 4.5H7.5a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
      <path d="M10 12h10.5M17.5 8.5 21 12l-3.5 3.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
    </svg>
  )
}

function ProfileMenu({ user, darkMode, toggleDarkMode, onLogout }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return

    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const initial = user.name?.trim()?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="w-10 h-10 rounded-full bg-gg-100 text-gg-700 font-extrabold grid place-items-center text-sm border-2 border-gg-700/20 hover:border-gg-700/40 transition"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="
            absolute right-0 mt-2 w-72
            rounded-2xl overflow-hidden
            bg-white text-ink
            border border-gg-100
            shadow-[0_12px_32px_rgba(0,0,0,0.18)]
            z-[60]
          "
        >
          <div className="px-4 py-3 border-b border-gg-100">
            <p className="text-sm font-bold capitalize truncate">{user.name}</p>
            {user.email && (
              <p className="text-xs text-muted truncate mt-0.5">{user.email}</p>
            )}
          </div>

          <label
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold hover:bg-gg-50 transition cursor-pointer"
          >
            <span className="flex items-center gap-2.5 whitespace-nowrap">
              {darkMode ? <MoonIcon className="w-[18px] h-[18px] shrink-0" /> : <SunIcon className="w-[18px] h-[18px] shrink-0" />}
              Dark Mode
            </span>

            <span className="relative inline-flex items-center shrink-0">
              <input
                type="checkbox"
                role="switch"
                checked={darkMode}
                onChange={toggleDarkMode}
                className="peer sr-only"
              />
              {/* track */}
              <span className="w-10 h-6 rounded-full bg-gray-300 peer-checked:bg-gg-600 transition-colors duration-200" />
              {/* knob */}
              <span
                style={{ backgroundColor: '#ffffff' }}
                className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full shadow transition-transform duration-200 peer-checked:translate-x-4"
              />
            </span>
          </label>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              navigate('/account')
            }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold hover:bg-gg-50 transition"
          >
            <SettingsIcon className="w-[18px] h-[18px] shrink-0" />
            Settings
          </button>

          <div className="border-t border-gg-100">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onLogout()
              }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
            >
              <LogoutIcon className="w-[18px] h-[18px] shrink-0" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const { user, setUser, darkMode, toggleDarkMode } = useApp()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logoutUser()
    setUser(null)
    navigate('/auth')
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-gg-900/95 backdrop-blur border-b border-gg-800 shadow-md">
       <div className="
  w-full
  max-w-[1400px]
  mx-auto
  h-16
  px-4
  sm:px-6
  lg:px-8
  xl:px-10
  flex
  items-center
  justify-between
">
          <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-xl">
            <span className="w-8 h-8 grid place-items-center rounded-lg bg-gg-100 text-gg-700 text-base">✦</span>
            GlowGuard
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to}
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm font-semibold rounded-lg transition
                   ${isActive ? 'text-gg-300 bg-gg-800' : 'text-gg-200/80 hover:text-white hover:bg-gg-800/70'}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <ProfileMenu
                user={user}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                onLogout={handleLogout}
              />
            ) : (
              <Link to="/auth" className="btn-primary !py-1.5 !px-4 !text-xs">Sign in</Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile nav — floating rounded bar pinned to the bottom of the screen */}
      <nav
        className="
          md:hidden fixed inset-x-0 bottom-0 z-50
          pb-[max(env(safe-area-inset-bottom),0px)]
        "
      >
        <div
          className="
            mx-3 mb-3
            flex items-center justify-between gap-1
            rounded-full
            bg-gg-900/95 backdrop-blur
            border border-gg-800
            shadow-[0_8px_24px_rgba(0,0,0,0.25)]
            px-2 py-2
          "
        >
          {links.map((l) => {
            const Icon = l.icon

            return (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center gap-0.5
                   py-1.5 rounded-full text-[10px] font-semibold transition
                   ${isActive
                     ? 'text-gg-900 bg-gg-300'
                     : 'text-gg-200/80'}`
                }
              >
                <Icon className="w-5 h-5" />
                {l.label}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </>
  )
}
