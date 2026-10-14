import { useEffect, useRef, useState } from 'react'

// Profile dropdown shared by the Admin and Beauty Consultant portals.
// Same idea as the ProfileMenu in the user Navbar:
//   avatar button -> name / email, Dark Mode switch, Log out.
//
// Props
//   user, darkMode, toggleDarkMode, onLogout  — straight from useApp()/layout
//   compact  — small avatar-only button for the phone header
//   accent   — 'green' (Admin) or 'plum' (Beauty Consultant)

// Full class strings (not built dynamically) so Tailwind can see them.
const ACCENTS = {
  green: {
    avatar: 'bg-[#008030]',
    hover: 'hover:bg-gg-50',
    switchOn: 'peer-checked:bg-gg-600',
  },
  plum: {
    avatar: 'bg-[#7d2560]',
    hover: 'hover:bg-[#f7e6f0]',
    switchOn: 'peer-checked:bg-[#9c1a6b]',
  },
}

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (!parts.length) return '?'

  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

const MoonIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
  </svg>
)

const SunIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="4" strokeWidth="2" stroke="currentColor" />
    <path
      d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
      strokeWidth="2"
      strokeLinecap="round"
      stroke="currentColor"
    />
  </svg>
)

const ChevronDown = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="m6 9 6 6 6-6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
  </svg>
)

const LogoutIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M15 4.5H7.5a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5H15"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
    <path
      d="M10 12h10.5M17.5 8.5 21 12l-3.5 3.5"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
  </svg>
)

export default function PortalProfileMenu({
  user,
  darkMode,
  toggleDarkMode,
  onLogout,
  compact = false,
  accent = 'green',
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const a = ACCENTS[accent] ?? ACCENTS.green

  useEffect(() => {
    if (!menuOpen) return

    const closeOnOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label="Account menu"
        className={
          compact
            ? `h-8 w-8 shrink-0 rounded-full ${a.avatar} text-white flex items-center justify-center text-xs font-semibold`
            : `flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 ${a.hover} transition`
        }
      >
        {compact ? (
          initials(user?.name)
        ) : (
          <>
            <span
              className={`h-10 w-10 rounded-full ${a.avatar} text-white grid place-items-center text-sm font-semibold`}
            >
              {initials(user?.name)}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
            />
          </>
        )}
      </button>

      {menuOpen && (
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
            <p className="text-sm font-bold capitalize truncate">{user?.name}</p>
            {user?.email && (
              <p className="text-xs text-muted truncate mt-0.5">{user.email}</p>
            )}
          </div>

          {/* Dark mode switch */}
          <label
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold ${a.hover} transition cursor-pointer`}
          >
            <span className="flex items-center gap-2.5 whitespace-nowrap">
              {darkMode ? (
                <MoonIcon className="w-[18px] h-[18px] shrink-0" />
              ) : (
                <SunIcon className="w-[18px] h-[18px] shrink-0" />
              )}
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
              <span
                className={`w-10 h-6 rounded-full bg-gray-300 ${a.switchOn} transition-colors duration-200`}
              />
              {/* knob */}
              <span
                style={{ backgroundColor: '#ffffff' }}
                className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full shadow transition-transform duration-200 peer-checked:translate-x-4"
              />
            </span>
          </label>

          <div className="border-t border-gg-100">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false)
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