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
import ResetPassword from './pages/ResetPassword'
import Welcome from './pages/Welcome'
import Routine from './pages/Routine'
import Shelf from './pages/Shelf'
import Tracker from './pages/Tracker'
import Account from './pages/Account'
import Recommendations from './pages/Recommendations'
import AdminLayout from './pages/admin/AdminLayout'
import UsersList from './pages/admin/UsersList'
import UserDetails from './pages/admin/UserDetails'
import ConsultantLayout from './pages/consultant/ConsultantLayout'
import RulesList from './pages/consultant/RulesList'
import RuleDetails from './pages/consultant/RuleDetails'
import RuleForm from './pages/consultant/RuleForm'
import CurationList from './pages/consultant/CurationList'
import CurationView from './pages/consultant/CurationView'
import CurationForm from './pages/consultant/CurationForm'


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
// BEAUTY CONSULTANT ROUTE
// Only Beauty Consultant accounts may see this area — it's their own
// role, separate from Admin, with its own login (unique email/password).
// The backend enforces this too (the clash-rules and recommendations write
// endpoints return 403 for non-consultants); this just keeps other roles out of the UI.
// ======================================================

function ConsultantOnly({ children }) {
  const { user, checkingSession } = useApp()

  if (checkingSession) return null
  if (!user) return <Navigate to="/auth" replace />

  if (user.role !== 'consultant') return <Navigate to="/routine" replace />

  return children
}


// ======================================================
// APP LAYOUT
// ======================================================

function AppLayout() {
  const location = useLocation()
  const { darkMode, user } = useApp()

  const isLanding = location.pathname === '/'
  const isAuth = location.pathname === '/auth' || location.pathname === '/reset-password'
  const isWelcome = location.pathname === '/welcome'
  const isAdminArea = location.pathname.startsWith('/admin')
  const isConsultantArea = location.pathname.startsWith('/consultant')

  // The admin and Beauty Consultant areas each have their own sidebar
  // layout instead of the user navbar. On the landing page, a logged-in
  // user still gets the normal app navbar (Home/Shelf/Routine/...) instead
  // of the public marketing nav, so clicking "Home" doesn't dump them out
  // into the logged-out experience.
  const showNavbar = !isAuth && !isAdminArea && !isConsultantArea && (!isLanding || Boolean(user))

  // Dark mode never applies to the Landing page, the Login/Register page,
  // or either sidebar portal.
  const darkAllowed =
    !isLanding &&
    !isAuth &&
    !isWelcome &&
    !isAdminArea &&
    !isConsultantArea

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

          {/* Forgot / reset password (public) */}
          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          {/* First-time onboarding, shown once after a new signup's first login */}
          <Route
            path="/welcome"
            element={
              <Protected>
                <Welcome />
              </Protected>
            }
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

          {/* GlowCouncil recommendations for the person's skin type */}
          <Route
            path="/recommendations"
            element={
              <Protected>
                <Recommendations />
              </Protected>
            }
          />

          {/* Admin area (sidebar layout + nested pages) — User Management only;
              Safety Clash Rules now lives with the Beauty Consultant role below. */}
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
          </Route>

          {/* Beauty Consultant area (its own sidebar layout + nested pages) */}
          <Route
            path="/consultant"
            element={
              <ConsultantOnly>
                <ConsultantLayout />
              </ConsultantOnly>
            }
          >
            <Route index element={<Navigate to="rules" replace />} />
            <Route path="rules" element={<RulesList />} />
            <Route path="rules/new" element={<RuleForm mode="create" />} />
            <Route path="rules/:id" element={<RuleDetails />} />
            <Route path="rules/:id/edit" element={<RuleForm mode="edit" />} />
            <Route path="curation" element={<CurationList />} />
            <Route path="curation/new" element={<CurationForm mode="create" />} />
            <Route path="curation/:id" element={<CurationView />} />
            <Route path="curation/:id/edit" element={<CurationForm mode="edit" />} />
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