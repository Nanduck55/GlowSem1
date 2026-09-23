import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { logoutUser, updateProfile } from '../api/services'

// ------------------------------------------------------------------
// helpers
// ------------------------------------------------------------------

function normalizeSkinType(value) {
  if (!value) return ''
  return /skin$/i.test(value) ? value : `${value} Skin`
}

// `createdAt` comes straight from the users table (see auth/me.php).
function formatMemberSince(createdAt) {
  const date = createdAt ? new Date(createdAt) : new Date()
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ------------------------------------------------------------------
// icons
// ------------------------------------------------------------------

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 shrink-0" aria-hidden="true">
    <circle cx="12" cy="7" r="4.5" />
    <path d="M3 21c0-4.4 3.9-7.5 9-7.5s9 3.1 9 7.5v.5a.5.5 0 0 1-.5.5h-17a.5.5 0 0 1-.5-.5V21Z" />
  </svg>
)

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
    <path d="M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
    <path d="m18.4 3.6 2 2a1.4 1.4 0 0 1 0 2L11 17l-4 1 1-4 9.4-9.4a1.4 1.4 0 0 1 2 0Z" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
    <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
    <path d="M15 8l4 4-4 4" />
    <path d="M19 12H9" />
  </svg>
)

// ------------------------------------------------------------------
// small building blocks
// ------------------------------------------------------------------

const pillBase =
  'inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white transition active:scale-[.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-gg-500 focus-visible:ring-offset-2'

function Field({ label, htmlFor, children }) {
  return (
    <div className="min-w-0">
      <label htmlFor={htmlFor} className="mb-1.5 block text-base font-bold text-ink">
        {label}:
      </label>
      {children}
    </div>
  )
}

const Value = ({ children }) => <p className="break-words text-base text-ink">{children}</p>

// ------------------------------------------------------------------
// page
// ------------------------------------------------------------------

export default function Account() {
  const { user, setUser, notify } = useApp()
  const navigate = useNavigate()

  // Skin type comes from the backend now — the Landing page skin quiz
  // saves it there via updateProfile() when the user is logged in.
  const skinType = normalizeSkinType(user?.skinType)
  const memberSince = formatMemberSince(user?.createdAt)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', email: '' })
  const [saving, setSaving] = useState(false)

  const startEdit = () => {
    setForm({
      name: user?.name ?? '',
      email: user?.email ?? '',
    })
    setEditing(true)
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
      })
      setUser(updated)
      setEditing(false)
      notify('Profile updated.')
    } catch (error) {
      notify(error.response?.data?.error || 'Could not update profile.', false)
    } finally {
      setSaving(false)
    }
  }

  const logout = async () => {
    await logoutUser()
    setUser(null)
    navigate('/auth', { replace: true })
  }

  const retakeQuiz = () => {
    navigate('/', { state: { scrollTo: 'quiz' } })
  }

  return (
   <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Account</h1>
      <p className="mt-2 mb-8 text-base text-ink">Manage your profile, skin details, and preferences.</p>

      <form
        onSubmit={save}
        className="account-card rounded-xl border border-[#b7c0b1] bg-[#e2eadb] p-6 shadow-[0_2px_6px_rgba(40,60,45,.22)] sm:p-8"
      >
        {/* ---------------- header: icon, title, actions ---------------- */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-3">
            <UserIcon />
            <h2 className="text-2xl font-semibold text-ink">User Profile</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {editing ? (
              <>
                <button type="submit" disabled={saving} className={`${pillBase} bg-[#3f6f52] hover:bg-[#345c44] disabled:opacity-60`}>
                  <CheckIcon />
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className={`${pillBase} !text-[#3f6f52] border border-[#3f6f52] bg-transparent hover:bg-white/60`}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" onClick={startEdit} className={`${pillBase} bg-[#3f6f52] hover:bg-[#345c44]`}>
                <EditIcon />
                Edit Profile
              </button>
            )}

            <button type="button" onClick={logout} className={`${pillBase} bg-[#f26b6b] hover:bg-[#e25757]`}>
              <LogoutIcon />
              Log Out
            </button>
          </div>
        </div>

        {/* ---------------- details ---------------- */}
        <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-[1fr_1.3fr_1.4fr] lg:pl-10">
          <Field label="Username" htmlFor="acc-name">
            {editing ? (
              <input
                id="acc-name"
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            ) : (
              <Value>{user?.name || '—'}</Value>
            )}
          </Field>

          <Field label="Email" htmlFor="acc-email">
            {editing ? (
              <input
                id="acc-email"
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            ) : (
              <Value>{user?.email || '—'}</Value>
            )}
          </Field>

          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-base font-bold text-ink">Skin Type:</span>
              <button
                type="button"
                onClick={retakeQuiz}
                className={`${pillBase} !px-3 !py-1 !text-[11px] bg-[#3f6f52] hover:bg-[#345c44]`}
              >
                {skinType ? 'Retake Skin Profile Quiz' : 'Take Skin Profile Quiz'}
              </button>
            </div>

            <Value>{skinType || 'Not set yet — take the quiz to find out'}</Value>
          </div>

          <Field label="Member Since">
            <Value>{memberSince}</Value>
          </Field>
        </div>
      </form>
    </div>
  )
}