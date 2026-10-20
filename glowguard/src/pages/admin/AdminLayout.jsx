import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { logoutUser } from '../../api/services'
import PortalProfileMenu from '../../components/PortalProfileMenu'
import BackButton from '../../components/BackButton'

const LogoutIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 shrink-0"
    aria-hidden="true"
  >
    <path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10" />
    <path d="M14 8l4 4-4 4" />
    <path d="M18 12H9" />
  </svg>
)

const MenuIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

const LogoLeafIcon = () => (
  <img src="/Icon1.png" alt="GlowGuard" className="h-8 w-8 shrink-0 object-contain" />
)

const UsersIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 shrink-0"
    aria-hidden="true"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const RequestsIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 shrink-0"
    aria-hidden="true"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M19 8v6M16 11h6" />
  </svg>
)

const StatsIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 shrink-0"
    aria-hidden="true"
  >
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
)

const ChevronRight = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 shrink-0"
    aria-hidden="true"
  >
    <path d="m9 5 7 7-7 7" />
  </svg>
)

const navItems = [
  {
    to: '/admin/users',
    label: 'User Management',
    Icon: UsersIcon,
  },
  {
    to: '/admin/requests',
    label: 'Requests',
    Icon: RequestsIcon,
  },
  {
    to: '/admin/stats',
    label: 'Statistics',
    Icon: StatsIcon,
  },
]

export default function AdminLayout() {
  const { user, setUser, darkMode, toggleDarkMode } = useApp()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const logout = async () => {
    await logoutUser()
    setUser(null)
    navigate('/auth', { replace: true })
  }

  return (
    <div className="gg-admin min-h-screen bg-white text-black">
      {/* Poppins is used by the design; falls back to the system font if offline. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .gg-admin {
          font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>

      <div className="md:flex">
        {/* ================= SIDEBAR ================= */}
        <aside
          className={`
            bg-[#17502f] text-white flex flex-col overflow-hidden
            fixed inset-y-0 left-0 z-40
            w-[82%] max-w-[290px]
            shadow-2xl
            transition-transform duration-200 ease-out
            ${open ? 'translate-x-0' : '-translate-x-full'}
            md:static md:z-auto
            md:w-[260px] lg:w-[280px]
            md:max-w-none md:shrink-0
            md:h-screen md:sticky md:top-0
            md:translate-x-0 md:shadow-none
          `}
        >
          {/* Header */}
          <div className="px-5 sm:px-6 pt-6 pb-5 md:px-6 md:pt-7 md:pb-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex items-center gap-3">
                <LogoLeafIcon />

                <div className="min-w-0">
                  <p className="text-[1.5rem] sm:text-[1.65rem] font-semibold leading-none tracking-tight">
                    GlowGuard
                  </p>
                </div>
              </div>

              {/* Close button — phones only */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="
                  md:hidden
                  h-8 w-8 shrink-0
                  rounded-xl
                  bg-white/10
                  flex items-center justify-center
                  hover:bg-white/20
                  transition
                "
              >
                <CloseIcon />
              </button>
            </div>

            {/* Admin information */}
            <p className="mt-4 text-[13px] sm:text-sm font-medium leading-snug truncate">
              Admin: {user?.name}
            </p>

            <div className="mt-5 h-px bg-white/20" />
          </div>

          {/* Navigation */}
          <nav className="px-3 sm:px-4 md:px-5 flex flex-col gap-2">
            {navItems.map(({ to, label, Icon }, index) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `
                    group relative
                    flex items-center gap-3
                    px-3.5 sm:px-4
                    py-2.5 sm:py-3
                    rounded-xl
                    text-base sm:text-lg
                    font-medium
                    transition

                    ${isActive ? 'bg-white/15' : 'hover:bg-white/10'}

                    ${index === 0 ? 'min-h-[68px]' : 'min-h-[52px]'}
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator */}
                    {isActive && (
                      <span
                        className="
                          absolute
                          left-0
                          top-1/2
                          -translate-y-1/2
                          w-1.5
                          h-16
                          rounded-r-full
                          bg-white/85
                        "
                        aria-hidden="true"
                      />
                    )}

                    {/* Icon circle */}
                    <span
                      className="
                        grid
                        h-10 w-10
                        shrink-0
                        place-items-center
                        rounded-full
                        bg-white/10
                      "
                    >
                      <Icon />
                    </span>

                    {/* Label */}
                    <span className="flex-1 whitespace-nowrap leading-tight text-sm">
                      {label}
                    </span>

                    {/* Active arrow */}
                    {isActive && <ChevronRight />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom logout */}
          <div className="relative mt-auto px-3 sm:px-4 md:px-5 pb-5 pt-12 overflow-hidden">
            {/* Decorative leaf */}
            <div
              className="
                pointer-events-none
                absolute
                -left-8
                -bottom-7
                opacity-20
              "
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 190 170"
                className="w-32 h-28"
                fill="none"
              >
                <path
                  d="M34 167C42 114 72 59 128 19c-3 60-20 108-58 133-13 9-25 14-36 15Z"
                  fill="currentColor"
                />
                <path
                  d="M71 158C59 109 27 72-11 51c5 61 32 100 68 120 6 3 10 6 14 8Z"
                  fill="currentColor"
                  opacity=".75"
                />
              </svg>
            </div>

            <div
              className="
                relative
                rounded-t-[1.5rem]
                hover:bg-white/10 hover:translate-x-1 transition-all duration-200
                md:rounded-[1.5rem]
                bg-[#008030]
                px-4 py-4
                sm:px-5 sm:py-4
              "
            >
              <button
                type="button"
                onClick={logout}
                className="
                  flex
                  items-center
                  gap-2.5
                  text-sm sm:text-base
                  font-medium
                  hover:opacity-90
                  transition
                "
              >
                <LogoutIcon />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ================= MOBILE BACKDROP ================= */}
        {open && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="
              md:hidden
              fixed inset-0
              z-30
              bg-black/50
            "
          />
        )}

        {/* ================= CONTENT ================= */}
        <div className="flex-1 min-w-0">
          {/* Mobile header */}
          <header
            className="
              md:hidden
              sticky top-0 z-20
              flex items-center gap-3
              bg-[#17502f]
              text-white
              px-3 py-2.5
            "
          >
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="
                h-8 w-8
                shrink-0
                rounded-xl
                bg-white/10
                flex items-center justify-center
                hover:bg-white/20
                transition
              "
            >
              <MenuIcon />
            </button>

            <p className="flex-1 text-base font-medium truncate">
              GlowGuard
            </p>

            <PortalProfileMenu
              compact
              user={user}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              onLogout={logout}
            />
          </header>

          {/* Desktop top bar — profile dropdown (phones use the header above) */}
          <header
            className="
              hidden md:flex
              sticky top-0 z-20
              items-center justify-end
              bg-white
              border-b border-gg-100
              px-8 lg:px-10 xl:px-14 2xl:px-20
              py-2.5
            "
          >
            <PortalProfileMenu
              user={user}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              onLogout={logout}
            />
          </header>

          {/* Main content */}
          <main
            className="
              px-4
              sm:px-6
              md:px-8
              lg:px-10
              xl:px-14
              2xl:px-20
              py-6
              md:py-10
            "
          >
            <BackButton />
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}