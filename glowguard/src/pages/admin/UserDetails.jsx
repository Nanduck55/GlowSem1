import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchUser, setUserActive } from '../../api/services'
import { useApp } from '../../context/AppContext'
import { PageTitle, StatusBadge, Loading, cardCls, inputCls, btnRed, btnGreen, formatDate } from './adminUi'

export default function UserDetails() {
  const { id } = useParams()
  const { user: me, notify } = useApp()
  const [u, setU] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetchUser(id)
      .then(setU)
      .catch((e) => setError(e.response?.data?.error || 'Could not load this user.'))
  }, [id])

  const toggle = async () => {
    const next = !u.active
    const verb = next ? 'Reactivate' : 'Deactivate'
    if (!confirm(`${verb} ${u.name}'s account?`)) return
    setBusy(true)
    try {
      setU(await setUserActive(u.id, next))
      notify(next ? 'Account reactivated.' : 'Account deactivated.', next)
    } catch (e) {
      notify(e.response?.data?.error || `Could not ${verb.toLowerCase()} account.`, false)
    } finally {
      setBusy(false)
    }
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (!u) return <Loading />

  const isSelf = String(me?.id) === String(u.id)

  return (
    <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[95rem]">
      <PageTitle>User Details</PageTitle>

      <div className="grid lg:grid-cols-[1.35fr_1fr] gap-4 sm:gap-6 lg:gap-8 items-start">
        {/* -------- Account details -------- */}
        <section className={`${cardCls} p-4 sm:p-6`}>
          <h2 className="text-xl sm:text-2xl font-medium mb-4 sm:mb-5">Account Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-x-6 gap-y-4 sm:gap-y-5 sm:items-center">
            <div>
              <p className="text-base sm:text-lg font-medium mb-1">Username</p>
              <input className={inputCls} value={u.name} readOnly />
            </div>
            <div>
              <p className="text-base sm:text-lg font-medium mb-1">Role</p>
              <span className="inline-block rounded-md bg-[#41694b] text-white font-semibold px-4 py-1 capitalize">{u.role}</span>
            </div>
            <div>
              <p className="text-base sm:text-lg font-medium mb-1">Email</p>
              <input className={inputCls} value={u.email} readOnly />
            </div>
            <div>
              <p className="text-base sm:text-lg font-medium mb-1">Status</p>
              <StatusBadge active={u.active} large />
            </div>
          </div>

          <div className="mt-6 sm:mt-7 text-center">
            {u.active ? (
              <button className={btnRed} onClick={toggle} disabled={busy || isSelf}
                      title={isSelf ? 'You cannot deactivate your own account.' : undefined}>
                Deactivate Account
              </button>
            ) : (
              <button className={btnGreen} onClick={toggle} disabled={busy}>Reactivate Account</button>
            )}
          </div>
        </section>

        {/* -------- Profile details -------- */}
        <section className={`${cardCls} p-4 sm:p-6 space-y-3`}>
          <h2 className="text-xl font-medium mb-4">Profile Details</h2>
          <p>Skin Type: <b>{u.skinType || '—'}</b></p>
          <p>Date Joined: <b>{formatDate(u.createdAt)}</b></p>
          <p>Routine Goal: <b>{u.routineGoal || '—'}</b></p>
        </section>
      </div>
    </div>
  )
}
