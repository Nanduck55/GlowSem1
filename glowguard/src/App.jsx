import { useLayoutEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'

import { AppProvider, useApp } from './context/AppContext'

import Navbar from './components/Navbar'

import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Routine from './pages/Routine'
import Shelf from './pages/Shelf'
import Tracker from './pages/Tracker'
import Account from './pages/Account'
import AdminLayout from './pages/admin/AdminLayout'
import UsersList from './pages/admin/UsersList'
import UserDetails from './pages/admin/UserDetails'
import RulesList from './pages/admin/RulesList'
import RuleDetails from './pages/admin/RuleDetails'
import RuleForm from './pages/admin/RuleForm'


// ======================================================
// PROTECTED ROUTE
// ======================================================

function Protected({ children }) {
  const { user, checkingSession } = useApp()

  // Wait for the token → session check to finish before deciding whether
  // to redirect, so a page refresh doesn't briefly kick a logged-in user
  // back to /auth while we're still asking the backend who they are.
  if (checkingSession) {
    return null
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return children
}


// ======================================================
// ADMIN ROUTE
// Only admins may see the admin area. The backend enforces this too
// (admin endpoints return 403 for non-admins); this just keeps regular
// users out of the UI.
// ======================================================

function AdminOnly({ children }) {
  const { user, checkingSession } = useApp()

  if (checkingSession) return null
  if (!user) return <Navigate to="/auth" replace />

  if (user.role !== 'admin') return <Navigate to="/routine" replace />

  return children
}


// ======================================================
// APP LAYOUT
// ======================================================

function AppLayout() {
  const location = useLocation()
  const { darkMode, user } = useApp()

  const isLanding = location.pathname === '/'
  const isAuth = location.pathname === '/auth'
  const isAdminArea = location.pathname.startsWith('/admin')

  // The admin area has its own sidebar layout instead of the user navbar.
  // On the landing page, a logged-in user still gets the normal app navbar
  // (Home/Shelf/Routine/...) instead of the public marketing nav, so
  // clicking "Home" doesn't dump them out into the logged-out experience.
  const showNavbar = !isAuth && !isAdminArea && (!isLanding || Boolean(user))

  // Dark mode never applies to the Landing page or the Login/Register page.
  // useLayoutEffect so the class is removed before paint (no dark flash on navigation).
  const darkAllowed = !isLanding && !isAuth && !isAdminArea

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode && darkAllowed)
  }, [darkMode, darkAllowed])

  return (
    <>
      {showNavbar && <Navbar />}

      <main
        className={
          showNavbar
            ? 'min-h-[calc(100vh-64px)]'
            : ''
        }
      >
        <Routes>

          {/* Landing Page */}
          <Route
            path="/"
            element={<Landing />}
          />

          {/* Login / Register */}
          <Route
            path="/auth"
            element={<Auth />}
          />

          {/* Protected Pages */}
          <Route
            path="/routine"
            element={
              <Protected>
                <Routine />
              </Protected>
            }
          />

          <Route
            path="/shelf"
            element={
              <Protected>
                <Shelf />
              </Protected>
            }
          />

          <Route
            path="/tracker"
            element={
              <Protected>
                <Tracker />
              </Protected>
            }
          />

          <Route
            path="/account"
            element={
              <Protected>
                <Account />
              </Protected>
            }
          />

          {/* Admin area (sidebar layout + nested pages) */}
          <Route
            path="/admin"
            element={
              <AdminOnly>
                <AdminLayout />
              </AdminOnly>
            }
          >
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<UsersList />} />
            <Route path="users/:id" element={<UserDetails />} />
            <Route path="rules" element={<RulesList />} />
            <Route path="rules/new" element={<RuleForm mode="create" />} />
            <Route path="rules/:id" element={<RuleDetails />} />
            <Route path="rules/:id/edit" element={<RuleForm mode="edit" />} />
          </Route>

          {/* Unknown URL */}
          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>
      </main>
    </>
  )
}


// ======================================================
// MAIN APP
// ======================================================

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AppProvider>
  )
}