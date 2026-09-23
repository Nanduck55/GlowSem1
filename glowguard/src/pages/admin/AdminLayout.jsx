import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { logoutUser } from '../../api/services'

const ShieldIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true" {...props}>
    <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm0 5a2.6 2.6 0 1 1 0 5.2A2.6 2.6 0 0 1 12 7Zm0 11.2c-2 0-3.8-1-4.8-2.5.03-1.6 3.2-2.4 4.8-2.4s4.77.8 4.8 2.4c-1 1.5-2.8 2.5-4.8 2.5Z" />
  </svg>
)

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
    <path d="M4 3h9v2H6v14h7v2H4V3Zm12.6 4.4L21.2 12l-4.6 4.6-1.4-1.4L17.4 13H9v-2h8.4l-2.2-2.2 1.4-1.4Z" />
  </svg>
)

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px] shrink-0" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const RulesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px] shrink-0" aria-hidden="true">
    <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const navItems = [
  { to: '/admin/users', label: 'User Management', Icon: UsersIcon },
  { to: '/admin/rules', label: 'Safety Clash Rules', Icon: RulesIcon },
]

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

export default function AdminLayout() {
  const { user, setUser } = useApp()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const logout = async () => {
    await logoutUser()
    setUser(null)
    navigate('/auth', { replace: true })
  }

  const goTo = (to) => {
    setOpen(false)
    navigate(to)
  }

  return (
    <div className="gg-admin min-h-screen bg-white text-black">
      {/* Poppins is used by the design; falls back to the system font if offline. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .gg-admin { font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif; }
      `}</style>

      <div className="md:flex">
        {/* ---------------- Sidebar ---------------- */}
        {/* Desktop/tablet: a normal static column. Phones: an off-canvas drawer
            triggered by the header's menu button, closed by default. */}
        <aside
          className={`bg-[#17502f] text-white flex flex-col
            fixed inset-y-0 left-0 z-40 w-[78%] max-w-[280px] shadow-2xl
            transition-transform duration-200 ease-out
            ${open ? 'translate-x-0' : '-translate-x-full'}
            md:static md:z-auto md:w-[230px] lg:w-[250px] md:max-w-none md:shrink-0
            md:h-screen md:sticky md:top-0 md:translate-x-0 md:shadow-none`}
        >
          <div className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-6 pb-6 md:pt-8 md:pb-10">
            <p className="text-xl sm:text-2xl font-semibold leading-tight">
              GlowGuard<br />Admin
            </p>
            {/* Close button — phones only */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="md:hidden h-9 w-9 shrink-0 rounded-lg bg-white/15 flex items-center justify-center hover:bg-white/25 transition"
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="px-3 md:px-6 flex flex-col gap-1.5 md:gap-3">
            {navItems.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 md:py-2 rounded-lg text-sm md:text-lg font-medium transition
                   ${isActive ? 'bg-white/20 md:bg-white/15' : 'hover:bg-white/10'}`
                }
              >
                <Icon />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto bg-[#008030] rounded-tr-3xl px-5 py-5 space-y-3 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <ShieldIcon />
              <span className="truncate">Admin: {user?.name}</span>
            </p>
            <button type="button" onClick={logout} className="flex items-center gap-2 text-xs font-medium hover:underline">
              <LogoutIcon />
              Log Out
            </button>
          </div>
        </aside>

        {/* Dimmed backdrop behind the open drawer — tapping it closes the menu */}
        {open && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="md:hidden fixed inset-0 z-30 bg-black/50"
          />
        )}

        {/* ---------------- Content ---------------- */}
        <div className="flex-1 min-w-0">
          {/* Phone header: menu button + brand + avatar */}
          <header className="md:hidden sticky top-0 z-20 flex items-center gap-3 bg-[#17502f] text-white px-4 py-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="h-9 w-9 shrink-0 rounded-lg bg-white/15 flex items-center justify-center hover:bg-white/25 transition"
            >
              <MenuIcon />
            </button>
            <p className="flex-1 text-base font-medium truncate">GlowGuard Admin</p>
            <button
              type="button"
              onClick={() => goTo('/admin/users')}
              aria-label="Account"
              className="h-8 w-8 shrink-0 rounded-full bg-[#008030] flex items-center justify-center text-xs font-semibold"
            >
              {initials(user?.name)}
            </button>
          </header>

          <main className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-20 py-6 md:py-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
