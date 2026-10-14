import { useEffect, useMemo, useState } from 'react'
import { fetchRequests, decideRequest } from '../../api/services'
import { useApp } from '../../context/AppContext'
import {
  PageTitle,
  Loading,
  cardCls,
  inputCls,
  btnGreen,
  btnRed,
  formatDate,
  roleLabel,
} from './adminUi'

// Same stat card as User Management, so both pages match in size.
function StatCard({ label, value }) {
  return (
    <div className={`${cardCls} px-3 sm:px-5 py-3 sm:py-4`}>
      <p className="text-xs sm:text-lg lg:text-xl font-semibold leading-tight">{label}</p>
      <p className="mt-1 sm:mt-2 text-center text-3xl sm:text-5xl font-semibold">{value}</p>
    </div>
  )
}

// Sign-up requests from people who chose "Consultant" or "Admin" on the
// sign-up page. They are not listed in User Management until approved here.
export default function RequestsList() {
  const { notify } = useApp()
  const [requests, setRequests] = useState(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('pending')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    fetchRequests()
      .then(setRequests)
      .catch((e) => setError(e.response?.data?.error || 'Could not load requests.'))
  }, [])

  const pendingCount = useMemo(
    () => (requests ?? []).filter((u) => u.status === 'pending').length,
    [requests]
  )

  const rejectedCount = useMemo(
    () => (requests ?? []).filter((u) => u.status === 'rejected').length,
    [requests]
  )

  // The server returns the oldest request first, so nobody waits at the bottom.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (requests ?? [])
      .filter((u) => u.status === status)
      .filter((u) => !q || `${u.name} ${u.email}`.toLowerCase().includes(q))
      .filter((u) => !role || u.role === role)
  }, [requests, search, role, status])

  const decide = async (u, action) => {
    const approve = action === 'approve'
    const question = approve
      ? `Approve ${u.name} as ${roleLabel(u.role)}? ${
          u.role === 'admin'
            ? 'They will get full admin access and can sign in right away.'
            : 'They will be able to sign in right away.'
        }`
      : `Reject ${u.name}'s request? They will not be able to sign in.`
    if (!confirm(question)) return

    setBusyId(u.id)
    try {
      const updated = await decideRequest(u.id, action)
      setRequests((current) => current.map((x) => (x.id === updated.id ? updated : x)))
      notify(approve ? 'Account approved.' : 'Request rejected.', approve)
    } catch (e) {
      notify(e.response?.data?.error || 'Could not update this request.', false)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[95rem]">
      <PageTitle sub="Review consultant and admin sign-up requests.">Requests</PageTitle>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <StatCard label="Pending Requests" value={pendingCount} />
        <StatCard label="Rejected Requests" value={rejectedCount} />
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 mb-5 sm:mb-6">
        <input
          className={`${inputCls} col-span-2 sm:flex-1 sm:min-w-[200px] !py-2`}
          placeholder="Search Requests"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={`${inputCls} sm:!w-auto !py-2`}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          className={`${inputCls} sm:!w-auto !py-2`}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Requested Role</option>
          <option value="consultant">Beauty Consultant</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {!requests && !error && <Loading />}

      {requests && (
        <div>
          <div className="hidden md:grid grid-cols-[2fr_1.2fr_1.2fr_auto] gap-3 px-4 pb-2 text-sm font-semibold">
            <span>Applicant</span>
            <span>Requested Role</span>
            <span>Requested On</span>
            <span className="min-w-[190px]" />
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 -mr-1">
            {filtered.map((u) => (
              <div
                key={u.id}
                className={`${cardCls} px-4 py-3 text-sm
                  grid grid-cols-1 gap-1 items-center
                  md:grid-cols-[2fr_1.2fr_1.2fr_auto] md:gap-3 xl:px-6 xl:gap-4`}
              >
                <span className="min-w-0">
                  <span className="block font-medium truncate">{u.name}</span>
                  <span className="block text-[#3d4a42] truncate">{u.email}</span>
                </span>

                <span>
                  <span
                    className={`inline-block rounded-md px-2.5 py-0.5 text-[11px] font-bold ${
                      u.role === 'admin'
                        ? 'bg-[#41694b] text-white'
                        : 'bg-[#dcf5e3] text-[#0c8a3a]'
                    }`}
                  >
                    {roleLabel(u.role)}
                  </span>
                </span>

                <span className="text-[#3d4a42] md:text-inherit">
                  <span className="md:hidden">Requested </span>
                  {formatDate(u.createdAt)}
                </span>

                <span className="flex flex-wrap gap-2 mt-2 md:mt-0 md:min-w-[190px] md:justify-end">
                  <button
                    className={`${btnGreen} !py-1.5 !text-xs`}
                    onClick={() => decide(u, 'approve')}
                    disabled={busyId === u.id}
                  >
                    Approve
                  </button>
                  {u.status === 'pending' && (
                    <button
                      className={`${btnRed} !py-1.5 !text-xs`}
                      onClick={() => decide(u, 'reject')}
                      disabled={busyId === u.id}
                    >
                      Reject
                    </button>
                  )}
                </span>
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="text-sm text-[#59645d] py-6 text-center">
                {status === 'pending'
                  ? 'No pending requests right now.'
                  : 'No rejected requests.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}